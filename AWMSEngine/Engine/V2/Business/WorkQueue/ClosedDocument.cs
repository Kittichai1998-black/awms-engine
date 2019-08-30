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
                            var queue = ADO.WorkQueueADO.GetInstant().Get(disto.WorkQueue_ID.Value, this.BuVO);
                            var bsto = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_StorageObject>(queue.StorageObject_ID, this.BuVO);

                           // var bsto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(disto.Sou_StorageObject_ID, StorageObjectType.PACK, true, false, this.BuVO).
                           //     ToTreeList().Where(y => y.type == StorageObjectType.BASE).FirstOrDefault();
                             
                            UpdateSTOEvenStatus(bsto, this.BuVO);

                        });

                        //update document to closed
                        var listItem = AWMSEngine.ADO.DocumentADO.GetInstant().ListItem(x, this.BuVO);
                        if (listItem.TrueForAll(y => y.EventStatus == DocumentEventStatus.CLOSING))
                        {
                            AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, DocumentEventStatus.CLOSING, null, DocumentEventStatus.CLOSED, this.BuVO);
                        }
                        /* if (distos.TrueForAll(y => y.Status == EntityStatus.ACTIVE))
                         {
                             if (docs.DocumentType_ID != DocumentTypeID.AUDIT)
                             {
                                 ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, DocumentEventStatus.CLOSING, null, DocumentEventStatus.CLOSED, this.BuVO);
                             }
                             else
                             {
                                 ADO.DocumentADO.GetInstant().UpdateStatusToChild(x, null, null, DocumentEventStatus.CLOSED, this.BuVO);
                             }
                         }*/
                    }
                    else
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Document Not Found");
                    }
                }); 
            }

            return reqVO;
        }
        private void UpdateSTOEvenStatus(amt_StorageObject bsto, VOCriteria buVO)
        {
            //uOPT_DONE_DES_EVENT_STATUS
            var done_des_event_status = ObjectUtil.QryStrGetValue(bsto.Options, OptionVOConst.OPT_DONE_DES_EVENT_STATUS);
            if (done_des_event_status == null || done_des_event_status.Length == 0)
            {
                AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(bsto.ID.Value, StorageObjectEventStatus.RECEIVING, null, StorageObjectEventStatus.RECEIVED, buVO);
            }
            else
            {
                StorageObjectEventStatus eventStatus = (StorageObjectEventStatus)Enum.Parse(typeof(StorageObjectEventStatus), done_des_event_status);
                AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(bsto.ID.Value, null, null, eventStatus, buVO);
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
