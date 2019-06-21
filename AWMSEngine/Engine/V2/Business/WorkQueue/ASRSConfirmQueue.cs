using AMWUtil.Exception;
using AWMSEngine.ADO.QueueApi;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class ASRSConfirmQueue : BaseEngine<ASRSConfirmQueue.TReq, ASRSConfirmQueue.TRes>
    {

        public class TReq : ASRSProcessQueue.TRes
        {
        }
        public class TRes
        {
        }

        public class RootStoProcess
        {
            public List<DocItem> docItems;
            public class DocItem
            {
                public long docID;
                public long docItemID;
                public decimal pstoQty;
                public long pstoUnitID;
                public decimal pstoBaseQty;
                public long pstoBaseUnitID;
            }
            public int priority;

            public long rstoID;
            public long bstoID;
            public long pstoID;
            public string rstoCode;
            public string bstoCode;
            public string pstoCode;

            public decimal pstoQty;
            public long pstoUnitID;

            public decimal pstoBaseQty;
            public long pstoBaseUnitID;

            public long warehouseID;
            public long areaID;
            public long? locationID;

            public long souWarehouseID;
            public long souAreaID;

            public long desWarehouseID;
            public long desAreaID;
            public long? desLocationID;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {

            var docs = ADO.DocumentADO.GetInstant().ListAndItem(reqVO.processResults.GroupBy(x => x.docID).Select(x => x.Key).ToList(), this.BuVO);
            this.ValidateDoc(docs);
            var rstos = this.ListRootStoProcess(reqVO, docs);
            foreach (var rsto in rstos)
            {
                var wq = new SPworkQueue()
                {
                    ID = null,
                    RefID = AMWUtil.Common.ObjectUtil.GenUniqID(),
                    Seq = 1,
                    IOType = IOType.OUTPUT,
                    Priority = rsto.priority,
                    StorageObject_ID = rsto.rstoID,
                    StorageObject_Code = rsto.bstoCode,

                    Warehouse_ID = rsto.warehouseID,
                    AreaMaster_ID = rsto.areaID,
                    AreaLocationMaster_ID = rsto.locationID,

                    Sou_Warehouse_ID = rsto.warehouseID,
                    Sou_AreaMaster_ID = rsto.areaID,
                    Sou_AreaLocationMaster_ID = rsto.locationID,

                    Des_AreaMaster_ID = rsto.desAreaID,
                    Des_Warehouse_ID = rsto.desWarehouseID,
                    Des_AreaLocationMaster_ID = rsto.desAreaID,

                    EventStatus = WorkQueueEventStatus.NEW,
                    Status = EntityStatus.ACTIVE,

                    ActualTime = DateTime.Now,
                    StartTime = DateTime.Now,
                    EndTime = null,

                    Parent_WorkQueue_ID = null,
                    TargetStartTime = null,
                    DocumentItemWorkQueues = null,

                };
                wq = ADO.WorkQueueADO.GetInstant().PUT(wq, this.BuVO);

                long workqueue_id = wq.ID.Value;
                var distos = rsto.docItems.Select(x => new amt_DocumentItemStorageObject()
                {
                    ID = null,
                    Sou_StorageObject_ID = rsto.pstoID,
                    Des_StorageObject_ID = null,
                    DocumentItem_ID = x.docItemID,
                    Quantity = x.pstoQty,
                    BaseQuantity = x.pstoBaseQty,
                    UnitType_ID = x.pstoUnitID,
                    BaseUnitType_ID = x.pstoBaseUnitID,
                    Status = EntityStatus.INACTIVE,
                    WorkQueue_ID = workqueue_id,
                }).ToList();
                ADO.DocumentADO.GetInstant().InsertMappingSTO(distos, this.BuVO);
            };
            docs.ForEach(doc =>
            {
                ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value, DocumentEventStatus.NEW, null, DocumentEventStatus.WORKING, this.BuVO);
            });


            return null;
        }

        private void ValidateWCS(List<RootStoProcess> _pickStos, TReq reqVO)
        {
            WCSQueueApi.TReq req = new WCSQueueApi.TReq()
            {
                queueOut = _pickStos.Select(x => new WCSQueueApi.TReq.queueout()
                {
                    queueID = null,
                    desWarehouseCode = reqVO.desASRSWarehouseCode,
                    desAreaCode = reqVO.desASRSAreaCode,
                    desLocationCode = reqVO.desASRSLocationCode,
                    priority = 0,
                    baseInfo = new WCSQueueApi.TReq.queueout.baseinfo()
                    {
                        baseCode = x.rstoCode,
                        packInfos = null
                    }
                }).ToList()
            };
            var wcsRes = ADO.QueueApi.WCSQueueApi.GetInstant().SendReady(req, this.BuVO);
            if (wcsRes._result.resultcheck == 0)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.B0001, wcsRes._result.resultmessage);
            }
        }

        private List<RootStoProcess> ListRootStoProcess(TReq reqVO, List<amt_Document> docs)
        {
            var desWM = this.StaticValue.Warehouses.First(x => x.Code == reqVO.desASRSAreaCode);
            var desAM = this.StaticValue.AreaMasters.First(x => x.Warehouse_ID == desWM.ID && x.Code == reqVO.desASRSWarehouseCode);
            var desALM = ADO.MasterADO.GetInstant().GetAreaLocationMaster(reqVO.desASRSLocationCode, desAM.ID.Value, this.BuVO);
            List<RootStoProcess> rstoProcs = new List<RootStoProcess>();
            reqVO.processResults.ForEach(
                x => x.processResultItems.ForEach(
                    y => y.pickStos.ForEach(
                        z =>
                        {
                            var doc = docs.First(a => a.ID == x.docID);
                            var rsto = rstoProcs.FirstOrDefault(a => a.rstoID == z.rstoID);
                            if (rsto != null)
                            {
                                rsto.docItems.Add(new RootStoProcess.DocItem()
                                {
                                    docID = x.docID,
                                    docItemID = y.docItemID,
                                    pstoBaseQty = z.pstoBaseQty,
                                    pstoBaseUnitID = z.pstoBaseUnitID,
                                    pstoQty = z.pstoQty,
                                    pstoUnitID = z.pstoUnitID,
                                });
                                rsto.pstoQty += z.pstoQty;
                                rsto.pstoBaseQty += z.pstoBaseQty;
                                rsto.priority = (rsto.priority > y.priority ? rsto.priority : y.priority);
                            }
                            else
                            {
                                rstoProcs.Add(new RootStoProcess()
                                {
                                    //docID = x.docID,
                                    //docItemID = y.docItemID,
                                    docItems = new List<RootStoProcess.DocItem>() {
                                        new RootStoProcess.DocItem()
                                        {
                                            docID = x.docID,
                                            docItemID = y.docItemID,
                                            pstoBaseQty = z.pstoBaseQty,
                                            pstoBaseUnitID = z.pstoBaseUnitID,
                                            pstoQty = z.pstoQty,
                                            pstoUnitID = z.pstoUnitID,
                                        }},
                                    priority = y.priority,

                                    rstoID = z.rstoID,
                                    rstoCode = z.rstoCode,
                                    bstoID = z.bstoID,
                                    bstoCode = z.bstoCode,
                                    pstoID = z.pstoID,
                                    pstoCode = z.pstoCode,

                                    pstoQty = z.pstoQty,
                                    pstoBaseQty = z.pstoBaseQty,
                                    pstoUnitID = z.pstoUnitID,
                                    pstoBaseUnitID = z.pstoBaseUnitID,
                                    
                                    warehouseID = z.warehouseID,
                                    areaID = z.areaID,
                                    locationID = z.locationID,

                                    souWarehouseID = doc.Sou_Warehouse_ID.Value,
                                    souAreaID = doc.Sou_AreaMaster_ID.Value,

                                    desWarehouseID = desWM.ID.Value,
                                    desAreaID = desAM.ID.Value,
                                    desLocationID = desALM == null ? null : desALM.ID,
                                });
                            }
                        })));
            return rstoProcs;
        }
        private void ValidateDoc(List<amt_Document> docs)
        {
            docs.ForEach(x =>
            {
                if (x.EventStatus != DocumentEventStatus.NEW)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "'" + x.Code + "' is not NEW.");
                }
            });
        }
    }
}
