using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO.QueueApi;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Engine.V2.Business.Issued;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace AWMSEngine.Engine.V2.Business.Received
{
    public class RejectGRDocument : BaseEngine<RejectGRDocument.TDocReq, List<long>>
    {

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

                public decimal pickQty;
                public long pickUnitID;
                public decimal pickBaseQty;
                public long pickBaseUnitID;

                public bool useFullPick;
            }
            public long? workQueueID;
            public int priority;

            public long rstoID;
            public string rstoCode;

            public bool lockOnly = false;
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

        public class TDocReq
        {
            public long[] docIDs;
            public long? desAreaID;
            public long? desAreaLocationID;
            public long? souAreaID;
        }

        protected override List<long> ExecuteEngine(TDocReq reqVO)
        {
            List<long> docIDs = new List<long>();
            foreach (var docID in reqVO.docIDs)
            {
                var grDoc = ADO.DocumentADO.GetInstant().Get(docID, this.BuVO);
                if (grDoc.EventStatus == DocumentEventStatus.CLOSING)
                {
                    grDoc.ParentDocument_ID = grDoc.ID;
                    grDoc.ID = null;
                    grDoc.MovementType_ID = MovementType.STO_REJECT;
                    grDoc.DocumentType_ID = DocumentTypeID.GOODS_ISSUED;
                    grDoc.EventStatus = DocumentEventStatus.WORKING;
                    grDoc.Status = EntityStatus.ACTIVE;

                    var grDocItem = ADO.DocumentADO.GetInstant().ListItem(docID, this.BuVO);
                    grDocItem.ForEach(x =>
                    {
                        x.EventStatus = DocumentEventStatus.WORKING;
                        x.Status = EntityStatus.ACTIVE;
                        x.ParentDocumentItem_ID = x.ID;
                        x.ID = null;
                    });

                    grDoc.DocumentItems = grDocItem;

                    var resDocument = ADO.DocumentADO.GetInstant().Create(grDoc, this.BuVO);

                    var grDocItems = ADO.DocumentADO.GetInstant().ListItemAndDisto(docID, this.BuVO);

                    if (!grDocItems.TrueForAll(x => x.DocItemStos.TrueForAll(y => y.Status == EntityStatus.ACTIVE)))
                        throw new AMWException(this.Logger, AMWExceptionCode.B0001, "Cannot Reject Recieve Document");

                    var distos = new List<amt_DocumentItemStorageObject>();
                    grDocItems.ForEach(x => { distos.AddRange(x.DocItemStos); });

                    var groupDisto = distos.GroupBy(x => x.WorkQueue_ID).Select(x => new { wqID = x.Key, distos = x.ToList() }).ToList();

                    groupDisto.ForEach(x =>
                    {
                        var workQueueGR = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_WorkQueue>(new SQLConditionCriteria[]
                        {
                        new SQLConditionCriteria("ID", x.wqID.Value, SQLOperatorType.EQUALS)
                        }, this.BuVO).FirstOrDefault();

                        var sto = ADO.StorageObjectADO.GetInstant().Get(workQueueGR.StorageObject_ID, StorageObjectType.BASE, false, true, this.BuVO);

                        var workQueue = CreateWorkQueue(sto, reqVO.desAreaID.Value, reqVO.desAreaLocationID.Value, sto.areaID.Value, sto.parentID.Value);

                        ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(workQueueGR.StorageObject_ID, StorageObjectEventStatus.RECEIVING, null, StorageObjectEventStatus.PICKING, this.BuVO);

                        List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();
                        x.distos.ForEach(disto =>
                        {
                            var doci = resDocument.DocumentItems.Find(doci => doci.ParentDocumentItem_ID == disto.DocumentItem_ID);
                            if (doci.DocItemStos == null)
                                doci.DocItemStos = new List<amt_DocumentItemStorageObject>();

                            disto.ID = null;
                            disto.WorkQueue_ID = workQueue.ID;
                            disto.Des_StorageObject_ID = null;
                            disto.DocumentType_ID = DocumentTypeID.GOODS_ISSUED;
                            disto.DocumentItem_ID = doci.ID;

                            var resDisto = ADO.DocumentADO.GetInstant().InsertMappingSTO(disto, this.BuVO);

                            doci.DocItemStos.Add(resDisto);
                            docItems.Add(doci);
                        });

                        var rootStoDocItem = new List<RootStoProcess.DocItem>();
                        docItems.ForEach(docItem =>
                        {
                            var doci = resDocument.DocumentItems.Find(doci => doci.ID == docItem.ID);
                            var pstoID = doci.DocItemStos.Find(disto => disto.DocumentItem_ID == docItem.ID).Sou_StorageObject_ID;
                            var stoTree = sto.ToTreeList().FindAll(psto => psto.type == StorageObjectType.PACK && psto.id == pstoID).FirstOrDefault();
                            rootStoDocItem.Add(new RootStoProcess.DocItem
                            {
                                bstoCode = workQueue.StorageObject_Code,
                                bstoID = workQueue.StorageObject_ID.Value,
                                pstoID = stoTree.id.Value,
                                docID = docItem.Document_ID,
                                docItemID = docItem.ID.Value,
                                pickBaseQty = docItem.BaseQuantity.Value,
                                pickBaseUnitID = docItem.BaseUnitType_ID.Value,
                                useFullPick = true,
                                pickQty = docItem.Quantity.Value,
                                pickUnitID = docItem.UnitType_ID.Value,

                            });
                        });

                        var rootSto = new RootStoProcess()
                        {
                            warehouseID = workQueue.Warehouse_ID,
                            areaID = workQueue.AreaMaster_ID,
                            locationID = workQueue.AreaLocationMaster_ID,

                            desWarehouseID = workQueue.Des_Warehouse_ID,
                            desAreaID = workQueue.Des_AreaMaster_ID,
                            desLocationID = workQueue.Des_AreaLocationMaster_ID,

                            lockOnly = false,
                            priority = 2,
                            rstoCode = workQueue.StorageObject_Code,
                            rstoID = workQueue.StorageObject_ID.Value,
                            souAreaID = workQueue.Sou_AreaMaster_ID,
                            souWarehouseID = workQueue.Sou_Warehouse_ID,
                            workQueueID = workQueue.ID.Value,
                            docItems = rootStoDocItem
                        };

                        WCSSendQueue(new List<RootStoProcess>() { rootSto });
                    });

                    docIDs.Add(resDocument.ID.Value);
                    AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(docID, DocumentEventStatus.CLOSING, null, DocumentEventStatus.REJECTED, this.BuVO);
                }
                else if (grDoc.EventStatus == DocumentEventStatus.WORKING)
                {
                    var listItem = ADO.DocumentADO.GetInstant().ListItemAndDisto(grDoc.ID.Value, this.BuVO);
                    listItem.ForEach(item =>
                    {
                        item.DocItemStos.ForEach(disto =>
                        {
                            if (disto.Status == EntityStatus.INACTIVE)
                            {
                                var wq = ADO.WorkQueueADO.GetInstant().Get(disto.WorkQueue_ID.Value, this.BuVO);
                                var baseSto = ADO.StorageObjectADO.GetInstant().Get(wq.StorageObject_ID.Value, StorageObjectType.BASE, false, true, this.BuVO);
                                if (baseSto.eventStatus == StorageObjectEventStatus.RECEIVING)
                                {
                                    var area = StaticValueManager.GetInstant().AreaMasters.Find(x => x.ID == baseSto.areaID);
                                    if (area.AreaMasterType_ID == AreaMasterTypeID.MACHINE_GATE || area == null)
                                    {
                                        ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(baseSto.id.Value, StorageObjectEventStatus.RECEIVING, null, StorageObjectEventStatus.REJECTED, this.BuVO);
                                        ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, EntityStatus.REMOVE, this.BuVO);
                                        disto.Status = EntityStatus.REMOVE;
                                    }
                                    else
                                    {
                                        throw new AMWException(this.Logger, AMWExceptionCode.B0001, "Cannot Reject Document Because Pallet in Process");
                                    }
                                }
                            }

                        });
                        if (item.DocItemStos.TrueForAll(disto => disto.Status == EntityStatus.REMOVE))
                        {
                            ADO.DocumentADO.GetInstant().UpdateItemEventStatus(item.ID.Value, DocumentEventStatus.REJECTED, this.BuVO);
                            var status = StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<DocumentEventStatus>(DocumentEventStatus.REJECTED);
                            item.EventStatus = DocumentEventStatus.REJECTED;
                            item.Status = status.Value;
                        }
                    });

                    if (listItem.TrueForAll(item => item.EventStatus == DocumentEventStatus.REJECTED))
                    {
                        ADO.DocumentADO.GetInstant().UpdateEventStatus(docID, DocumentEventStatus.REJECTED, this.BuVO);
                    }
                }
                else if (grDoc.EventStatus == DocumentEventStatus.NEW)
                {
                    ADO.DocumentADO.GetInstant().UpdateEventStatus(docID, DocumentEventStatus.REJECTED, this.BuVO);
                }

            }
            return docIDs;
        }

        private void WCSSendQueue(List<RootStoProcess> rstos)
        {
            var getRsto = ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[] {
                new SQLConditionCriteria("ID", string.Join(",", rstos.Select(x => x.rstoID).Distinct().ToArray()), SQLOperatorType.IN)
            }, this.BuVO);

            WCSQueueADO.TReq wcQueue = new WCSQueueADO.TReq() { queueOut = new List<WCSQueueADO.TReq.queueout>() };
            rstos.FindAll(rsto =>
            {
                var area = StaticValue.AreaMasters.First(x => x.ID == rsto.souAreaID);
                //var areaType = StaticValue.AreaMasterTypes.First(x => x.ID == area.AreaMasterType_ID);
                //return areaType.ID == 10;
                return area.AreaMasterType_ID == AreaMasterTypeID.STORAGE_ASRS;
            }
            ).ForEach(rsto =>
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
                        eventStatus = getRsto.FirstOrDefault(y => y.ID == rsto.rstoID).EventStatus,
                        baseCode = rsto.rstoCode,
                        packInfos = rsto.docItems.Select(x => new WCSQueueADO.TReq.queueout.baseinfo.packinfo()
                        {
                            batch = x.pstoBatch,
                            lot = x.pstoLot,
                            skuCode = x.pstoCode,
                            skuQty = x.pickBaseQty
                        }).ToList()
                    }

                });
            });


            var wcsRes = ADO.QueueApi.WCSQueueADO.GetInstant().SendQueue(wcQueue, this.BuVO);
            if (wcsRes._result.resultcheck == 0)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.B0001, "Pallet has Problems.");
            }
        }

        private SPworkQueue CreateWorkQueue(StorageObjectCriteria sto, long desAreaID, long desAreaLocationID, long souAreaID, long souAreaLocation)
        {
            var souArea = this.StaticValue.AreaMasters.First(x => x.ID == souAreaID);
            var desArea = this.StaticValue.AreaMasters.First(x => x.ID == desAreaID);

            var desAreaLocation = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_AreaLocationMaster>(desAreaLocationID, this.BuVO);
            if (desAreaLocation == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Location Not Found");

            SPworkQueue workQ = new SPworkQueue()
            {
                ID = null,
                IOType = IOType.OUTPUT,
                ActualTime = DateTime.Now,
                Parent_WorkQueue_ID = null,
                Priority = 1,
                TargetStartTime = null,

                StorageObject_ID = sto.id,
                StorageObject_Code = sto.code,

                Warehouse_ID = souArea.Warehouse_ID.Value,
                AreaMaster_ID = souArea.ID.Value,
                AreaLocationMaster_ID = souAreaLocation,

                Sou_Warehouse_ID = souArea.Warehouse_ID.Value,
                Sou_AreaMaster_ID = souArea.ID.Value,
                Sou_AreaLocationMaster_ID = souAreaLocation,

                Des_Warehouse_ID = desArea.Warehouse_ID.Value,
                Des_AreaMaster_ID = desArea.ID.Value,
                Des_AreaLocationMaster_ID = desAreaLocation.ID.Value,

                EventStatus = WorkQueueEventStatus.WORKING,
                Status = EntityStatus.ACTIVE,
                StartTime = DateTime.Now

                //DocumentItemWorkQueues = Common.ConverterModel.ToDocumentItemWorkQueue(docItems, sto)
            };
            workQ = ADO.WorkQueueADO.GetInstant().PUT(workQ, this.BuVO);
            return workQ;
        }
    }
}
