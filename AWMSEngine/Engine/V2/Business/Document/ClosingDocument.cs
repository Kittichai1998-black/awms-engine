using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.APIService.V2.ASRS;
using AMSModel.Constant.EnumConst;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Document
{
    public class ClosingDocument : BaseEngine<List<long>, List<long>>
    {
        protected override List<long> ExecuteEngine(List<long> reqVO)
        {
            List<long> res = null;//this.ExectProject<List<long>, List<long>>(FeatureCode.EXEWM_DoneQueueClosing, reqVO);
            if (res == null)
            {
                var docLists = new List<long>();
                reqVO.ForEach(x =>
                {
                    var docs = ADO.WMSDB.DocumentADO.GetInstant().Get(x, this.BuVO);
                    if (docs != null)
                    {
                        try
                        {
                            if (docs.EventStatus == DocumentEventStatus.WORKED)
                            {
                                var listItem = ADO.WMSDB.DocumentADO.GetInstant().ListItem(x, this.BuVO);
                                if (listItem.TrueForAll(y => y.EventStatus == DocumentEventStatus.WORKED))
                                {
                                    listItem.ForEach(paItem =>
                                    {
                                        paItem.EventStatus = DocumentEventStatus.CLOSING;
                                        ADO.WMSDB.DocumentADO.GetInstant().UpdateItemEventStatus(paItem.ID.Value, DocumentEventStatus.CLOSING, this.BuVO);
                                    });
                                    ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(x, DocumentEventStatus.CLOSING, this.BuVO);

                                    if (docs.ParentDocument_ID != null)
                                    {
                                        var getParentDoc = ADO.WMSDB.DocumentADO.GetInstant().GetDocumentAndDocItems(docs.ParentDocument_ID.Value, this.BuVO);
                                        if (getParentDoc.DocumentItems.TrueForAll(z => z.EventStatus == DocumentEventStatus.WORKED))
                                        {
                                            getParentDoc.DocumentItems.ForEach(grItem =>
                                            {
                                                var childDocItems = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItem>(new SQLConditionCriteria[] {
                                                    new SQLConditionCriteria("ParentDocumentItem_ID",grItem.ID.Value, SQLOperatorType.EQUALS),
                                                    //new SQLConditionCriteria("EventStatus", DocumentEventStatus.CLOSING, SQLOperatorType.EQUALS),
                                                    new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS),
                                                     }, this.BuVO);
                                                if (childDocItems != null && childDocItems.TrueForAll(i => i.EventStatus == DocumentEventStatus.CLOSING))
                                                {
                                                    grItem.EventStatus = DocumentEventStatus.CLOSING;
                                                    ADO.WMSDB.DocumentADO.GetInstant().UpdateItemEventStatus(grItem.ID.Value, DocumentEventStatus.CLOSING, this.BuVO);
                                                }
                                            });
                                            if (getParentDoc.DocumentItems.TrueForAll(z => z.EventStatus == DocumentEventStatus.CLOSING))
                                            {
                                                ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(getParentDoc.ID.Value, DocumentEventStatus.CLOSING, this.BuVO);
                                            }
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
                            else
                            {
                                this.BuVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                                {
                                    docID = x,
                                    msgError = "Status of document didn't 'WORKED'."
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