using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.V2.Business.Document;
using AWMSModel.Constant.EnumConst;
using AWMSEngine.APIService;
using AWMSModel.Entity;
using AMWUtil.Exception;
using AWMSModel.Criteria;
using AWMSEngine.ADO;
using AMWUtil.Logger;

namespace AWMSEngine.APIService.V2.Document
{

    public class CloseDocumentManualAPI : BaseAPIService
    {
        public CloseDocumentManualAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        public class TReq
        {
            public List<long> docIDs;
        }

        protected override dynamic ExecuteEngineManual()
        {
            List<long> docLists = new List<long>();

            TReq reqDoc = AMWUtil.Common.ObjectUtil.DynamicToModel<TReq>(this.RequestVO);
            reqDoc.docIDs.ForEach(doc =>
            {
                var docs = AWMSEngine.ADO.DocumentADO.GetInstant().Get(doc, this.BuVO);
                if (docs != null)
                {

                    if (docs.EventStatus == DocumentEventStatus.NEW)
                    {
                        //เอา error ไปเก็บไว้ใน options
                        BuVO.FinalLogDocMessage.Add(new AWMSModel.Criteria.FinalDatabaseLogCriteria.DocumentOptionMessage(
                            docs.ID.Value, null, null, "Document Eventstatus is NEW"
                        ));
                    }
                    else if (docs.EventStatus == DocumentEventStatus.WORKING)
                    {
                        this.BeginTransaction();
                        var resWorked = this.workedDoc(doc);
                        //var resWorked = new WorkedDocument().Execute(this.Logger, this.BuVO, new WorkedDocument.TReq() { docIDs = new List<long> { doc } });

                        if (resWorked.Count > 0)
                        {
                            if (docs.DocumentType_ID == DocumentTypeID.GOODS_RECEIVE || docs.DocumentType_ID == DocumentTypeID.GOODS_ISSUE)
                            {
                                //var docParent = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_Document>(dataDoc.ParentDocument_ID, this.BuVO);
                                var listChilds = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_Document>(
                                                    new SQLConditionCriteria[] {
                                                new SQLConditionCriteria("ParentDocument_ID",docs.ID, SQLOperatorType.EQUALS),
                                                    }, this.BuVO);

                                foreach (var listChild in listChilds)
                                {
                                    this.BeginTransaction();
                                    var resClosing = new ClosingDocument().Execute(this.Logger, this.BuVO, new List<long> { listChild.ID.Value });
                                    this.CommitTransaction();

                                    if (resClosing.Count > 0)
                                    {
                                        this.BeginTransaction();
                                        var resClosed = new ClosedDocument().Execute(this.Logger, this.BuVO, resClosing);
                                        docLists.AddRange(resClosed);
                                        this.CommitTransaction();

                                    }
                                }
                            }
                            else
                            {
                                this.BeginTransaction();
                                var resClosing = new ClosingDocument().Execute(this.Logger, this.BuVO, resWorked);
                                this.CommitTransaction();

                                if (resClosing.Count > 0)
                                {
                                    this.BeginTransaction();
                                    var resClosed = new ClosedDocument().Execute(this.Logger, this.BuVO, resClosing);
                                    docLists.AddRange(resClosed);
                                    this.CommitTransaction();

                                }
                            }
                        }
                    }
                    else if (docs.EventStatus == DocumentEventStatus.WORKED)
                    {
                        if (docs.DocumentType_ID == DocumentTypeID.GOODS_RECEIVE || docs.DocumentType_ID == DocumentTypeID.GOODS_ISSUE)
                        {
                            //var docParent = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_Document>(dataDoc.ParentDocument_ID, this.BuVO);
                            var listChilds = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_Document>(
                                                new SQLConditionCriteria[] {
                                                new SQLConditionCriteria("ParentDocument_ID",docs.ID, SQLOperatorType.EQUALS),
                                                }, this.BuVO);

                            foreach (var listChild in listChilds)
                            {
                                this.BeginTransaction();
                                var resClosing = new ClosingDocument().Execute(this.Logger, this.BuVO, new List<long> { listChild.ID.Value});
                                this.CommitTransaction();

                                if (resClosing.Count > 0)
                                {
                                    this.BeginTransaction();
                                    var resClosed = new ClosedDocument().Execute(this.Logger, this.BuVO, resClosing);
                                    docLists.AddRange(resClosed);
                                    this.CommitTransaction();

                                }
                            }
                        }
                        else
                        {
                            this.BeginTransaction();
                            var resClosing = new ClosingDocument().Execute(this.Logger, this.BuVO, new List<long> { doc });
                            this.CommitTransaction();

                            if (resClosing.Count > 0)
                            {
                                this.BeginTransaction();
                                var resClosed = new ClosedDocument().Execute(this.Logger, this.BuVO, resClosing);
                                docLists.AddRange(resClosed);
                                this.CommitTransaction();

                            }
                        }


                    }
                    else if (docs.EventStatus == DocumentEventStatus.CLOSING)
                    {
                        if (docs.DocumentType_ID == DocumentTypeID.GOODS_RECEIVE || docs.DocumentType_ID == DocumentTypeID.GOODS_ISSUE)
                        {
                            //var docParent = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_Document>(dataDoc.ParentDocument_ID, this.BuVO);
                            var listChilds = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_Document>(
                                                new SQLConditionCriteria[] {
                                                new SQLConditionCriteria("ParentDocument_ID",docs.ID, SQLOperatorType.EQUALS),
                                                }, this.BuVO);

                            foreach (var listChild in listChilds)
                            {
                                this.BeginTransaction();
                                var resClosed = new ClosedDocument().Execute(this.Logger, this.BuVO, new List<long> { listChild.ID.Value });
                                docLists.AddRange(resClosed);
                                this.CommitTransaction();
                            }
                        }
                        else
                        {
                            this.BeginTransaction();
                            var resClosed = new ClosedDocument().Execute(this.Logger, this.BuVO, new List<long> { doc });
                            docLists.AddRange(resClosed);
                            this.CommitTransaction();
                        }

                    }

                }

            });
                return docLists;    

        }
        private List<long> workedDoc(long doc)
        {
            List<long> docLists = new List<long>();
            var docsData = AWMSEngine.ADO.DocumentADO.GetInstant().Get(doc, this.BuVO);
            if (docsData != null)
            {
                if (docsData.DocumentType_ID == DocumentTypeID.GOODS_RECEIVE || docsData.DocumentType_ID == DocumentTypeID.GOODS_ISSUE)
                {
                    //var docParent = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_Document>(dataDoc.ParentDocument_ID, this.BuVO);
                    var listDocChild = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_Document>(
                                        new SQLConditionCriteria[] {
                                                new SQLConditionCriteria("ParentDocument_ID",docsData.ID, SQLOperatorType.EQUALS),
                                        }, this.BuVO);

                    foreach (var docChild in listDocChild)
                    {
                        this.checkStoDocument(docChild, this.BuVO);

                        AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(docChild.ID.Value, null, null, DocumentEventStatus.WORKED, this.BuVO);
                        var listChild = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_Document>(
                            new SQLConditionCriteria[] {
                                new SQLConditionCriteria("ParentDocument_ID",docsData.ID, SQLOperatorType.EQUALS),
                            }, this.BuVO);

                        //var getParentDoc = ADO.DocumentADO.GetInstant().GetDocumentAndDocItems(docChild.ParentDocument_ID.Value, this.BuVO);
                        if (listChild.TrueForAll(z => z.EventStatus == DocumentEventStatus.WORKED))
                        {
                            ADO.DocumentADO.GetInstant().UpdateStatusToChild(docChild.ParentDocument_ID.Value, DocumentEventStatus.WORKING, null, DocumentEventStatus.WORKED, this.BuVO);
                            docLists.Add(docsData.ID.Value);
                        }




                        //var grDocItem = ADO.DocumentADO.GetInstant().ListItem(docChild.ID.Value, this.BuVO);
                        //grDocItem.ForEach(x =>
                        //{
                        //    x.EventStatus = DocumentEventStatus.WORKED;
                        //    ADO.DocumentADO.GetInstant().UpdateItemEventStatus(x.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                        //});
                        //if (grDocItem.TrueForAll(y => y.EventStatus == DocumentEventStatus.WORKED))
                        //{
                        //    docsData.EventStatus = DocumentEventStatus.WORKED;
                        //    ADO.DocumentADO.GetInstant().UpdateEventStatus(docsData.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                        //    docLists.Add(docsData.ID.Value);
                        //}
                    }
                }
                else
                {
                    this.checkStoDocument(docsData, this.BuVO);
                    var grDocItem = ADO.DocumentADO.GetInstant().ListItem(docsData.ID.Value, this.BuVO);
                    grDocItem.ForEach(x =>
                    {
                        x.EventStatus = DocumentEventStatus.WORKED;
                        ADO.DocumentADO.GetInstant().UpdateItemEventStatus(x.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                    });
                    if (grDocItem.TrueForAll(y => y.EventStatus == DocumentEventStatus.WORKED))
                    {
                        docsData.EventStatus = DocumentEventStatus.WORKED;
                        ADO.DocumentADO.GetInstant().UpdateEventStatus(docsData.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                        docLists.Add(docsData.ID.Value);
                    }
                }
            }
            return docLists;
        }
        private void checkStoDocument(amt_Document dataDoc, VOCriteria buVO)
        {
            List<amt_StorageObject> ItemsSto = new List<amt_StorageObject>();
            var grDocItem = ADO.DocumentADO.GetInstant().ListItem(dataDoc.ID.Value, this.BuVO);

            var baseInDoc = AWMSEngine.ADO.StorageObjectADO.GetInstant().ListBaseInDoc(dataDoc.ID.Value, null, dataDoc.DocumentType_ID, this.BuVO);

            baseInDoc.ForEach(x =>
            {
                var pallet = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(x.rootCode, null, null, false, true, this.BuVO);

                var ckPallet = pallet.mapstos.TrueForAll(x =>
                    x.eventStatus == StorageObjectEventStatus.NEW
                   || x.eventStatus == StorageObjectEventStatus.RECEIVED
                   || x.eventStatus == StorageObjectEventStatus.PICKED
                   || x.eventStatus == StorageObjectEventStatus.AUDITED
                   || x.eventStatus == StorageObjectEventStatus.COUNTED);

                if (ckPallet == false)
                    throw new AMWException(Logger, AMWExceptionCode.V2002, x.rootCode + " กำลังทำงาน");
                // BuVO.FinalLogDocMessage.Add(new AWMSModel.Criteria.FinalDatabaseLogCriteria.DocumentOptionMessage(
                //dataDoc.ID.Value, null, null, x.rootCode+ " กำลังทำงาน"));

            });

            grDocItem.ForEach(item =>
            {
                ItemsSto = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(
                   new SQLConditionCriteria[] {
                               new SQLConditionCriteria("EventStatus",DocumentEventStatus.NEW,SQLOperatorType.EQUALS),
                               new SQLConditionCriteria("Options","%_docitem_id="+item.ID+"%", SQLOperatorType.LIKE),
                   }, this.BuVO);

                if (ItemsSto != null)
                {
                    ItemsSto.ForEach(x =>
                    {
                        ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(x.ParentStorageObject_ID.Value, null, null, StorageObjectEventStatus.REMOVED, this.BuVO);

                        var disto = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                         new SQLConditionCriteria[] {
                                new SQLConditionCriteria("Sou_StorageObject_ID",x.ID, SQLOperatorType.EQUALS),
                                new SQLConditionCriteria("Status",EntityStatus.INACTIVE, SQLOperatorType.EQUALS),
                         }, this.BuVO).FirstOrDefault();

                        disto.Status = EntityStatus.REMOVE;
                        DistoADO.GetInstant().Update(disto, this.BuVO);
                    });

                }

            });

        }


    }
}