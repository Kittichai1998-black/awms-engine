﻿using AMWUtil.Common;
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
    public class DoneQ : BaseEngine<DoneQ.TReq, DoneQ.TRes>
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
        public class TRes
        {
            public List<long> docIDs;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var queueTrx = ADO.WorkQueueADO.GetInstant().Get(reqVO.queueID.Value, this.BuVO);
            if (queueTrx.Des_Warehouse_ID != queueTrx.Warehouse_ID)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Present Location Not Equals Destination Location.");

            this.UpdateStorageObjectLocation(queueTrx, reqVO);

            this.UpdateDocumentItemStorageObject(reqVO, queueTrx);

            this.UpdateDoneQueueClosedDISTO(reqVO, queueTrx);
            return null;
        }


        private StorageObjectCriteria UpdateStorageObjectLocation(SPworkQueue queueTrx, TReq reqVO)
        {
            var mapsto = ADO.StorageObjectADO.GetInstant().Get(queueTrx.StorageObject_ID.Value, StorageObjectType.BASE, false, true, this.BuVO);
            if (mapsto.parentType != StorageObjectType.LOCATION)
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ข้อมูลพาเลทไม่ถูกต้อง");

            var location = DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>(reqVO.locationCode, this.BuVO);

            ADO.StorageObjectADO.GetInstant().UpdateLocationToChild(mapsto, location.ID.Value, this.BuVO);

            return mapsto;
        }

        private void UpdateDocumentItemStorageObject(TReq reqVO, SPworkQueue queueTrx)
        {
            var warehouse = StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            if (warehouse == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Warehouse " + reqVO.warehouseCode + " Not Found");
            var area = StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode);
            if (area == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Area " + reqVO.areaCode + " Not Found");
            var location = ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.locationCode),
                    new KeyValuePair<string,object>("AreaMaster_ID",area.ID.Value),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO).FirstOrDefault();

            var stos = ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode, warehouse.ID.Value, area.ID.Value, false, true, this.BuVO);
            var stoList = stos.ToTreeList().Where(x => x.type == StorageObjectType.PACK).ToList();

            var docItems = ADO.DocumentADO.GetInstant().ListItemByWorkQueue(reqVO.queueID.Value, this.BuVO).Select(x => new { x.ID, x.Document_ID }).Distinct().ToList();

            var docs = ADO.DocumentADO.GetInstant().List(docItems.Select(x => x.Document_ID).Distinct().ToList(), this.BuVO).FirstOrDefault();

            if (queueTrx.Des_Warehouse_ID == warehouse.ID.Value)
            {
                if (queueTrx.IOType == IOType.INPUT)
                {
                    if (docItems.Count > 0)
                    {
                        docItems.ForEach(docItem =>
                        {
                            stoList.ForEach(sto =>
                            {
                                if (docs.DocumentType_ID != DocumentTypeID.AUDIT)
                                {
                                    var distos = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                                    {
                                    new SQLConditionCriteria("DocumentItem_ID", docItem.ID, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("Sou_StorageObject_ID", sto.id, SQLOperatorType.EQUALS)
                                    }, this.BuVO);

                                    distos.ForEach(disto =>
                                    {
                                        ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, sto.id.Value, null, null, EntityStatus.ACTIVE, this.BuVO);
                                    });
                                }
                            });
                        });
                        if (docs.DocumentType_ID == DocumentTypeID.AUDIT)
                            ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(stos.id.Value, StorageObjectEventStatus.AUDITING, null, StorageObjectEventStatus.AUDITED, this.BuVO);
                        else
                            ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(stos.id.Value, StorageObjectEventStatus.RECEIVING, null, StorageObjectEventStatus.RECEIVED, this.BuVO);

                    }
                    else
                    {
                        var stoPack = stos.ToTreeList().FindAll(x => x.type == StorageObjectType.PACK).FirstOrDefault();
                        var getDisto = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                            {
                            new SQLConditionCriteria("Sou_StorageObject_ID", stoPack.id, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("Status", EntityStatus.INACTIVE, SQLOperatorType.EQUALS),
                            }, this.BuVO).FirstOrDefault(x => x.DocumentItem_ID == null);

                        ADO.DocumentADO.GetInstant().UpdateMappingSTO(getDisto.ID.Value, EntityStatus.ACTIVE, this.BuVO);
                        ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(stos.id.Value, StorageObjectEventStatus.RECEIVING, null, StorageObjectEventStatus.RECEIVED, this.BuVO);
                    }
                }
                else if (queueTrx.IOType == IOType.OUTPUT && docs.DocumentType_ID != DocumentTypeID.AUDIT)
                {
                    docItems.ForEach(docItem =>
                    {
                        stoList.ForEach(sto =>
                        {
                            var distos = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                            {
                            new SQLConditionCriteria("DocumentItem_ID", docItem.ID, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("Sou_StorageObject_ID", sto.id, SQLOperatorType.EQUALS)
                            }, this.BuVO);

                            distos.ToList().ForEach(disto =>
                            {
                                if (sto.qty == disto.Quantity)
                                {
                                    ADO.DataADO.GetInstant().UpdateBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[] {
                                            new SQLConditionCriteria("DocumentItem_ID", disto.DocumentItem_ID, SQLOperatorType.EQUALS),
                                            new SQLConditionCriteria("Sou_StorageObject_ID", disto.Sou_StorageObject_ID, SQLOperatorType.EQUALS)
                                        }, new KeyValuePair<string, object>[]{
                                            new KeyValuePair<string, object>("Status", EntityStatus.ACTIVE),
                                            new KeyValuePair<string, object>("Des_StorageObject_ID", disto.Sou_StorageObject_ID)
                                        }, this.BuVO);

                                    ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(stos.id.Value, null, null, StorageObjectEventStatus.PICKING, this.BuVO);
                                }
                                else
                                {
                                    var updSto = new StorageObjectCriteria();
                                    updSto = sto;
                                    updSto.baseQty -= disto.BaseQuantity.Value;
                                    updSto.qty -= disto.Quantity.Value;
                                    updSto.parentID = null;
                                    updSto.mapstos = null;
                                    updSto.eventStatus = StorageObjectEventStatus.RECEIVED;

                                    if (updSto.baseQty == 0)
                                    {
                                        updSto.eventStatus = StorageObjectEventStatus.PICKING;
                                        var stoIDUpdated = ADO.StorageObjectADO.GetInstant().PutV2(updSto, this.BuVO);
                                        ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, stoIDUpdated, null, null, EntityStatus.ACTIVE, this.BuVO);
                                    }
                                    else
                                    {
                                        var issuedSto = new StorageObjectCriteria();
                                        issuedSto = sto;
                                        issuedSto.id = null;
                                        issuedSto.baseQty = disto.BaseQuantity.Value;
                                        issuedSto.qty = disto.Quantity.Value;
                                        issuedSto.parentID = null;
                                        issuedSto.mapstos = null;
                                        issuedSto.eventStatus = StorageObjectEventStatus.PICKING;

                                        var stoIDIssued = ADO.StorageObjectADO.GetInstant().PutV2(issuedSto, this.BuVO);

                                        ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, stoIDIssued, null, null, EntityStatus.ACTIVE, this.BuVO);
                                    }
                                    ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(stos.id.Value, null, null, StorageObjectEventStatus.PICKING, this.BuVO);
                                }
                            });
                        });
                    });
                }

                if (queueTrx.EventStatus == WorkQueueEventStatus.WORKED || queueTrx.EventStatus == WorkQueueEventStatus.WORKING)
                {
                    queueTrx.AreaLocationMaster_ID = location.ID;
                    queueTrx.AreaMaster_ID = area.ID.Value;
                    queueTrx.Warehouse_ID = area.Warehouse_ID.Value;

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

        }

        private void UpdateDoneQueueClosedDISTO(TReq reqVO, SPworkQueue queueTrx)
        {
            throw new NotImplementedException();
        }
    }
}
