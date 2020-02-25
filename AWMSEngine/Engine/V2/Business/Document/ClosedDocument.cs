using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO.StaticValue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AWMSEngine.Engine.V2.Business.Document
{
    public class ClosedDocument : BaseEngine<List<long>, List<long>>
    {
        public class TUpdateSTO
        {
            public long? id;
            public StorageObjectEventStatus done_eventsto;
        }
        protected override List<long> ExecuteEngine(List<long> reqVO)
        {
            var res = this.ExectProject<List<long>, List<long>>(FeatureCode.EXEWM_DoneQueueClosed, reqVO);
            if (res == null)
            {
                var docLists = new List<long>();

                reqVO.ForEach(x =>
                {
                    var docs = ADO.DocumentADO.GetInstant().Get(x, this.BuVO);
                    if (docs != null)
                    {
                        try
                        {
                            //update StorageObjects
                            if (docs.EventStatus == DocumentEventStatus.CLOSING)
                            {
                                var distos = AWMSEngine.ADO.DocumentADO.GetInstant().ListDISTOByDoc(x, this.BuVO);
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
                                    var distoGroupByWQ = distos.GroupBy(grp => grp.WorkQueue_ID, (key, g) => new { WorkQueueID = key, DiSTOs = g.ToList() });
                                    foreach (var di in distoGroupByWQ)
                                    {
                                        if (docs.DocumentType_ID == DocumentTypeID.GOODS_RECEIVED || docs.DocumentType_ID == DocumentTypeID.AUDIT)
                                        {
                                            UpdateStorageObjectReceived(di.WorkQueueID);
                                        }
                                        else
                                        {
                                            UpdateStorageObjectIssued(di.DiSTOs);
                                        }
                                    }

                                    //update Closed Document
                                    var listItem = AWMSEngine.ADO.DocumentADO.GetInstant().ListItem(x, this.BuVO);
                                    if (listItem.TrueForAll(y => y.EventStatus == DocumentEventStatus.CLOSING))
                                    {
                                        AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, DocumentEventStatus.CLOSING, null, DocumentEventStatus.CLOSED, this.BuVO);
                                        RemoveOPTDocument(x, docs.Options, this.BuVO);
                                        docLists.Add(x);

                                    }
                                    else
                                    {
                                        this.BuVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                                        {
                                            docID = x,
                                            msgError = "Status of all document items didn't 'CLOSING'."
                                        });
                                    }
                                }
                            }
                            else
                            {
                                this.BuVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                                {
                                    docID = x,
                                    msgError = "Status of document didn't 'CLOSING'."
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
        private void RemoveOPTEventSTO(long bsto_id, string bsto_options, VOCriteria buVO)
        {
            //remove OPT_DONE_DES_EVENT_STATUS
            var listkeyRoot = ObjectUtil.QryStrToKeyValues(bsto_options);
            var opt_done = "";

            if (listkeyRoot != null && listkeyRoot.Count > 0)
            {
                listkeyRoot.RemoveAll(x => x.Key.Equals(OptionVOConst.OPT_DONE_DES_EVENT_STATUS));
                opt_done = ObjectUtil.ListKeyToQryStr(listkeyRoot);
            }

            AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_StorageObject>(bsto_id, buVO,
                    new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("Options", opt_done)
                    });
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
        private void UpdateStorageObjectReceived(long? wqID)
        {
            var queue = AWMSEngine.ADO.WorkQueueADO.GetInstant().Get(wqID.Value, this.BuVO);

            var stosList = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(queue.StorageObject_ID.Value, StorageObjectType.BASE, false, true, this.BuVO);

            //up OPT_DONE_DES_EVENT_STATUS
            List<TUpdateSTO> upd_stolist = new List<TUpdateSTO>();
            StorageObjectEventStatus eventStatus_rootSto = StorageObjectEventStatus.RECEIVED;

            stosList.ToTreeList().ForEach(sto => {
                if (sto.parentType == StorageObjectType.BASE)
                {
                    var done_des_event_status = ObjectUtil.QryStrGetValue(sto.options, OptionVOConst.OPT_DONE_DES_EVENT_STATUS);
                    if (done_des_event_status == null || done_des_event_status.Length == 0)
                    {
                        upd_stolist.Add(new TUpdateSTO()
                        {
                            id = sto.id.Value,
                            done_eventsto = eventStatus_rootSto
                        });
                    }
                    else
                    {
                        StorageObjectEventStatus eventStatus = EnumUtil.GetValueEnum<StorageObjectEventStatus>(done_des_event_status);
                        upd_stolist.Add(new TUpdateSTO()
                        {
                            id = sto.id.Value,
                            done_eventsto = eventStatus
                        });
                        RemoveOPTEventSTO(sto.id.Value, sto.options, this.BuVO);
                    }
                }
                else
                {
                    //current is base 
                    var done_des_event_status = ObjectUtil.QryStrGetValue(sto.options, OptionVOConst.OPT_DONE_DES_EVENT_STATUS);
                    if (done_des_event_status == null || done_des_event_status.Length == 0)
                    {
                        //eventStatus_rootSto = StorageObjectEventStatus.RECEIVED;
                    }
                    else
                    {
                        eventStatus_rootSto = EnumUtil.GetValueEnum<StorageObjectEventStatus>(done_des_event_status);
                        RemoveOPTEventSTO(sto.id.Value, sto.options, this.BuVO);
                    }
                    upd_stolist.Add(new TUpdateSTO()
                    {
                        id = sto.id.Value,
                        done_eventsto = eventStatus_rootSto
                    });
                }

            });
            var results = upd_stolist.GroupBy(
                p => p.done_eventsto,
                (key, g) => new { Done_Eventsto = key, IDs = g.ToList() });
            foreach (var updSto in results)
            {
                EntityStatus? toStatus = StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<StorageObjectEventStatus>(updSto.Done_Eventsto);
                var upSTO = ADO.DataADO.GetInstant().UpdateBy<amt_StorageObject>(new SQLConditionCriteria[] {
                                            new SQLConditionCriteria("ID", string.Join(",", updSto.IDs.Select(x=>x.id).ToArray()), SQLOperatorType.IN ),
                                            new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS )
                                            }, new KeyValuePair<string, object>[]{
                                            new KeyValuePair<string, object>("EventStatus", updSto.Done_Eventsto),
                                            new KeyValuePair<string, object>("Status", toStatus)
                                            }, this.BuVO);
            }

        }

        private void UpdateStorageObjectIssued(List<amt_DocumentItemStorageObject> distos)
        {
            distos.ForEach(disto =>
            {
                if (disto.Sou_StorageObject_ID != disto.Des_StorageObject_ID) //เบิกเเบบ FULL และ partial
                {
                    var stoDes = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(disto.Des_StorageObject_ID, this.BuVO);
                    var done_des_event_status = ObjectUtil.QryStrGetValue(stoDes.Options, OptionVOConst.OPT_DONE_DES_EVENT_STATUS);
                    if (done_des_event_status == null || done_des_event_status.Length == 0)
                    {
                        AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(disto.Des_StorageObject_ID.Value,
                            StorageObjectEventStatus.PICKING, EntityStatus.ACTIVE, StorageObjectEventStatus.PICKED, this.BuVO);
                    }
                    else
                    {
                        StorageObjectEventStatus eventStatus = EnumUtil.GetValueEnum<StorageObjectEventStatus>(done_des_event_status);
                        AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(disto.Des_StorageObject_ID.Value, StorageObjectEventStatus.PICKING,
                            EntityStatus.ACTIVE, eventStatus, this.BuVO);
                        RemoveOPTEventSTO(stoDes.ID.Value, stoDes.Options, this.BuVO);

                    }
                }
                else
                {
                    var queue = AWMSEngine.ADO.WorkQueueADO.GetInstant().Get(disto.WorkQueue_ID.Value, this.BuVO);
                    var stoDes = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(queue.StorageObject_ID, this.BuVO);

                    AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(queue.StorageObject_ID.Value,
                            StorageObjectEventStatus.PICKING, EntityStatus.ACTIVE, StorageObjectEventStatus.PICKED, this.BuVO);
                }


            });
        }
    }
}