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
    public class ASRSConfirmProcessQueue : BaseEngine<ASRSConfirmProcessQueue.TReq, ASRSConfirmProcessQueue.TRes>
    {

        public class TReq : ASRSProcessQueue.TRes
        {
        }
        public class TRes
        {
            public List<RootStoProcess> confirmResult;
            public List<amt_Document> docGRCrossDocks;
        }

        public class RootStoProcess
        {
            public List<DocItem> docItems;
            public class DocItem
            {
                public long docID;
                public long docItemID;

                public long bstoID;
                public string bstoCode;

                public long pstoID;
                public string pstoCode;
                public string pstoBatch;
                public string pstoLot;
                public string pstoOrderNo;
                public string pstoOptions;

                public decimal pstoQty;
                public long pstoUnitID;
                public decimal pstoBaseQty;
                public long pstoBaseUnitID;
            }
            public long? workQueueID;
            public int priority;

            public long rstoID;
            public string rstoCode;

            //public decimal pstoQty;
            //public long pstoUnitID;

            //public decimal pstoBaseQty;
            //public long pstoBaseUnitID;

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
            if (docs.Count() == 0)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Document not Found");
            StorageObjectEventStatus stoNextEventStatus;
            if (docs.First().DocumentType_ID == DocumentTypeID.GOODS_ISSUED)
                stoNextEventStatus = StorageObjectEventStatus.PICKING;
            else if (docs.First().DocumentType_ID == DocumentTypeID.AUDIT)
                stoNextEventStatus = StorageObjectEventStatus.AUDITING;
            else
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Document not " + docs.First().DocumentType_ID + " not Support");

            this.ValidateDocAndInitDisto(docs);
            var rstos = this.ListRootStoProcess(reqVO, docs);
            List<amt_DocumentItemStorageObject> distos = new List<amt_DocumentItemStorageObject>();
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
                    StorageObject_Code = rsto.rstoCode,

                    Warehouse_ID = rsto.warehouseID,
                    AreaMaster_ID = rsto.areaID,
                    AreaLocationMaster_ID = rsto.locationID,

                    Sou_Warehouse_ID = rsto.warehouseID,
                    Sou_AreaMaster_ID = rsto.areaID,
                    Sou_AreaLocationMaster_ID = rsto.locationID,

                    Des_AreaMaster_ID = rsto.desAreaID,
                    Des_Warehouse_ID = rsto.desWarehouseID,
                    Des_AreaLocationMaster_ID = rsto.desLocationID,

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
                rsto.workQueueID = wq.ID;

                var _distos = rsto.docItems.Select(x => new amt_DocumentItemStorageObject()
                {
                    ID = null,
                    Sou_StorageObject_ID = x.pstoID,
                    Des_StorageObject_ID = null,
                    DocumentItem_ID = x.docItemID,
                    Quantity = x.pstoQty,
                    BaseQuantity = x.pstoBaseQty,
                    UnitType_ID = x.pstoUnitID,
                    BaseUnitType_ID = x.pstoBaseUnitID,
                    Status = EntityStatus.INACTIVE,
                    WorkQueue_ID = wq.ID.Value,
                }).ToList();
                _distos = ADO.DocumentADO.GetInstant().InsertMappingSTO(_distos, this.BuVO);
                distos.AddRange(_distos);
            };
            docs.ForEach(doc =>
            {
                doc.DocumentItems.ForEach(doci =>
                {
                    doci.DocItemStos.AddRange(distos.FindAll(disto => disto.DocumentItem_ID == doci.ID));
                });
                if (rstos.Any(x=>x.docItems.Any(y => y.docID == doc.ID)))
                    ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value, DocumentEventStatus.NEW, null, DocumentEventStatus.WORKING, this.BuVO);
                else
                    ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value, DocumentEventStatus.NEW, null, DocumentEventStatus.CLOSED, this.BuVO);
            });

            rstos.ForEach(x =>
            {
                ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(x.rstoID, null, EntityStatus.ACTIVE, stoNextEventStatus, this.BuVO);
            });

            /////////////////////////////////CREATE Document(GR) Cross Dock
            var docGRCDs = Common.FeatureExecute.ExectProject<List<amt_Document>, List<amt_Document>>(FeatureCode.EXEWM_ASRSConfirmProcessQueue_CreateGRCrossDock, this.Logger, this.BuVO, docs);

            this.WCSSendQueue(rstos);

            return new TRes() { confirmResult = rstos, docGRCrossDocks = docGRCDs };
        }

        private void WCSSendQueue(List<RootStoProcess> rstos)
        {
            WCSQueueADO.TReq wcQueue = new WCSQueueADO.TReq() { queueOut = new List<WCSQueueADO.TReq.queueout>() };
            rstos.ForEach(rsto =>
            {
                wcQueue.queueOut.Add(new WCSQueueADO.TReq.queueout()
                {
                    priority = rsto.priority,
                    queueID = rsto.workQueueID.Value,
                    desWarehouseCode = this.StaticValue.GetWarehousesCode(rsto.desWarehouseID),
                    desAreaCode = this.StaticValue.GetAreaMasterCode(rsto.desAreaID),
                    desLocationCode = rsto.desLocationID.HasValue ?
                                           ADO.MasterADO.GetInstant().GetAreaLocationMaster(rsto.desLocationID.Value, this.BuVO).Code :
                                           null,

                    baseInfo = new WCSQueueADO.TReq.queueout.baseinfo()
                    {
                        baseCode = rsto.rstoCode,
                        packInfos = rsto.docItems.Select(x => new WCSQueueADO.TReq.queueout.baseinfo.packinfo()
                        {
                            batch = x.pstoBatch,
                            lot = x.pstoLot,
                            skuCode = x.pstoCode,
                            skuQty = x.pstoBaseQty
                        }).ToList()
                    }

                });
            });

            
            var wcsRes = ADO.QueueApi.WCSQueueADO.GetInstant().SendQueue(wcQueue, this.BuVO);
            if (wcsRes._result.resultcheck == 0)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.B0001, wcsRes._result.resultmessage);
            }
        }

        private List<RootStoProcess> ListRootStoProcess(TReq reqVO, List<amt_Document> docs)
        {
            var desWM = this.StaticValue.Warehouses.First(x => x.Code == reqVO.DesASRSWarehouseCode);
            var desAM = this.StaticValue.AreaMasters.First(x => x.Warehouse_ID == desWM.ID && x.Code == reqVO.DesASRSAreaCode);
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

                                    bstoID = z.bstoID,
                                    bstoCode = z.bstoCode,
                                    pstoID = z.pstoID,
                                    pstoCode = z.pstoCode,

                                    pstoQty = z.pstoQty,
                                    pstoBaseQty = z.pstoBaseQty,
                                    pstoUnitID = z.pstoUnitID,
                                    pstoBaseUnitID = z.pstoBaseUnitID,
                                });
                                //rsto.pstoQty += z.pstoQty;
                                //rsto.pstoBaseQty += z.pstoBaseQty;
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

                                            bstoID = z.bstoID,
                                            bstoCode = z.bstoCode,
                                            pstoID = z.pstoID,
                                            pstoCode = z.pstoCode,

                                            pstoQty = z.pstoQty,
                                            pstoBaseQty = z.pstoBaseQty,
                                            pstoUnitID = z.pstoUnitID,
                                            pstoBaseUnitID = z.pstoBaseUnitID,

                                        }},
                                    priority = y.priority,

                                    rstoID = z.rstoID,
                                    rstoCode = z.rstoCode,
                                    
                                    warehouseID = z.warehouseID,
                                    areaID = z.areaID,
                                    locationID = z.locationID,

                                    souWarehouseID = z.warehouseID,
                                    souAreaID = z.areaID,

                                    desWarehouseID = desWM.ID.Value,
                                    desAreaID = desAM.ID.Value,
                                    desLocationID = desALM == null ? null : desALM.ID,
                                });
                            }
                        })));
            return rstoProcs;
        }
        private void ValidateDocAndInitDisto(List<amt_Document> docs)
        {
            docs.ForEach(x =>
            {
                x.DocumentItems.ForEach(doci => doci.DocItemStos = new List<amt_DocumentItemStorageObject>());
                if (x.EventStatus != DocumentEventStatus.NEW)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "'" + x.Code + "' is not NEW.");
                }
            });
        }
    }
}
