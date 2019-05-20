using AMWUtil.Exception;
using AWMSEngine.ADO;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
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
            if (queueTrx.StorageObject_Code != reqVO.baseCode)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Base Code '" + reqVO.baseCode + "' not Equal in Work Queue '" + queueTrx.StorageObject_Code + "'");
            //this.UpdateWorkQueueClosed(queueTrx, reqVO);
            this.UpdateDocumentWorked(queueTrx, reqVO);
            var baseInfo = this.UpdateStorageObject(queueTrx, reqVO);
            var res = this.GenerateResponse(baseInfo, queueTrx);
            return res;
        }

        private SPworkQueue UpdateWorkQueueClosed(TReq reqVO)
        {
            var queueTrx = ADO.WorkQueueADO.GetInstant().Get(reqVO.queueID.Value, this.BuVO);
            var wm = this.StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            if (wm == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Warehouse Code '" + reqVO.warehouseCode + "' Not Found");

            var am = this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode && x.Warehouse_ID == wm.ID);
            if (am == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Area Code '" + reqVO.areaCode + "' Not Found");

            var lm = ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.locationCode),
                    new KeyValuePair<string,object>("AreaMaster_ID",am.ID.Value),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO).FirstOrDefault();

            if (wm.ID.Value == queueTrx.Des_Warehouse_ID
                //&& am.ID.Value == queueTrx.Des_AreaMaster_ID
                //&& lm.ID.Value == (queueTrx.Des_AreaLocationMaster_ID ?? lm.ID.Value)
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
            var mapsto = ADO.StorageObjectADO.GetInstant().Get(queueTrx.StorageObject_ID.Value, StorageObjectType.BASE, false, true, this.BuVO);
            if (mapsto.parentType != StorageObjectType.LOCATION)
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Data of Pallet Incorrect");
            ADO.StorageObjectADO.GetInstant().UpdateLocationToChild(mapsto, queueTrx.AreaLocationMaster_ID.Value, this.BuVO);

            if (queueTrx.IOType == IOType.INPUT)
            {
                ADO.StorageObjectADO.GetInstant()
                    .UpdateStatusToChild(queueTrx.StorageObject_ID.Value, null, EntityStatus.ACTIVE, StorageObjectEventStatus.RECEIVED, this.BuVO);
            }
            return mapsto;
        }

        private void UpdateDocumentWorked(SPworkQueue queueTrx, TReq reqVO)
        {
            var docItems = ADO.DocumentADO.GetInstant().ListItemByWorkQueue(queueTrx.ID.Value, this.BuVO);

            List<long> docIDs = new List<long>();


            if (queueTrx.IOType == IOType.INPUT)
            {
                foreach (var docItem in docItems)
                {
                    if (docItem.BaseQuantity.HasValue && docItem.EventStatus == DocumentEventStatus.WORKING)
                    {
                        var baseQty = ADO.DataADO.GetInstant().SumBy<amt_DocumentItemStorageObject>(
                                        "BaseQuantity",
                                        new SQLConditionCriteria[]{
                                        new SQLConditionCriteria("documentItem_ID", docItem.ID, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS),
                                        }, this.BuVO);
                        if (docItem.BaseQuantity == baseQty)
                        {
                            this.updateDocumentItemSTO(docItem.ID.Value);
                            ADO.DocumentADO.GetInstant().UpdateItemEventStatus(docItem.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                            docIDs.Add(docItem.Document_ID);
                        }
                    }
                }
            }
            else if (queueTrx.IOType == IOType.OUTPUT)
            {
                foreach (var docItem in docItems)
                {
                    if (docItem.EventStatus == DocumentEventStatus.WORKING)
                    {
                        var countInactive = ADO.DataADO.GetInstant().CountBy<amt_DocumentItemStorageObject>(
                                        new SQLConditionCriteria[]{
                                            new SQLConditionCriteria("documentItem_ID", docItem.ID, SQLOperatorType.EQUALS),
                                            new SQLConditionCriteria("status", EntityStatus.INACTIVE, SQLOperatorType.EQUALS) },
                                        this.BuVO);
                        if (countInactive == 0)
                        {
                            this.updateDocumentItemSTO(docItem.ID.Value);
                            ADO.DocumentADO.GetInstant().UpdateItemEventStatus(docItem.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                            docIDs.Add(docItem.Document_ID);
                        }
                    }
                }
            }
             
            docIDs = docIDs.Distinct().ToList();
            docIDs.ForEach(docID =>
            {
                var checkDocItems = ADO.DocumentADO.GetInstant().ListItem(docID, this.BuVO);
                if (checkDocItems.TrueForAll(x => x.EventStatus == DocumentEventStatus.WORKED))
                    ADO.DocumentADO.GetInstant().UpdateEventStatus(docID, DocumentEventStatus.WORKED, this.BuVO);
            });

        }

        //auto update status ของ disto = 1
        private void updateDocumentItemSTO(long diStoID)
        {
            /*ADO.DataADO.GetInstant().UpdateByID<amt_DocumentItem>(diStoID, this.BuVO,
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string, object>("Status", EntityStatus.ACTIVE)
                });*/

            ADO.DataADO.GetInstant().UpdateBy<amt_DocumentItem>(
                new SQLConditionCriteria[]{
                     new SQLConditionCriteria("ID", diStoID, SQLOperatorType.EQUALS),
                     new SQLConditionCriteria("status", EntityStatus.INACTIVE, SQLOperatorType.EQUALS) },
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string, object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO);
        }
    }
}
