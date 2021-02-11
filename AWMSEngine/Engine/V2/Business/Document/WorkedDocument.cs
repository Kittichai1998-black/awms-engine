using AMWUtil.Exception;
using AMWUtil.Common;
using AWMSEngine.APIService.V2.ASRS;
using AMSModel.Constant.StringConst;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Document
{
    public class WorkedDocument : BaseEngine<WorkedDocument.TReq, List<long>>
    {
        public class TReq
        {
            public List<long> docIDs;
            public bool flag = true;
        }
        protected override List<long> ExecuteEngine(TReq reqVO)
        {
            List<long> res = null;// this.ExectProject<TReq, List<long>>(FeatureCode.EXEWM_DoneQueueWorked, reqVO);
            if (res == null)
            {
                var docLists = new List<long>();
                reqVO.docIDs.ForEach(x =>
                {

                    var docs = ADO.WMSDB.DocumentADO.GetInstant().Get(x, this.BuVO);

                    if (docs != null)
                    {
                        try
                        {
                            if (docs.EventStatus == DocumentEventStatus.WORKING)
                            {
                                docs.DocumentItems = ADO.WMSDB.DocumentADO.GetInstant().ListItemAndDisto(x, this.BuVO);
                                if (docs.DocumentItems == null)
                                {
                                    this.BuVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                                    {
                                        docID = x,
                                        msgError = "Document Items Not Found."
                                    });
                                }

                                docs.DocumentItems.ForEach(y =>
                                {
                                    if (y.DocItemStos == null || y.DocItemStos.Count() == 0)
                                    {
                                        if (docs.DocumentType_ID == DocumentTypeID.PICKING)
                                        {
                                            y.EventStatus = DocumentEventStatus.WORKED;
                                            ADO.WMSDB.DocumentADO.GetInstant().UpdateItemEventStatus(y.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                                        }
                                    }
                                    else
                                    {
                                        if (docs.DocumentType_ID == DocumentTypeID.PHYSICAL_COUNT || docs.DocumentType_ID == DocumentTypeID.AUDIT)
                                        {
                                            if (y.DocItemStos.TrueForAll(z => z.Status == EntityStatus.DONE))
                                            {
                                                y.EventStatus = DocumentEventStatus.WORKED;
                                                ADO.WMSDB.DocumentADO.GetInstant().UpdateItemEventStatus(y.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                                            }
                                        }
                                        else
                                        {

                                            if (docs.DocumentType_ID == DocumentTypeID.PICKING)
                                            {
                                                if (y.DocItemStos.TrueForAll(z => z.Status == EntityStatus.DONE))
                                                {
                                                    y.EventStatus = DocumentEventStatus.WORKED;
                                                    ADO.WMSDB.DocumentADO.GetInstant().UpdateItemEventStatus(y.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                                                }
                                            }
                                            else if (docs.DocumentType_ID == DocumentTypeID.PUTAWAY)
                                            {
                                                if (y.BaseQuantity != null)
                                                {
                                                    decimal sumQtyDisto = y.DocItemStos.Where(z => z.DocumentItem_ID == y.ID && z.Status == EntityStatus.DONE).Sum(z => z.BaseQuantity ?? 0);
                                                    decimal totalQty = y.BaseQuantity ?? 0;
                                                    if (sumQtyDisto == totalQty)
                                                    {
                                                        y.EventStatus = DocumentEventStatus.WORKED;
                                                        ADO.WMSDB.DocumentADO.GetInstant().UpdateItemEventStatus(y.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                                                    }
                                                }
                                                else
                                                {
                                                    if (y.DocItemStos.TrueForAll(z => z.Status == EntityStatus.DONE))
                                                    {
                                                        y.EventStatus = DocumentEventStatus.WORKED;
                                                        ADO.WMSDB.DocumentADO.GetInstant().UpdateItemEventStatus(y.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                                                    }
                                                }

                                            }
                                        }
                                    }

                                });
                                if (docs.DocumentItems.TrueForAll(y => y.EventStatus == DocumentEventStatus.WORKED))
                                {
                                    docs.EventStatus = DocumentEventStatus.WORKED;
                                    ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(x, DocumentEventStatus.WORKED, this.BuVO);
                                    RemoveOPTDocument(x, docs.Options, this.BuVO);
                                    docLists.Add(x);
                                }

                                if (docs.ParentDocument_ID != null)
                                {
                                    var getParentDoc = ADO.WMSDB.DocumentADO.GetInstant().GetDocumentAndDocItems(docs.ParentDocument_ID.Value, this.BuVO);
                                    if (getParentDoc == null)
                                    {
                                        throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "Document Not Found");
                                    }

                                    var ParentDoc = docs.DocumentItems.GroupBy(
                                        p => p.ParentDocumentItem_ID, (key, g) => new { ParentItemID = key, DocItems = g.ToList() }).ToList();

                                    ParentDoc.ForEach(group => {

                                        var parentDocItem = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItem>(new SQLConditionCriteria[] {
                                            new SQLConditionCriteria("ParentDocumentItem_ID",group.ParentItemID.Value, SQLOperatorType.EQUALS),
                                            new SQLConditionCriteria("EventStatus", DocumentEventStatus.NEW, SQLOperatorType.NOTEQUALS),
                                            new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS),
                                        }, this.BuVO);


                                        if (group.DocItems.TrueForAll(xx => xx.EventStatus == DocumentEventStatus.WORKED))
                                        {
                                            var qrItems = getParentDoc.DocumentItems.Find(y => y.ID == group.ParentItemID);
                                            if (qrItems.BaseQuantity != null)
                                            {
                                                if (qrItems != null && parentDocItem != null && qrItems.BaseQuantity == parentDocItem.Sum(y => y.BaseQuantity))
                                                {
                                                    qrItems.EventStatus = DocumentEventStatus.WORKED;
                                                    ADO.WMSDB.DocumentADO.GetInstant().UpdateItemEventStatus(qrItems.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                                                }
                                            }
                                            else
                                            {
                                                qrItems.EventStatus = DocumentEventStatus.WORKED;
                                                ADO.WMSDB.DocumentADO.GetInstant().UpdateItemEventStatus(qrItems.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                                            }
                                        }

                                    });

                                    if (getParentDoc.DocumentItems.TrueForAll(xx => xx.EventStatus == DocumentEventStatus.WORKED))
                                    {
                                        ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(docs.ParentDocument_ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                                    }
                                }
                            }
                            else
                            {
                                this.BuVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                                {
                                    docID = x,
                                    msgError = "Status of document didn't 'WORKING'."
                                });
                            }
                        }
                        catch (Exception ex)
                        {
                            this.BuVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                            {
                                docID = x,
                                msgError = ex.Message
                            });
                            this.Logger.LogError(ex.Message);
                        }
                    }
                    else
                    {
                        throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "Document Not Found");
                    }
                });
                res = docLists;
            }

            return res;
        }
        private void RemoveOPTDocument(long docID, string options, VOCriteria buVO)
        {
            //remove 
            var listkeyRoot = ObjectUtil.QryStrToKeyValues(options);
            var opt_done = "";

            if (listkeyRoot != null && listkeyRoot.Count > 0)
            {
                listkeyRoot.RemoveAll(x => x.Key.Equals(OptionVOConst.OPT_ERROR));
                opt_done = ObjectUtil.ListKeyToQryStr(listkeyRoot);
            }

            ADO.WMSDB.DataADO.GetInstant().UpdateByID<amt_Document>(docID, buVO,
                    new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("Options", opt_done)
                    });
        }
    }
}