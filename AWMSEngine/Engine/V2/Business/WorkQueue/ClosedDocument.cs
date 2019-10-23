using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.APIService.V2.ASRS;
using AWMSEngine.Engine.General;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
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
                reqVO.ForEach(x =>
                {
                    var docs = ADO.DocumentADO.GetInstant().Get(x, this.BuVO);
                    if (docs != null)
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
                                //throw new AMWException(this.Logger, AMWExceptionCode.B0001, "Document Item Not Found");
                            }
                            else
                            {
                                var WorkQueues = distos.Select(grp => grp.WorkQueue_ID).Distinct().ToList();
                                WorkQueues.ForEach(wq =>
                                {
                                    var queue = AWMSEngine.ADO.WorkQueueADO.GetInstant().Get(wq.Value, this.BuVO);

                                    if (docs.DocumentType_ID == DocumentTypeID.GOODS_RECEIVED)
                                    {
                                        UpdateStorageObjectReceived(queue, this.BuVO);
                                    }
                                    else if (docs.DocumentType_ID == DocumentTypeID.GOODS_ISSUED)
                                    {
                                        var updDistos = distos.Where(grp => grp.WorkQueue_ID == wq).ToList();
                                        UpdateStorageObjectIssued(updDistos, queue, this.BuVO);
                                    }
                                });

                                //update Closed Document
                                var listItem = AWMSEngine.ADO.DocumentADO.GetInstant().ListItem(x, this.BuVO);
                                if (listItem.TrueForAll(y => y.EventStatus == DocumentEventStatus.CLOSING))
                                {
                                    AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, DocumentEventStatus.CLOSING, null, DocumentEventStatus.CLOSED, this.BuVO);
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
                    else
                    {
                        this.BuVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                        {
                            docID = x,
                            msgError = "Document Not Found"
                        });
                    }
                });
                res = reqVO;
            }

            return res;
        }

        private void UpdateStorageObjectReceived(SPworkQueue queue, VOCriteria buVO)
        {
            var stosList = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(queue.StorageObject_ID.Value, StorageObjectType.BASE, false, true, buVO);

            //up OPT_DONE_DES_EVENT_STATUS
            List<TUpdateSTO> upd_stolist = new List<TUpdateSTO>();
            StorageObjectEventStatus eventStatus_rootSto = StorageObjectEventStatus.RECEIVED;
            
            stosList.ToTreeList().ForEach(sto => {
            if (sto.parentType == StorageObjectType.BASE)
            {
                    var done_des_event_status = ObjectUtil.QryStrGetValue(sto.options, OptionVOConst.OPT_DONE_DES_EVENT_STATUS);
                    if (done_des_event_status == null || done_des_event_status.Length == 0)
                    {
                        upd_stolist.Add(new TUpdateSTO(){
                            id = sto.id.Value,
                            done_eventsto = eventStatus_rootSto
                        });
                    }
                    else
                    {
                        StorageObjectEventStatus eventStatus = (StorageObjectEventStatus)Enum.Parse(typeof(StorageObjectEventStatus), done_des_event_status);
                        upd_stolist.Add(new TUpdateSTO()
                        {
                            id = sto.id.Value,
                            done_eventsto = eventStatus
                        });
                        RemoveOPTEventSTO(sto.id.Value, sto.options, buVO);
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
                        eventStatus_rootSto = (StorageObjectEventStatus)Enum.Parse(typeof(StorageObjectEventStatus), done_des_event_status);
                        RemoveOPTEventSTO(sto.id.Value, sto.options, buVO);
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

        private void UpdateStorageObjectIssued(List<amt_DocumentItemStorageObject> distos, SPworkQueue queue, VOCriteria buVO)
        {
            var bsto = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(queue.StorageObject_ID, buVO);

            var done_des_event_status = ObjectUtil.QryStrGetValue(bsto.Options, OptionVOConst.OPT_DONE_DES_EVENT_STATUS);

            distos.ForEach(disto =>
            {
                if (done_des_event_status == null || done_des_event_status.Length == 0)
                {
                    if (disto.Sou_StorageObject_ID != disto.Des_StorageObject_ID) //เบิกเเบบไม่เต็ม
                    {
                        AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(disto.Des_StorageObject_ID.Value,
                            StorageObjectEventStatus.PICKING, EntityStatus.ACTIVE, StorageObjectEventStatus.PICKED, buVO);
                    }
                    else
                    {
                        AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(queue.StorageObject_ID.Value,
                            StorageObjectEventStatus.PICKING, EntityStatus.ACTIVE, StorageObjectEventStatus.PICKED, buVO);
                    }
                }
                else
                {
                    if (disto.Sou_StorageObject_ID != disto.Des_StorageObject_ID) //เบิกเเบบไม่เต็ม
                    {
                        StorageObjectEventStatus eventStatus = (StorageObjectEventStatus)Enum.Parse(typeof(StorageObjectEventStatus), done_des_event_status);
                        AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(disto.Des_StorageObject_ID.Value, null, EntityStatus.ACTIVE, eventStatus, buVO);
                    }
                    else
                    {
                        StorageObjectEventStatus eventStatus = (StorageObjectEventStatus)Enum.Parse(typeof(StorageObjectEventStatus), done_des_event_status);
                        AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(queue.StorageObject_ID.Value, null, EntityStatus.ACTIVE, eventStatus, buVO);
                    }
                    RemoveOPTEventSTO(bsto.ID.Value, bsto.Options, buVO);
                }
            });
            

        }
    }
}
