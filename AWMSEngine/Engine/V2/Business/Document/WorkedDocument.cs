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

                    var docs = ADO.DocumentADO.GetInstant().Get(x, this.BuVO);

                    if (docs != null)
                    {
                        try
                        {
                            if (docs.EventStatus == DocumentEventStatus.WORKING)
                            {
                                docs.DocumentItems = ADO.DocumentADO.GetInstant().ListItemAndDisto(x, this.BuVO);
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
                                            ADO.DocumentADO.GetInstant().UpdateItemEventStatus(y.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                                        }
                                    }
                                    else
                                    {
                                        if (docs.DocumentType_ID == DocumentTypeID.PHYSICAL_COUNT || docs.DocumentType_ID == DocumentTypeID.AUDIT)
                                        {
                                            if (y.DocItemStos.TrueForAll(z => z.Status == EntityStatus.DONE))
                                            {
                                                y.EventStatus = DocumentEventStatus.WORKED;
                                                ADO.DocumentADO.GetInstant().UpdateItemEventStatus(y.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                                            }
                                        }
                                        else
                                        {
                                            if(y.BaseQuantity == null)
                                            {
                                                if (y.DocItemStos.TrueForAll(z => z.Status == EntityStatus.DONE))
                                                {
                                                    y.EventStatus = DocumentEventStatus.WORKED;
                                                    ADO.DocumentADO.GetInstant().UpdateItemEventStatus(y.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                                                }
                                            }
                                            else
                                            {
                                                decimal sumQtyDisto = y.DocItemStos.Where(z => z.DocumentItem_ID == y.ID && z.Status == EntityStatus.DONE).Sum(z => z.BaseQuantity ?? 0);
                                                decimal totalQty = y.BaseQuantity ?? 0;
                                                if (sumQtyDisto == totalQty)
                                                {
                                                    y.EventStatus = DocumentEventStatus.WORKED;
                                                    ADO.DocumentADO.GetInstant().UpdateItemEventStatus(y.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                                                }
                                            }
                                        }
                                    }

                                });
                                if(docs.DocumentItems.TrueForAll(y => y.EventStatus == DocumentEventStatus.WORKED))
                                {
                                    docs.EventStatus = DocumentEventStatus.WORKED;
                                    ADO.DocumentADO.GetInstant().UpdateEventStatus(x, DocumentEventStatus.WORKED, this.BuVO);
                                    RemoveOPTDocument(x, docs.Options, this.BuVO);
                                    docLists.Add(x);
                                }
                                //else
                                //{
                                //    //no docItem id
                                //    //กรณีที่มีdocitem เป็น working แต่ไม่มีผูกกับ disto ให้อัพเดทเป็น workedอัตโนมัติ
                                //    if (docs.DocumentType_ID == DocumentTypeID.PICKING)
                                //    {
                                //        docs.DocumentItems.ForEach(docItem =>
                                //        {
                                //            if (docItem.EventStatus == DocumentEventStatus.WORKING && docItem.DocItemStos == null || docItem.DocItemStos.Count() == 0)
                                //            {
                                //                docItem.EventStatus = DocumentEventStatus.WORKED;
                                //                ADO.DocumentADO.GetInstant().UpdateItemEventStatus(docItem.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                                //            }
                                //        });
                                //    }
                                //    else
                                //    {
                                //        docs.DocumentItems.ForEach(docItem =>
                                //        {
                                //            if (docItem.EventStatus == DocumentEventStatus.WORKING)
                                //            {
                                //                if (docItem.DocItemStos != null && docItem.DocItemStos.Count() > 0)
                                //                {
                                //                    decimal sumQtyDisto = docItem.DocItemStos.Sum(z => z.BaseQuantity ?? 0);
                                //                    decimal totalQty = docItem.BaseQuantity ?? 0;
                                //                    if (sumQtyDisto != totalQty)
                                //                    {
                                //                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "จำนวนสินค้าของรายการ SKU: " + docItem.Code + " ที่ต้องการรับเข้าไม่ตรงกับจำนวนที่ระบุในเอกสาร");
                                //                    }
                                //                    else
                                //                    {
                                //                        docItem.EventStatus = DocumentEventStatus.WORKED;
                                //                        ADO.DocumentADO.GetInstant().UpdateItemEventStatus(docItem.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                                //                    }
                                //                }
                                //            }
                                //        });
                                //    }
                                //    if (docs.DocumentItems.TrueForAll(u => u.EventStatus == DocumentEventStatus.WORKED))
                                //    {
                                //        docs.EventStatus = DocumentEventStatus.WORKED;
                                //        ADO.DocumentADO.GetInstant().UpdateEventStatus(x, DocumentEventStatus.WORKED, this.BuVO);
                                //        RemoveOPTDocument(x, docs.Options, this.BuVO);
                                //        docLists.Add(x);
                                //    }
                                //}
                                if(docs.ParentDocument_ID != null)
                                {
                                    var getParentDoc = ADO.DocumentADO.GetInstant().GetDocumentAndDocItems(docs.ParentDocument_ID.Value, this.BuVO);
                                    if(getParentDoc == null)
                                    {
                                        throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "Document Not Found");
                                    }

                                    var ParentDoc = docs.DocumentItems.GroupBy(
                                        p => p.ParentDocumentItem_ID, (key, g) => new { ParentItemID = key, DocItems = g.ToList() }).ToList();

                                    ParentDoc.ForEach(group => { 
                                        if(group.DocItems.TrueForAll(xx => xx.EventStatus == DocumentEventStatus.WORKED))
                                        {
                                            var qrItems = getParentDoc.DocumentItems.FindAll(y => y.ID == group.ParentItemID);
                                            qrItems.ForEach(grItem =>
                                            {
                                                grItem.EventStatus = DocumentEventStatus.WORKED;
                                                ADO.DocumentADO.GetInstant().UpdateItemEventStatus(grItem.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                                            });
                                        }

                                    });

                                    if (getParentDoc.DocumentItems.TrueForAll(xx => xx.EventStatus == DocumentEventStatus.WORKED))
                                    {
                                        ADO.DocumentADO.GetInstant().UpdateEventStatus(docs.ParentDocument_ID.Value, DocumentEventStatus.WORKED, this.BuVO);
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

            AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_Document>(docID, buVO,
                    new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("Options", opt_done)
                    });
        }
    }
}