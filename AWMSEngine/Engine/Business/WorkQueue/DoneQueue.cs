using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO;
using AWMSEngine.ADO.StaticValue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.WorkQueue
{
    public class DoneQueue : BaseEngine<DoneQueue.TReq, WorkQueueCriteria>
    {
        public class TReq
        {
            public long? queueID;
            public string baseCode;
            public string warehouseCode;
            public string areaCode;
            public string locationCode;
            public string actualTime;
        }
        protected override WorkQueueCriteria ExecuteEngine(TReq reqVO)
        {
            var queueTrx = this.GetWorkQueue(reqVO);
            this.UpdateDocument(queueTrx, reqVO);
            this.UpdateStorageObject(queueTrx, reqVO);
            var res = this.UpdateWorkQueue(queueTrx, reqVO);

            return res;
        }
        private amt_WorkQueue GetWorkQueue( TReq reqVO)
        {
            var queueTrx = DataADO.GetInstant().SelectByID<amt_WorkQueue>(reqVO.queueID, this.BuVO);
            var wm = this.StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            if (wm == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Warehouse Code '" + reqVO.warehouseCode + "'");

            var am = this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode && x.Warehouse_ID == wm.ID);
            if (am == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Area Code '" + reqVO.areaCode + "'");

            var lm = ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.locationCode),
                    new KeyValuePair<string,object>("AreaMaster_ID",am.ID.Value),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO).FirstOrDefault();

            var eventStatus = queueTrx.EventStatus;
            if (wm.ID.Value == queueTrx.Des_Warehouse_ID
                && am.ID.Value == queueTrx.Des_Area_ID
                && lm.ID.Value == (queueTrx.Des_AreaLocation_ID ?? lm.ID.Value)
                )
            {
                if (eventStatus == WorkQueueEventStatus.WORKED || eventStatus == WorkQueueEventStatus.WORKING)
                {
                    eventStatus = WorkQueueEventStatus.COMPLETIED;
                }
                else
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Cannot Complete Before Working");
                }
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Work Destination not Equal Present Destination");
            }
            return queueTrx;
        }

        private void UpdateStorageObject(amt_WorkQueue queueTrx, TReq reqVO)
        {
            ADO.StorageObjectADO.GetInstant()
                .UpdateStatusToChild(queueTrx.StorageObject_ID, null, EntityStatus.ACTIVE, StorageObjectEventStatus.RECEIVED, this.BuVO);
        }
        private void UpdateDocument(amt_WorkQueue queueTrx, TReq reqVO)
        {
            if(queueTrx.DocumentItem_ID.HasValue && queueTrx.Document_ID.HasValue)
            {
                ADO.DocumentADO.GetInstant().UpdateItemEventStatus(queueTrx.DocumentItem_ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                var docItems = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>("Document_ID", queueTrx.Document_ID, this.BuVO);
                if (docItems.TrueForAll(x => x.EventStatus == DocumentEventStatus.WORKED ||
                 x.EventStatus == DocumentEventStatus.CLOSED ||
                 x.EventStatus == DocumentEventStatus.CLOSING))
                {
                    ADO.DocumentADO.GetInstant().UpdateEventStatus(queueTrx.Document_ID.Value, docItems.First().EventStatus, this.BuVO);
                }
            }
            else
            {
                
                /*var mapsto = ADO.StorageObjectADO.GetInstant().Get(queueTrx.StorageObject_ID, StorageObjectType.PACK, false, true, this.BuVO);
                var mapstoTree = mapsto.ToTreeList();
                var docItems = ADO.DocumentADO.GetInstant().ListItemBySTO(
                    mapstoTree.Where(x => x.type == StorageObjectType.PACK).Select(x => x.id.Value).ToList(),
                    this.BuVO);
                ADO.DocumentADO.GetInstant().Target(
                    docItems.Select(x => x.Document_ID).ToList(),
                    
                    );*/
            }
        }


        private WorkQueueCriteria UpdateWorkQueue(amt_WorkQueue queueTrx,TReq reqVO)
        {

            SPworkQueue workQueue = new SPworkQueue()
            {
                ID = queueTrx.ID,
                IOType = queueTrx.IOType,
                Parent_WorkQueue_ID = queueTrx.Parent_WorkQueue_ID,
                Document_ID = queueTrx.Document_ID,
                DocumentItem_ID = queueTrx.DocumentItem_ID,
                StorageObject_ID = queueTrx.StorageObject_ID,
                StorageObject_Code = queueTrx.StorageObject_Code,
                Sou_Warehouse_ID = queueTrx.Sou_Warehouse_ID,
                Sou_AreaMaster_ID = queueTrx.Sou_Area_ID,
                Sou_AreaLocationMaster_ID = queueTrx.Sou_AreaLocation_ID,
                Des_Warehouse_ID = queueTrx.Des_Warehouse_ID,
                Des_AreaMaster_ID = queueTrx.Des_Area_ID,
                Des_AreaLocationMaster_ID = queueTrx.Des_AreaLocation_ID,
                Priority = queueTrx.Priority,

                EventStatus = queueTrx.EventStatus,
                Status = StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<WorkQueueEventStatus>(queueTrx.EventStatus).Value,
                Warehouse_ID = queueTrx.Warehouse_ID,
                AreaMaster_ID = queueTrx.Area_ID,
                AreaLocationMaster_ID = queueTrx.AreaLocation_ID
            };
            var resQueue = QueueADO.GetInstant().PUT(workQueue, this.BuVO);

            var sou_lm = ADO.DataADO.GetInstant()
                .SelectByID<ams_AreaLocationMaster>(resQueue.Sou_AreaLocationMaster_ID, this.BuVO);

            var des_lm = ADO.DataADO.GetInstant()
                .SelectByID<ams_AreaLocationMaster>(resQueue.Des_AreaLocationMaster_ID, this.BuVO);

            var pre_lm = ADO.DataADO.GetInstant()
                .SelectByID<ams_AreaLocationMaster>(resQueue.AreaLocationMaster_ID, this.BuVO);

            var res = new WorkQueueCriteria()
            {
                souWarehouseCode =
                this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == resQueue.Sou_Warehouse_ID).Code,
                souAreaCode =
                this.StaticValue.AreaMasters.FirstOrDefault(x => x.ID == resQueue.Sou_AreaMaster_ID).Code,
                souLocationCode = sou_lm == null ? null : sou_lm.Code,

                desWarehouseCode = this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == resQueue.Des_Warehouse_ID).Code,
                desAreaCode = this.StaticValue.AreaMasters.FirstOrDefault(x => x.ID == resQueue.Des_AreaMaster_ID).Code,
                desLocationCode = des_lm == null ? null : des_lm.Code,

                queueID = resQueue.ID,
                baseInfo = null, //send null to wcs
                warehouseCode = resQueue.Warehouse_ID == 0 ? "" :
                this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == resQueue.Warehouse_ID).Code,
                areaCode = resQueue.AreaMaster_ID == 0 ? "" :
                this.StaticValue.AreaMasters.FirstOrDefault(x => x.ID == resQueue.AreaMaster_ID).Code,
                locationCode = pre_lm == null ? null : pre_lm.Code,
                queueParentID = resQueue.Parent_WorkQueue_ID == null ? null : resQueue.Parent_WorkQueue_ID,
                queueRefID = queueTrx.RefID == null ? null : queueTrx.RefID,
                queueStatus = resQueue.EventStatus,
                seq = queueTrx.Seq
            };

            return res;
        }
    }
}
