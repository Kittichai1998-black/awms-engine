using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine;
using AWMSEngine.ADO;
using AWMSEngine.Engine.General;
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
        protected void DoneQueueWorked(TReq reqVO)
        {
            var res = this.ExectProject<TReq, WorkQueueCriteria>(FeatureCode.EXEWM_DoneQueueWorked, reqVO);
            if (res == null)
            {
                var docs = GetDocument(reqVO.queueID.Value);
                docs.ForEach(x =>
                {
                    if (x.DocumentType_ID != DocumentTypeID.AUDIT)
                    {
                        if (ADO.DocumentADO.GetInstant().ListDISTOByDoc(x.ID.Value, this.BuVO).TrueForAll(y => y.Status == EntityStatus.ACTIVE))
                        {
                            ADO.DocumentADO.GetInstant().UpdateStatusToChild(x.ID.Value, DocumentEventStatus.WORKING, null, DocumentEventStatus.WORKED, this.BuVO);
                        }
                    }
                });
            }
        }
        protected void DoneQueueClosing(TReq reqVO)
        {
            var res = this.ExectProject<TReq, WorkQueueCriteria>(FeatureCode.EXEWM_DoneQueueClosing, reqVO);
            if (res == null)
            {
                var docs = GetDocument(reqVO.queueID.Value);
                docs.ForEach(x =>
                {
                    if(x.DocumentType_ID != DocumentTypeID.AUDIT)
                    {
                        if (ADO.DocumentADO.GetInstant().ListDISTOByDoc(x.ID.Value, this.BuVO).TrueForAll(y => y.Status == EntityStatus.ACTIVE))
                        {
                            ADO.DocumentADO.GetInstant().UpdateStatusToChild(x.ID.Value, DocumentEventStatus.WORKED, null, DocumentEventStatus.CLOSING, this.BuVO);
                        }
                    }
                });
            }
        }

        protected void DoneQueueClosed(TReq reqVO)
        {
            var res = this.ExectProject<TReq, WorkQueueCriteria>(FeatureCode.EXEWM_DoneQueueClosed, reqVO);
            if (res == null)
            {
                var docs = GetDocument(reqVO.queueID.Value);
                docs.ForEach(x =>
                {
                    var queue = ADO.WorkQueueADO.GetInstant().Get(reqVO.queueID.Value, this.BuVO);
                    var distos = ADO.DocumentADO.GetInstant().ListDISTOByDoc(x.ID.Value, this.BuVO);

                    if (x.DocumentType_ID == DocumentTypeID.GOODS_RECEIVED)
                    {
                        ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(queue.StorageObject_ID.Value,
                            StorageObjectEventStatus.RECEIVING, null, StorageObjectEventStatus.RECEIVED, this.BuVO);
                    }
                    else if (x.DocumentType_ID == DocumentTypeID.GOODS_ISSUED)
                    {
                        distos.Where(disto => disto.WorkQueue_ID == queue.ID.Value).ToList().ForEach(disto =>
                        {
                            var getArea = new MoveStoInGateToNextArea();
                            var treq = new MoveStoInGateToNextArea.TReq()
                            {
                                baseStoID = queue.StorageObject_ID.Value
                            };
                            getArea.Execute(this.Logger, this.BuVO, treq);

                            if(disto.Sou_StorageObject_ID != disto.Des_StorageObject_ID)
                            {
                                ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(queue.StorageObject_ID.Value,
                                    StorageObjectEventStatus.RECEIVING, null, StorageObjectEventStatus.RECEIVED, this.BuVO);

                                ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(disto.Des_StorageObject_ID.Value,
                                    StorageObjectEventStatus.PICKING, null, StorageObjectEventStatus.PICKED, this.BuVO);
                            }
                            else
                            {
                                ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(queue.StorageObject_ID.Value,
                                    StorageObjectEventStatus.PICKING, null, StorageObjectEventStatus.PICKED, this.BuVO);
                            }
                        });
                    }
                    else if (x.DocumentType_ID == DocumentTypeID.AUDIT)
                    {
                        if (queue.IOType == IOType.INPUT)
                        {
                            ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(queue.StorageObject_ID.Value,
                                    null, null, StorageObjectEventStatus.RECEIVED, this.BuVO);

                            distos.Where(disto => disto.WorkQueue_ID == queue.ID.Value).ToList().ForEach(y =>
                            {
                                DocumentADO.GetInstant().UpdateMappingSTO(y.ID.Value, EntityStatus.ACTIVE, this.BuVO);
                                y.Status = EntityStatus.ACTIVE;
                            });
                        }
                        else
                        {
                            ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(queue.StorageObject_ID.Value,
                                    StorageObjectEventStatus.AUDITING, null, StorageObjectEventStatus.AUDITING, this.BuVO);
                        }
                    }


                    if (distos.TrueForAll(y => y.Status == EntityStatus.ACTIVE))
                    {
                        if (x.DocumentType_ID == DocumentTypeID.AUDIT && queue.IOType == IOType.INPUT)
                        {
                            ADO.DocumentADO.GetInstant().UpdateStatusToChild(x.ID.Value, null, null, DocumentEventStatus.CLOSED, this.BuVO);
                        }
                        else
                        {
                            ADO.DocumentADO.GetInstant().UpdateStatusToChild(x.ID.Value, DocumentEventStatus.CLOSING, null, DocumentEventStatus.CLOSED, this.BuVO);
                        }
                    }
                });
            }
        }

        protected override WorkQueueCriteria ExecuteEngine(TReq reqVO)
        {
            var queueTrx = ADO.WorkQueueADO.GetInstant().Get(reqVO.queueID.Value, this.BuVO);
            if (queueTrx.Des_Warehouse_ID != queueTrx.Warehouse_ID)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Present Location Not Equals Destination Location.");
            this.UpdateStorageObjectLocation(queueTrx, reqVO);
            this.UpdateDocumentItemStorageObject(reqVO, queueTrx);
            return null;
        }

        private List<amt_Document> GetDocument(long queueID)
        {
            List<amt_Document> docs = new List<amt_Document>();

            var docItems = ADO.DocumentADO.GetInstant().ListItemByWorkQueueDisto(queueID, this.BuVO);

            if (docItems.Count > 0)
            {
                var docsCode = docItems.Select(x => x.Document_ID).Distinct().ToList();
                docsCode.ForEach(x =>
                {
                    var doc = ADO.DocumentADO.GetInstant().Get(x, this.BuVO);
                    docs.Add(doc);
                });
            }

            return docs;
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
                    ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(stos.id.Value, null, null, StorageObjectEventStatus.PICKING, this.BuVO);

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
                                    updSto = sto.Clone();
                                    updSto.baseQty -= disto.BaseQuantity.Value;
                                    updSto.qty -= disto.Quantity.Value;

                                    updSto.eventStatus = StorageObjectEventStatus.RECEIVED;

                                    if (updSto.baseQty == 0)
                                    {
                                        updSto.eventStatus = StorageObjectEventStatus.PICKING;
                                    }
                                    else
                                    {
                                        var issuedSto = new StorageObjectCriteria();
                                        issuedSto = sto.Clone();
                                        issuedSto.id = null;
                                        issuedSto.baseQty = disto.BaseQuantity.Value;
                                        issuedSto.qty = disto.Quantity.Value;
                                        issuedSto.parentID = null;
                                        issuedSto.mapstos = null;
                                        issuedSto.eventStatus = StorageObjectEventStatus.PICKING;

                                        var stoIDIssued = ADO.StorageObjectADO.GetInstant().PutV2(issuedSto, this.BuVO);
                                        ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, stoIDIssued, null, null, EntityStatus.ACTIVE, this.BuVO);
                                    }

                                    var stoIDUpdated = ADO.StorageObjectADO.GetInstant().PutV2(updSto, this.BuVO);
                                    ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, stoIDUpdated, null, null, EntityStatus.ACTIVE, this.BuVO);

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

            this.DoneQueueWorked(reqVO);
            this.DoneQueueClosing(reqVO);
            this.DoneQueueClosed(reqVO);
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
    }
}
