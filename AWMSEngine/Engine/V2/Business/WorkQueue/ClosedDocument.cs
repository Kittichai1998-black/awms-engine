using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.APIService.V2.ASRS;
using AWMSEngine.Engine.General;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
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
                        var distos = ADO.DocumentADO.GetInstant().ListDISTOByDoc(x, this.BuVO);
                        if (distos == null)
                            throw new AMWException(this.Logger, AMWExceptionCode.B0001, "Document Item Not Found");
                        distos.ForEach(disto => {
                            UpdateStorageObject(disto, this.BuVO); 
                        });

                        //update document to closed
                        var listItem = AWMSEngine.ADO.DocumentADO.GetInstant().ListItem(x, this.BuVO);
                        if (listItem.TrueForAll(y => y.EventStatus == DocumentEventStatus.CLOSING))
                        {
                            AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, DocumentEventStatus.CLOSING, null, DocumentEventStatus.CLOSED, this.BuVO);
                        }
                    } 
                });
                res = reqVO;
            }

            return res;
        }
        private void UpdateStorageObject(amt_DocumentItemStorageObject disto, VOCriteria buVO)
        {
            var queue = ADO.WorkQueueADO.GetInstant().Get(disto.WorkQueue_ID.Value, buVO);
            var bsto = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(queue.StorageObject_ID, buVO);

            //uOPT_DONE_DES_EVENT_STATUS
            var done_des_event_status = ObjectUtil.QryStrGetValue(bsto.Options, OptionVOConst.OPT_DONE_DES_EVENT_STATUS);

            if (disto.DocumentType_ID == DocumentTypeID.GOODS_RECEIVED)
            {
                if (done_des_event_status == null || done_des_event_status.Length == 0)
                {
                    AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(queue.StorageObject_ID.Value, StorageObjectEventStatus.RECEIVING, null, StorageObjectEventStatus.RECEIVED, buVO);
                }
                else
                {
                    StorageObjectEventStatus eventStatus = (StorageObjectEventStatus)Enum.Parse(typeof(StorageObjectEventStatus), done_des_event_status);
                    AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(queue.StorageObject_ID.Value, null, null, eventStatus, buVO);
                }
            }
            else
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
                }
            }
             
            //remove OPT_DONE_DES_EVENT_STATUS
            var listkeyRoot = ObjectUtil.QryStrToKeyValues(bsto.Options);
            var opt_done = "";

            if (listkeyRoot != null && listkeyRoot.Count > 0)
            {
                listkeyRoot.RemoveAll(x => x.Key.Equals(OptionVOConst.OPT_DONE_DES_EVENT_STATUS));
                opt_done = ObjectUtil.ListKeyToQryStr(listkeyRoot);
            }
            AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_StorageObject>(bsto.ID.Value, buVO,
                    new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("Options", opt_done)
                    });
        }
    }
}
