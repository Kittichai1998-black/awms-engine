using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.V2.Business.Document;
using AMSModel.Constant.EnumConst;
using AWMSEngine.APIService;
using AMSModel.Entity;
using AMWUtil.Exception;
using AMSModel.Criteria;
using ADO.WMSDB;
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
            public string remark;
        }

        protected override dynamic ExecuteEngineManual()
        {
            List<long> docLists = new List<long>();

            TReq reqDoc = AMWUtil.Common.ObjectUtil.DynamicToModel<TReq>(this.RequestVO);
            reqDoc.docIDs.ForEach(doc =>
            {
                var docs = ADO.WMSDB.DocumentADO.GetInstant().Get(doc, this.BuVO);
                ADO.WMSDB.DataADO.GetInstant().UpdateByID<amt_Document>(doc, this.BuVO,
                    new KeyValuePair<string, object>[]
                    {
                        new KeyValuePair<string, object>("remark",reqDoc.remark)
                    });


                if (docs != null)
                {

                    if (docs.EventStatus == DocumentEventStatus.NEW)
                    {
                        //เอา error ไปเก็บไว้ใน options
                        //BuVO.FinalLogDocMessage.Add(new AWMSModel.Criteria.FinalDatabaseLogCriteria.DocumentOptionMessage(
                        //    docs.ID.Value, null, null, "Document Eventstatus is NEW"
                        //));

                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "สถานะเอกสารเป็น New ไม่สามารถ Close เอกสารได้");
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
                                var listChilds = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
                                    new SQLConditionCriteria[] {
                                        new SQLConditionCriteria("ParentDocument_ID",docs.ID, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("Status",2, SQLOperatorType.NOTEQUALS),
                                    }, this.BuVO);

                                //var checkDoc = listChilds.TrueForAll(x => x.EventStatus == DocumentEventStatus.CLOSED || x.EventStatus == DocumentEventStatus.WORKED);
                                if (listChilds.TrueForAll(x => x.EventStatus == DocumentEventStatus.CLOSED))
                                {
                                    ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(docs.ID.Value, DocumentEventStatus.WORKED, null, DocumentEventStatus.CLOSING, this.BuVO);
                                    ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(docs.ID.Value, DocumentEventStatus.CLOSING, null, DocumentEventStatus.CLOSED, this.BuVO);


                                }
                                else
                                {
                                    //var findlistChild = listChilds.FindAll(x => x.EventStatus != DocumentEventStatus.NEW);

                                    foreach (var listChild in listChilds)
                                    {
                                        if (listChild.EventStatus == DocumentEventStatus.NEW)
                                        {
                                            ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(listChild.ID.Value, DocumentEventStatus.NEW, null, DocumentEventStatus.REJECTED, this.BuVO);
                                            this.checkStoDocument(listChild, this.BuVO);
                                        }
                                        else if (listChild.EventStatus == DocumentEventStatus.WORKED)
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
                                        else if (listChild.EventStatus == DocumentEventStatus.CLOSING)
                                        {
                                            this.BeginTransaction();
                                            var resClosed = new ClosedDocument().Execute(this.Logger, this.BuVO, new List<long> { listChild.ID.Value });
                                            docLists.AddRange(resClosed);
                                            this.CommitTransaction();
                                        }

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
                                var parent = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
                                   new SQLConditionCriteria[] {
                                        new SQLConditionCriteria("ID",docs.ParentDocument_ID, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("Status",2, SQLOperatorType.NOTEQUALS),
                                   }, this.BuVO).FirstOrDefault();
                                if (parent != null)
                                {
                                    var listChildsParent = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
                                      new SQLConditionCriteria[] {
                                        new SQLConditionCriteria("ParentDocument_ID",parent.ID, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("Status",2, SQLOperatorType.NOTEQUALS),
                                      }, this.BuVO);

                                    var checkDocParent = listChildsParent.TrueForAll(x => x.EventStatus == DocumentEventStatus.CLOSED);
                                    if (checkDocParent)
                                    {
                                        if (parent.EventStatus == DocumentEventStatus.CLOSING)
                                        {
                                            ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(parent.ID.Value, DocumentEventStatus.CLOSED, this.BuVO);
                                        }
                                        else
                                        {
                                            ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(parent.ID.Value, DocumentEventStatus.CLOSING, this.BuVO);
                                            ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(parent.ID.Value, DocumentEventStatus.CLOSED, this.BuVO);
                                        }
                                    }
                                }
                            }

                        }



                    }
                    else if (docs.EventStatus == DocumentEventStatus.WORKED)
                    {
                        var listChilds = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
                            new SQLConditionCriteria[] {
                                new SQLConditionCriteria("ParentDocument_ID",docs.ID, SQLOperatorType.EQUALS),
                                new SQLConditionCriteria("Status",2, SQLOperatorType.NOTEQUALS),
                            }, this.BuVO);
                        if (docs.DocumentType_ID == DocumentTypeID.GOODS_RECEIVE || docs.DocumentType_ID == DocumentTypeID.GOODS_ISSUE)
                        {
                            if (listChilds.TrueForAll(x => x.EventStatus == DocumentEventStatus.CLOSED))
                            {
                                ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(docs.ID.Value, DocumentEventStatus.WORKED, null, DocumentEventStatus.CLOSING, this.BuVO);
                                ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(docs.ID.Value, DocumentEventStatus.CLOSING, null, DocumentEventStatus.CLOSED, this.BuVO);

                            }
                            else
                            {

                                foreach (var listChild in listChilds)
                                {
                                    if (listChild.EventStatus == DocumentEventStatus.NEW)
                                    {
                                        ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(listChild.ID.Value, DocumentEventStatus.NEW, null, DocumentEventStatus.REJECTED, this.BuVO);
                                        this.checkStoDocument(listChild, this.BuVO);
                                    }
                                    else
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
                            var parent = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
                                 new SQLConditionCriteria[] {
                                    new SQLConditionCriteria("ID",docs.ParentDocument_ID, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("Status",2, SQLOperatorType.NOTEQUALS),
                                 }, this.BuVO).FirstOrDefault();
                            if (parent != null)
                            {
                                var listChildsParent = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
                                new SQLConditionCriteria[] {
                                        new SQLConditionCriteria("ParentDocument_ID",parent.ID, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("Status",2, SQLOperatorType.NOTEQUALS),
                                }, this.BuVO);

                                if (listChildsParent.TrueForAll(x => x.EventStatus == DocumentEventStatus.CLOSED))
                                {

                                    //ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(parent.ID.Value, DocumentEventStatus.CLOSING, this.BuVO);
                                    //ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(parent.ID.Value, DocumentEventStatus.CLOSED, this.BuVO);
                                    if (parent.EventStatus == DocumentEventStatus.WORKED)
                                    {
                                        ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(parent.ID.Value, DocumentEventStatus.WORKED, null, DocumentEventStatus.CLOSING, this.BuVO);
                                        ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(parent.ID.Value, DocumentEventStatus.CLOSING, null, DocumentEventStatus.CLOSED, this.BuVO);
                                    }
                                    else if (parent.EventStatus == DocumentEventStatus.CLOSING)
                                    {
                                        ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(parent.ID.Value, DocumentEventStatus.CLOSING, null, DocumentEventStatus.CLOSED, this.BuVO);
                                    }
                                }
                            }
                        }
                    }
                    else if (docs.EventStatus == DocumentEventStatus.CLOSING)
                    {
                        if (docs.DocumentType_ID == DocumentTypeID.GOODS_RECEIVE || docs.DocumentType_ID == DocumentTypeID.GOODS_ISSUE)
                        {
                            //var docParent = ADO.WMSDB.DataADO.GetInstant().SelectByID<amt_Document>(dataDoc.ParentDocument_ID, this.BuVO);
                            var listChilds = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
                                                new SQLConditionCriteria[] {
                                                new SQLConditionCriteria("ParentDocument_ID",docs.ID, SQLOperatorType.EQUALS),
                                                new SQLConditionCriteria("Status",2, SQLOperatorType.NOTEQUALS),
                                                }, this.BuVO);
                            //var checkDoc = listChilds.TrueForAll(x => x.EventStatus == DocumentEventStatus.CLOSED || x.EventStatus == DocumentEventStatus.WORKED);
                            if (listChilds.TrueForAll(x => x.EventStatus == DocumentEventStatus.CLOSED))
                            {
                                //ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(docs.ID.Value, DocumentEventStatus.CLOSING, this.BuVO);
                                //ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(docs.ID.Value, DocumentEventStatus.CLOSED, this.BuVO);

                                ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(docs.ID.Value, DocumentEventStatus.CLOSING, null, DocumentEventStatus.CLOSED, this.BuVO);

                            }
                            else
                            {
                                foreach (var listChild in listChilds)
                                {
                                    if (listChild.EventStatus == DocumentEventStatus.NEW)
                                    {
                                        ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(listChild.ID.Value, DocumentEventStatus.NEW, null, DocumentEventStatus.REJECTED, this.BuVO);
                                        this.checkStoDocument(listChild, this.BuVO);
                                    }
                                    else if (listChild.EventStatus == DocumentEventStatus.WORKED)
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
                                    else if (listChild.EventStatus == DocumentEventStatus.CLOSING)
                                    {
                                        this.BeginTransaction();
                                        var resClosed = new ClosedDocument().Execute(this.Logger, this.BuVO, new List<long> { listChild.ID.Value });
                                        docLists.AddRange(resClosed);
                                        this.CommitTransaction();
                                    }
                                }
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
            var docsData = ADO.WMSDB.DocumentADO.GetInstant().Get(doc, this.BuVO);
            if (docsData != null)
            {
                if (docsData.DocumentType_ID == DocumentTypeID.GOODS_RECEIVE || docsData.DocumentType_ID == DocumentTypeID.GOODS_ISSUE)
                {
                    //get PA / PK
                    var listDocChild = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
                                        new SQLConditionCriteria[] {
                                                new SQLConditionCriteria("ParentDocument_ID",docsData.ID, SQLOperatorType.EQUALS),
                                                new SQLConditionCriteria("Status",2, SQLOperatorType.NOTEQUALS),
                                        }, this.BuVO);

                    foreach (var docChild in listDocChild)
                    {
                        this.checkStoDocument(docChild, this.BuVO);

                        if (docChild.EventStatus == DocumentEventStatus.NEW)
                        {
                            docChild.EventStatus = DocumentEventStatus.REJECTED;
                            ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(docChild.ID.Value, DocumentEventStatus.NEW, null, DocumentEventStatus.REJECTED, this.BuVO);
                        }
                        else if (docChild.EventStatus == DocumentEventStatus.WORKING)
                        {
                            docChild.EventStatus = DocumentEventStatus.WORKED;
                            ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(docChild.ID.Value, DocumentEventStatus.WORKING, null, DocumentEventStatus.WORKED, this.BuVO);
                        }

                    }
                    if (listDocChild.Any(z => z.EventStatus == DocumentEventStatus.WORKED || z.EventStatus == DocumentEventStatus.CLOSING || z.EventStatus == DocumentEventStatus.CLOSED))
                    {
                        ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(docsData.ID.Value, DocumentEventStatus.WORKING, null, DocumentEventStatus.WORKED, this.BuVO);

                        docLists.Add(docsData.ID.Value);
                    }
                }
                else
                {
                    this.checkStoDocument(docsData, this.BuVO);
                    var grDocItem = ADO.WMSDB.DocumentADO.GetInstant().ListItem(docsData.ID.Value, this.BuVO);
                    grDocItem.ForEach(x =>
                    {
                        x.EventStatus = DocumentEventStatus.WORKED;
                        ADO.WMSDB.DocumentADO.GetInstant().UpdateItemEventStatus(x.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                    });
                    if (grDocItem.TrueForAll(y => y.EventStatus == DocumentEventStatus.WORKED))
                    {
                        docsData.EventStatus = DocumentEventStatus.WORKED;
                        ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(docsData.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                        docLists.Add(docsData.ID.Value);
                    }
                }
            }
            return docLists;
        }
        private void checkStoDocument(amt_Document dataDoc, VOCriteria buVO)
        {
            List<amt_StorageObject> ItemsSto = new List<amt_StorageObject>();
            var grDocItem = ADO.WMSDB.DocumentADO.GetInstant().ListItemAndDisto(dataDoc.ID.Value, this.BuVO);


            var baseInDoc = ADO.WMSDB.StorageObjectADO.GetInstant().ListBaseInDoc(dataDoc.ID.Value, null, dataDoc.DocumentType_ID, this.BuVO);

            baseInDoc.ForEach(x =>
            {
                var pallet = ADO.WMSDB.StorageObjectADO.GetInstant().Get(x.rootCode, null, null, false, true, this.BuVO);
                if (pallet != null)
                {
                    var ckPallet = pallet.mapstos.TrueForAll(x =>
                        x.eventStatus == StorageObjectEventStatus.PACK_NEW
                       || x.eventStatus == StorageObjectEventStatus.PACK_RECEIVED
                       || x.eventStatus == StorageObjectEventStatus.PACK_PICKED
                       || x.eventStatus == StorageObjectEventStatus.PACK_AUDITED
                       || x.eventStatus == StorageObjectEventStatus.PACK_COUNTED);

                    if (ckPallet == false)
                        throw new AMWException(Logger, AMWExceptionCode.V2002, x.rootCode + " กำลังทำงาน");
                }
            });
            if (grDocItem != null && grDocItem.Count() > 0)
            {
                grDocItem.ForEach(item =>
                {
                    item.DocItemStos.ForEach(disto =>
                    {
                        if (disto.Status == EntityStatus.INACTIVE)
                        {
                            var packsto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(disto.Sou_StorageObject_ID, StorageObjectType.PACK, false, false, BuVO);
                            if (packsto != null)
                            {
                                if (packsto.eventStatus == StorageObjectEventStatus.PACK_NEW)
                                {
                                    ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatusToChild(packsto.parentID.Value, null, null, StorageObjectEventStatus.PACK_REMOVED, this.BuVO);

                                    disto.Status = EntityStatus.REMOVE;
                                    DistoADO.GetInstant().Update(disto, this.BuVO);
                                }
                            }

                        }

                    });

                });
            }
        }


    }
}