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

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class WorkedDocument : BaseEngine<List<long>, List<long>>
    {
        protected override List<long> ExecuteEngine(List<long> reqVO)
        {
            var res = this.ExectProject<List<long>, List<long>>(FeatureCode.EXEWM_DoneQueueWorked, reqVO);
            if (res == null)
            {
                var docLists = new List<long>();
                reqVO.ForEach(x =>
                {
                    var docs = ADO.DocumentADO.GetInstant().Get(x, this.BuVO);
                    if (docs != null)
                    {
                        if(docs.EventStatus == DocumentEventStatus.WORKING)
                        {
                            var docItems = ADO.DocumentADO.GetInstant().ListItemAndDisto(x, this.BuVO);
                            var distos = new List<amt_DocumentItemStorageObject>();
                            docItems.ForEach(di => distos.AddRange(di.DocItemStos));
                            //ADO.DocumentADO.GetInstant().ListDISTOByDoc(x, this.BuVO);
                            if (distos == null)
                            {
                                this.BuVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                                {
                                    docID = x,
                                    msgError = "Document Items of Storage Object Not Found."
                                });
                                //throw new AMWException(this.Logger, AMWExceptionCode.B0001, "Document Item Not Found");
                            }
                            else
                            {
                                var docItemID = distos.Select(y => y.DocumentItem_ID).Distinct().ToList();

                                docItemID.ForEach(y =>
                                {
                                    if(StaticValue.IsFeature("WORKED_FROM_QTYSUM")) //case1
                                    {
                                        decimal sumQtyDisto = distos.Where(z => z.DocumentItem_ID == y && z.Status == EntityStatus.ACTIVE).Sum(z => z.BaseQuantity ?? 0);
                                        decimal totalQty = docItems.First(z => z.ID == y).BaseQuantity ?? 0;
                                        if (sumQtyDisto == totalQty)
                                        {
                                            ADO.DocumentADO.GetInstant().UpdateItemEventStatus(y.Value, DocumentEventStatus.WORKED, this.BuVO);
                                        }
                                    }
                                    else //case
                                    {
                                        if (distos.FindAll(z => z.DocumentItem_ID == y).TrueForAll(z => z.Status == EntityStatus.ACTIVE))
                                        {
                                            ADO.DocumentADO.GetInstant().UpdateItemEventStatus(y.Value, DocumentEventStatus.WORKED, this.BuVO);
                                        }
                                    }
                                });
                                var listItem = AWMSEngine.ADO.DocumentADO.GetInstant().ListItem(x, this.BuVO);
                                if (listItem.TrueForAll(y => y.EventStatus == DocumentEventStatus.WORKED))
                                {
                                    ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, DocumentEventStatus.WORKING, null, DocumentEventStatus.WORKED, this.BuVO);
                                    RemoveOPTDocument(x, docs.Options, this.BuVO);
                                    docLists.Add(x);
                                }
                                else
                                {
                                    this.BuVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                                    {
                                        docID = x,
                                        msgError = "Status of all document items didn't 'WORKED'."
                                    });
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
                    else
                    {
                        this.BuVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                        {
                            docID = x,
                            msgError = "Document Not Found"
                        });
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

            AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_StorageObject>(docID, buVO,
                    new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("Options", opt_done)
                    });
        }
    }
}
