using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine;
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
        protected WorkQueueCriteria DoneQueueWorked(TReq reqVO)
        {
            var res = this.ExectProject<TReq, WorkQueueCriteria>(FeatureCode.EXEWM_DoneQueueWorked, reqVO);
            if (res == null)
            {
                var docs = GetDocument(reqVO.queueID.Value);
                docs.ForEach(x =>
                {
                    if(ADO.DocumentADO.GetInstant().ListDISTOByDoc(x.ID.Value, this.BuVO).TrueForAll(y => y.Status == EntityStatus.ACTIVE))
                    {
                        ADO.DocumentADO.GetInstant().UpdateStatusToChild(x.ID.Value, DocumentEventStatus.WORKING, null, DocumentEventStatus.WORKED, this.BuVO);
                    }
                });
            }
            return res;
        }
        protected WorkQueueCriteria DoneQueueClosing(TReq reqVO)
        {
            var res = this.ExectProject<TReq, WorkQueueCriteria>(FeatureCode.EXEWM_DoneQueueClosing, reqVO);
            if (res == null)
            {
                var docs = GetDocument(reqVO.queueID.Value);
                docs.ForEach(x =>
                {
                    if (ADO.DocumentADO.GetInstant().ListDISTOByDoc(x.ID.Value, this.BuVO).TrueForAll(y => y.Status == EntityStatus.ACTIVE))
                    {
                        ADO.DocumentADO.GetInstant().UpdateStatusToChild(x.ID.Value, DocumentEventStatus.WORKED, null, DocumentEventStatus.CLOSING, this.BuVO);
                    }
                });
            }
            return res;
        }

        protected WorkQueueCriteria DoneQueueClosed(TReq reqVO)
        {
            var res = this.ExectProject<TReq, WorkQueueCriteria>(FeatureCode.EXEWM_DoneQueueClosed, reqVO);
            if (res == null)
            {
                var docs = GetDocument(reqVO.queueID.Value);
                docs.ForEach(x =>
                {
                    if (ADO.DocumentADO.GetInstant().ListDISTOByDoc(x.ID.Value, this.BuVO).TrueForAll(y => y.Status == EntityStatus.ACTIVE))
                    {
                        ADO.DocumentADO.GetInstant().UpdateStatusToChild(x.ID.Value, DocumentEventStatus.CLOSING, null, DocumentEventStatus.CLOSED, this.BuVO);
                    }
                });
            }
            return res;
        }

        protected override WorkQueueCriteria ExecuteEngine(TReq reqVO)
        {
            var queueTrx = ADO.WorkQueueADO.GetInstant().Get(reqVO.queueID.Value, this.BuVO);
            this.UpdateStorageObjectLocation(queueTrx, reqVO);
            this.UpdateDocumentItemStorageObject(reqVO, queueTrx);
            return null;
        }

        private List<amt_Document> GetDocument(long queueID)
        {
            List<amt_Document> docs = new List<amt_Document>();
            var docItems = ADO.DocumentADO.GetInstant().ListItemByWorkQueue(queueID, this.BuVO);
            var docsCode = docItems.Select(x => x.Document_ID).Distinct().ToList();
            docsCode.ForEach(x =>
            {
                var doc = ADO.DocumentADO.GetInstant().Get(x, this.BuVO);
                docs.Add(doc);
            });

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
            var stoList = stos.ToTreeList().Where(x=> x.type == StorageObjectType.PACK).ToList();
            var docItems = ADO.DocumentADO.GetInstant().ListItemByWorkQueue(reqVO.queueID.Value, this.BuVO).Select(x=> new { x.ID, x.Document_ID}).Distinct().ToList();

            if(queueTrx.Des_Warehouse_ID == warehouse.ID.Value)
            {
                if (queueTrx.IOType == IOType.INPUT)
                {
                    docItems.ForEach(docItem =>
                    {
                        stoList.ForEach(sto =>
                        {
                            var distos = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                            {
                            new SQLConditionCriteria("DocumentItem_ID", docItem.ID, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("StorageObject_ID", sto.id, SQLOperatorType.EQUALS)
                            }, this.BuVO);

                            distos.ForEach(disto =>
                            {
                                ADO.DataADO.GetInstant().UpdateBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[] {
                                new SQLConditionCriteria("DocumentItem_ID", docItem.ID, SQLOperatorType.EQUALS),
                                new SQLConditionCriteria("StorageObject_ID", sto.id, SQLOperatorType.EQUALS)
                            }, new KeyValuePair<string, object>[]{
                                new KeyValuePair<string, object>("Status", EntityStatus.ACTIVE)
                            }, this.BuVO);
                            });
                        });
                    });

                    ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(stos.id.Value, StorageObjectEventStatus.RECEIVING, null, StorageObjectEventStatus.RECEIVED, this.BuVO);
                }
                else if (queueTrx.IOType == IOType.OUTPUT)
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

                                    var stoIDUpdated = ADO.StorageObjectADO.GetInstant().PutV2(updSto, this.BuVO);

                                    var issuedSto = new StorageObjectCriteria();
                                    issuedSto = sto;
                                    issuedSto.id = null;
                                    issuedSto.baseQty = disto.BaseQuantity.Value;
                                    issuedSto.qty = disto.Quantity.Value;
                                    issuedSto.parentID = null;
                                    issuedSto.mapstos = null;
                                    issuedSto.eventStatus = StorageObjectEventStatus.PICKING;

                                    var stoIDIssued = ADO.StorageObjectADO.GetInstant().PutV2(issuedSto, this.BuVO);

                                    ADO.DataADO.GetInstant().UpdateBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[] {
                                            new SQLConditionCriteria("DocumentItem_ID", disto.DocumentItem_ID, SQLOperatorType.EQUALS),
                                            new SQLConditionCriteria("Sou_StorageObject_ID", disto.Sou_StorageObject_ID, SQLOperatorType.EQUALS),
                                            new SQLConditionCriteria("DocumentType_ID", DocumentTypeID.GOODS_ISSUED, SQLOperatorType.EQUALS)
                                        }, new KeyValuePair<string, object>[]{
                                            new KeyValuePair<string, object>("Status", EntityStatus.ACTIVE),
                                            new KeyValuePair<string, object>("Des_StorageObject_ID", stoIDIssued)
                                        }, this.BuVO);

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

        private StorageObjectCriteria UpdateStorageObjectLocation(SPworkQueue queueTrx, TReq reqVO)
        {
            var mapsto = ADO.StorageObjectADO.GetInstant().Get(queueTrx.StorageObject_ID.Value, StorageObjectType.BASE, false, true, this.BuVO);
            if (mapsto.parentType != StorageObjectType.LOCATION)
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ข้อมูลพาเลทไม่ถูกต้อง");

            ADO.StorageObjectADO.GetInstant().UpdateLocationToChild(mapsto, queueTrx.AreaLocationMaster_ID.Value, this.BuVO);

            return mapsto;
        }
    }
}
