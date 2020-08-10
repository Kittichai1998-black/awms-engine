using AMWUtil.Exception;
using AMWUtil.Common;
using AWMSEngine.APIService.V2.ASRS;
using AWMSModel.Constant.StringConst;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
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

                    var docs = ADO.DocumentADO.GetInstant().GetDocumentAndDocItems(x, this.BuVO);
                    if (docs != null)
                    {
                        try
                        {
                            if (docs.EventStatus == DocumentEventStatus.WORKING)
                            {
                                var distos = ADO.DocumentADO.GetInstant().ListStoInDocs(x, this.BuVO);
                                //var distos = new List<amt_DocumentItemStorageObject>();
                                //docs.DocumentItems.ForEach(di => distos.AddRange(di.DocItemStos));
                                if (distos == null)
                                {
                                    this.BuVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                                    {
                                        docID = x,
                                        msgError = "Document Items of Storage Object Not Found."
                                    });
                                }
                                else
                                {
                                    var docItemID = distos.Select(y => y.DocumentItem_ID).Distinct().ToList();

                                    docItemID.ForEach(y =>
                                    {
                                        decimal sumQtyDisto = distos.Where(z => z.DocumentItem_ID == y && z.Status == EntityStatus.DONE).Sum(z => z.BaseQuantity ?? 0);
                                        decimal totalQty = docs.DocumentItems.First(z => z.ID == y).BaseQuantity ?? 0;
                                        if (sumQtyDisto == totalQty)
                                        {
                                            ADO.DocumentADO.GetInstant().UpdateItemEventStatus(y.Value, DocumentEventStatus.WORKED, this.BuVO);
                                        }
                                    });
                                    var listItem = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(x, this.BuVO);
                                    if (listItem.TrueForAll(y => y.EventStatus == DocumentEventStatus.WORKED))
                                    {
                                        ADO.DocumentADO.GetInstant().UpdateEventStatus(x, DocumentEventStatus.WORKED, this.BuVO);
                                        RemoveOPTDocument(x, docs.Options, this.BuVO);
                                        docLists.Add(x);
                                    }
                                    else
                                    {   //กรณีที่มีdocitem เป็น working แต่ไม่มีผูกกับ disto ให้อัพเดทเป็น workedอัตโนมัติ
                                        listItem.ForEach(docItem => { 
                                            if(docItem.EventStatus == DocumentEventStatus.WORKING && docItem.DocItemStos == null || docItem.DocItemStos.Count() == 0)
                                            {
                                                docItem.EventStatus = DocumentEventStatus.WORKED;
                                                ADO.DocumentADO.GetInstant().UpdateItemEventStatus(docItem.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                                            }
                                        });
                                        
                                        if (listItem.TrueForAll(u => u.EventStatus == DocumentEventStatus.WORKED))
                                        {
                                            ADO.DocumentADO.GetInstant().UpdateEventStatus(x, DocumentEventStatus.WORKED, this.BuVO);
                                            RemoveOPTDocument(x, docs.Options, this.BuVO);
                                            docLists.Add(x);
                                        }
                                    }
                                }
                                var getGR = ADO.DocumentADO.GetInstant().GetDocumentAndDocItems(docs.ParentDocument_ID.Value, this.BuVO);
                                if(getGR == null)
                                {
                                    throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "Document Good Receive Not Found");
                                }
                                docs.DocumentItems.ForEach(item => {
                                    var cc = getGR.DocumentItems.Find(y => y.ID == item.ParentDocumentItem_ID);
                                    ADO.DocumentADO.GetInstant().UpdateItemEventStatus(cc.ID.Value, DocumentEventStatus.WORKING, this.BuVO);
                                });
                                ADO.DocumentADO.GetInstant().UpdateEventStatus(docs.ParentDocument_ID.Value, DocumentEventStatus.WORKING, this.BuVO);

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
                        throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "Document PUTAWAY Not Found");
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

            AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_Document>(docID, buVO,
                    new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("Options", opt_done)
                    });
        }
    }
}