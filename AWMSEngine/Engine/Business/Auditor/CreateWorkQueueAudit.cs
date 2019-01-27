using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO.QueueApi;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Auditor
{
    public class CreateWorkQueueAudit : BaseEngine<CreateWorkQueueAudit.TReq, CreateWorkQueueAudit.TRes>
    {
        public class TReq
        {
            public long docID;
            public List<SPworkQueue> workQueue;
            public List<amt_DocumentItemStorageObject> disto;
        }

        public class TRes
        {
            public long docID;
            public List<ItemList> listItems;
            public class ItemList
            {
                public string palletCode;
                public string itemCode;
            }
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes listQueue = new TRes();
            var itemLists = new List<TRes.ItemList>();
            var queueCheck = new WCSQueueApi.TRes();
            var queueWorkQueue = new WCSQueueApi.TRes();

            reqVO.workQueue.ForEach(x =>
            {
                if(x.Sou_AreaMaster_ID == 5){
                    var baseInfo = new WCSQueueApi.TRes.queueout.baseinfo();
                    baseInfo = new WCSQueueApi.TReq.queueout.baseinfo()
                    {
                        baseCode = x.StorageObject_Code,
                        packInfos = null
                    };

                    queueCheck.queueOut.Add(new WCSQueueApi.TReq.queueout()
                    {
                        queueID = null,
                        baseInfo = baseInfo,
                        desAreaCode = this.StaticValue.AreaMasters.Where(y => y.ID == x.Des_AreaMaster_ID).FirstOrDefault().Code,
                        desLocationCode = ADO.DataADO.GetInstant().SelectByID<ams_AreaLocationMaster>(x.AreaLocationMaster_ID, this.BuVO).Code,
                        desWarehouseCode = this.StaticValue.Warehouses.Where(y => y.ID == x.Des_Warehouse_ID).FirstOrDefault().Code,
                        priority = x.Priority
                    });
                }
            });

            var wcsRes = WCSQueueApi.GetInstant().SendQueue(queueCheck, this.BuVO);
            if (wcsRes._result.resultcheck == 0)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่สามารถเบิกสินค้าในรายการได้");
            }

            reqVO.workQueue.ForEach(x =>
            {
                var getStatusSto =  ADO.StorageObjectADO.GetInstant().Get(x.StorageObject_ID.Value, StorageObjectType.BASE, false, false, this.BuVO);
                if (getStatusSto.eventStatus != StorageObjectEventStatus.RECEIVED)
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "สินค้าอยู่ในสถานะ" + getStatusSto.eventStatus + "ไม่สามารถเบิกสินค้าตรวจสอบได้");
                
                if(x.Sou_AreaMaster_ID == 5)
                {
                    var resWorkQueue = ADO.WorkQueueADO.GetInstant().PUT(x, this.BuVO);

                    var baseInfo = new WCSQueueApi.TRes.queueout.baseinfo();
                    baseInfo = new WCSQueueApi.TReq.queueout.baseinfo()
                    {
                        baseCode = resWorkQueue.StorageObject_Code,
                        packInfos = null
                    };

                    queueWorkQueue.queueOut.Add(new WCSQueueApi.TReq.queueout()
                    {
                        queueID = resWorkQueue.ID,
                        baseInfo = baseInfo,
                        desAreaCode = this.StaticValue.AreaMasters.Where(y => y.ID == resWorkQueue.Des_AreaMaster_ID).FirstOrDefault().Code,
                        desLocationCode = ADO.DataADO.GetInstant().SelectByID<ams_AreaLocationMaster>(resWorkQueue.AreaLocationMaster_ID, this.BuVO).Code,
                        desWarehouseCode = this.StaticValue.Warehouses.Where(y => y.ID == resWorkQueue.Des_Warehouse_ID).FirstOrDefault().Code,
                        priority = resWorkQueue.Priority
                    });
                }

                ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(x.StorageObject_ID.Value, null, null, StorageObjectEventStatus.AUDITING, this.BuVO);
            });

            var wcsAcceptRes = WCSQueueApi.GetInstant().SendQueue(queueCheck, this.BuVO);
            if (wcsAcceptRes._result.resultcheck == 0)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่สามารถเบิกสินค้าในรายการได้");
            }

            reqVO.disto.ForEach(x =>
            {
                ADO.DocumentADO.GetInstant().MappingSTO(x, this.BuVO);
                var res = ADO.StorageObjectADO.GetInstant().Get(x.StorageObject_ID, StorageObjectType.PACK, false, false, this.BuVO);
                var resBase = ADO.StorageObjectADO.GetInstant().Get(res.parentID.Value, StorageObjectType.PACK, false, false, this.BuVO);
                itemLists.Add(new TRes.ItemList { itemCode = res.code, palletCode = resBase.code });
            });

            ADO.DocumentADO.GetInstant().UpdateStatusToChild(reqVO.docID, DocumentEventStatus.IDLE, null, DocumentEventStatus.WORKING, this.BuVO);
            listQueue.docID = reqVO.docID;
            listQueue.listItems = itemLists;
            return listQueue;
        }
    }
}
