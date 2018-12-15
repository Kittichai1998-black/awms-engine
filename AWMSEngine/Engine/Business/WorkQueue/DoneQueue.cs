﻿using AMWUtil.Common;
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
            public DateTime actualTime;
        }
        protected override WorkQueueCriteria ExecuteEngine(TReq reqVO)
        {
            var queueTrx = this.GetWorkQueue(reqVO);
            this.UpdateDocumentWorked(queueTrx, reqVO);
            this.UpdateStorageObjectReceived(queueTrx, reqVO);
            this.UpdateWorkQueueClosed(queueTrx, reqVO);
            var res = this.GenerateResponse(queueTrx, reqVO);
            return res;
        }
        private SPworkQueue GetWorkQueue( TReq reqVO)
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

            var eventStatus = queueTrx.EventStatus;
            if (wm.ID.Value == queueTrx.Des_Warehouse_ID
                && am.ID.Value == queueTrx.Des_AreaMaster_ID
                && lm.ID.Value == (queueTrx.Des_AreaLocationMaster_ID ?? lm.ID.Value)
                )
            {
                if (eventStatus == WorkQueueEventStatus.WORKED || eventStatus == WorkQueueEventStatus.WORKING)
                {
                    eventStatus = WorkQueueEventStatus.CLOSED;
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

        private void UpdateStorageObjectReceived(SPworkQueue queueTrx, TReq reqVO)
        {
            ADO.StorageObjectADO.GetInstant()
                .UpdateStatusToChild(queueTrx.StorageObject_ID.Value, null, EntityStatus.ACTIVE, StorageObjectEventStatus.RECEIVED, this.BuVO);
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

        
        private void UpdateWorkQueueClosed(SPworkQueue queueTrx, TReq reqVO)
        {
            queueTrx.ActualTime = reqVO.actualTime;
            queueTrx.EndTime = reqVO.actualTime;
            queueTrx.EventStatus = WorkQueueEventStatus.CLOSED;

            WorkQueueADO.GetInstant().PUT(queueTrx, this.BuVO);
        }

        private WorkQueueCriteria GenerateResponse(SPworkQueue queueTrx, TReq reqVO)
        {
            var sou_lm = ADO.DataADO.GetInstant()
                .SelectByID<ams_AreaLocationMaster>(queueTrx.Sou_AreaLocationMaster_ID, this.BuVO);

            var des_lm = ADO.DataADO.GetInstant()
                .SelectByID<ams_AreaLocationMaster>(queueTrx.Des_AreaLocationMaster_ID, this.BuVO);

            var pre_lm = ADO.DataADO.GetInstant()
                .SelectByID<ams_AreaLocationMaster>(queueTrx.AreaLocationMaster_ID, this.BuVO);

            var res = new WorkQueueCriteria()
            {
                souWarehouseCode =
                this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == queueTrx.Sou_Warehouse_ID).Code,
                souAreaCode =
                this.StaticValue.AreaMasters.FirstOrDefault(x => x.ID == queueTrx.Sou_AreaMaster_ID).Code,
                souLocationCode = sou_lm == null ? null : sou_lm.Code,

                desWarehouseCode = this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == queueTrx.Des_Warehouse_ID).Code,
                desAreaCode = this.StaticValue.AreaMasters.FirstOrDefault(x => x.ID == queueTrx.Des_AreaMaster_ID).Code,
                desLocationCode = des_lm == null ? null : des_lm.Code,

                queueID = queueTrx.ID,
                baseInfo = null, //send null to wcs
                warehouseCode = queueTrx.Warehouse_ID == 0 ? "" :
                this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == queueTrx.Warehouse_ID).Code,
                areaCode = queueTrx.AreaMaster_ID == 0 ? "" :
                this.StaticValue.AreaMasters.FirstOrDefault(x => x.ID == queueTrx.AreaMaster_ID).Code,
                locationCode = pre_lm == null ? null : pre_lm.Code,
                queueParentID = queueTrx.Parent_WorkQueue_ID == null ? null : queueTrx.Parent_WorkQueue_ID,
                queueRefID = queueTrx.RefID == null ? null : queueTrx.RefID,
                queueStatus = queueTrx.EventStatus,
                seq = queueTrx.Seq
            };

            return res;
        }
    }
}
