using AMWUtil.Common;
using AMWUtil.Exception;
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
                                throw new AMWException(this.Logger, AMWExceptionCode.B0001, "Document Item Not Found");

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
                        }
                    } 
                });
                res = reqVO;
            }

            return res;
        }

        private void UpdateStorageObjectReceived(SPworkQueue queue, VOCriteria buVO)
        {
            var stosList = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(queue.StorageObject_ID.Value, StorageObjectType.BASE, false, true, buVO).ToTreeList();

            //var bsto = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(queue.StorageObject_ID, buVO);
            stosList.ForEach(sto => { 
            //up OPT_DONE_DES_EVENT_STATUS
                var done_des_event_status = ObjectUtil.QryStrGetValue(sto.options, OptionVOConst.OPT_DONE_DES_EVENT_STATUS);
                if (done_des_event_status == null || done_des_event_status.Length == 0)
                {

                    AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatus(sto.id.Value, StorageObjectEventStatus.RECEIVING, null, StorageObjectEventStatus.RECEIVED, buVO);
                }
                else
                {
                    StorageObjectEventStatus eventStatus = (StorageObjectEventStatus)Enum.Parse(typeof(StorageObjectEventStatus), done_des_event_status);
                    AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatus(sto.id.Value, null, null, eventStatus, buVO);
                    RemoveOPTEventSTO(sto.id.Value, sto.options, buVO);
                }
            });
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
                            StorageObjectEventStatus.PICKING, null, StorageObjectEventStatus.PICKED, buVO);
                    }
                    else
                    {
                        AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(queue.StorageObject_ID.Value,
                            StorageObjectEventStatus.PICKING, null, StorageObjectEventStatus.PICKED, buVO);
                    }
                }
                else
                {
                    if (disto.Sou_StorageObject_ID != disto.Des_StorageObject_ID) //เบิกเเบบไม่เต็ม
                    {
                        StorageObjectEventStatus eventStatus = (StorageObjectEventStatus)Enum.Parse(typeof(StorageObjectEventStatus), done_des_event_status);
                        AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(disto.Des_StorageObject_ID.Value, null, null, eventStatus, buVO);
                    }
                    else
                    {
                        StorageObjectEventStatus eventStatus = (StorageObjectEventStatus)Enum.Parse(typeof(StorageObjectEventStatus), done_des_event_status);
                        AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(queue.StorageObject_ID.Value, null, null, eventStatus, buVO);
                    }
                    RemoveOPTEventSTO(bsto.ID.Value, bsto.Options, buVO);
                }
            });
            

        }
    }
}
