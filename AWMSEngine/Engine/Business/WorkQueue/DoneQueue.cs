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
    public class DoneQueue : BaseQueue<DoneQueue.TReq, WorkQueueCriteria>
    {
        public class TReq
        {
            public long? queueID;
            public string baseCode;
            public string warehouseCode;
            public string areaCode;
            public string locationCode;
            public DateTime actualTime;
        }
        protected override WorkQueueCriteria ExecuteEngine(TReq reqVO)
        {
            var queueTrx = this.UpdateWorkQueueClosed(reqVO);
            //this.UpdateWorkQueueClosed(queueTrx, reqVO);
            this.UpdateDocumentWorked(queueTrx, reqVO);
            var baseInfo = this.UpdateStorageObject(queueTrx, reqVO);
            var res = this.GenerateResponse(baseInfo, queueTrx);
            return res;
        }
        private SPworkQueue UpdateWorkQueueClosed( TReq reqVO)
        {
            var queueTrx = ADO.WorkQueueADO.GetInstant().Get(reqVO.queueID.Value, this.BuVO);
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

            if (wm.ID.Value == queueTrx.Des_Warehouse_ID
                && am.ID.Value == queueTrx.Des_AreaMaster_ID
                && lm.ID.Value == (queueTrx.Des_AreaLocationMaster_ID ?? lm.ID.Value)
                )
            {
                if (queueTrx.EventStatus == WorkQueueEventStatus.WORKED || queueTrx.EventStatus == WorkQueueEventStatus.WORKING)
                {
                    queueTrx.AreaLocationMaster_ID = lm.ID;
                    queueTrx.AreaMaster_ID = am.ID.Value;
                    queueTrx.Warehouse_ID = am.Warehouse_ID.Value;

                    queueTrx.ActualTime = reqVO.actualTime;
                    queueTrx.EndTime = reqVO.actualTime;
                    queueTrx.EventStatus = WorkQueueEventStatus.CLOSED;

                    WorkQueueADO.GetInstant().PUT(queueTrx, this.BuVO);
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

        private StorageObjectCriteria UpdateStorageObject(SPworkQueue queueTrx, TReq reqVO)
        {
            var mapsto = ADO.StorageObjectADO.GetInstant().Get(queueTrx.StorageObject_ID.Value, StorageObjectType.BASE, false, false, this.BuVO);
            if (mapsto.parentType != StorageObjectType.LOCATION)
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ข้อมูลพาเลทไม่ถูกต้อง");

            mapsto.areaID = queueTrx.AreaMaster_ID;
            mapsto.parentID = queueTrx.AreaLocationMaster_ID;
            mapsto.parentType = StorageObjectType.LOCATION;

            ADO.StorageObjectADO.GetInstant().PutV2(mapsto, this.BuVO);

            if (queueTrx.IOType == IOType.INPUT)
            {
                if (mapsto.eventStatus == StorageObjectEventStatus.RECEIVING)
                    ADO.StorageObjectADO.GetInstant()
                        .UpdateStatusToChild(queueTrx.StorageObject_ID.Value, null, EntityStatus.ACTIVE, StorageObjectEventStatus.RECEIVED, this.BuVO);
            }
            return mapsto;
        }

        private void UpdateDocumentWorked(SPworkQueue queueTrx, TReq reqVO)
        {
            var docItems = ADO.DocumentADO.GetInstant().ListItemByWorkQueue(queueTrx.ID.Value, this.BuVO);
            List<long> docIDs = new List<long>();
            var countDocItems = ADO.DocumentADO.GetInstant().CountStoInDocItems(
                    docItems.Where(x => x.BaseQuantity.HasValue).GroupBy(x => x.ID.Value).Select(x => x.Key), this.BuVO);
            countDocItems.ForEach(cdi => {
                if(cdi.BaseQuantity == docItems.Where(x => x.ID == cdi.DocumentItem_ID).Sum(x => x.BaseQuantity))
                {
                    ADO.DocumentADO.GetInstant().UpdateItemEventStatus(cdi.DocumentItem_ID, DocumentEventStatus.WORKED, this.BuVO);
                    docIDs.AddRange(docItems.Where(x => x.ID == cdi.DocumentItem_ID).Select(x=>x.Document_ID));
                }
            });
            docIDs = docIDs.Distinct().ToList();
            docIDs.ForEach(docID =>
            {
                var checkDocItems = ADO.DocumentADO.GetInstant().ListItem(docID, this.BuVO);
                if (checkDocItems.TrueForAll(x => x.EventStatus == DocumentEventStatus.WORKED))
                    ADO.DocumentADO.GetInstant().UpdateEventStatus(docID, DocumentEventStatus.WORKED, this.BuVO);
            });
        }

        
    }
}
