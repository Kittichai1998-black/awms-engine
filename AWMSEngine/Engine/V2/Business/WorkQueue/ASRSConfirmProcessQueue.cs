using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO.QueueApi;
using AWMSEngine.Common;
using AWMSEngine.Engine.V2.Business.Issued;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
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
            public bool isSetQtyAfterDoneWQ = true;
        }
        public class TRes
        {
            public List<RootStoProcess> confirmResult;
            public List<amt_Document> docGRCrossDocks;
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
                //create model workqueue
                if (!rsto.lockOnly && this.StaticValue.GetAreaMasterGroupType(rsto.areaID) == AreaMasterGroupType.STORAGE_AUTO)
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

                        Des_AreaMaster_ID = rsto.desAreaID.Value,
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
                }


                var _distos = rsto.docItems.Select(x => new amt_DocumentItemStorageObject()
                {
                    ID = null,
                    Sou_StorageObject_ID = x.pstoID,
                    Des_StorageObject_ID = null,
                    DocumentItem_ID = x.docItemID,
                    Quantity = reqVO.isSetQtyAfterDoneWQ && !rsto.lockOnly && !x.useFullPick ? null : (decimal?)x.pickQty,// เซตค่าตอน DoneWQ
                    BaseQuantity = reqVO.isSetQtyAfterDoneWQ && !rsto.lockOnly && !x.useFullPick ? null : (decimal?)x.pickBaseQty,// เซตค่าตอน DoneWQ
                    UnitType_ID = x.pickUnitID,
                    BaseUnitType_ID = x.pickBaseUnitID,
                    Status = rsto.lockOnly ? EntityStatus.ACTIVE : EntityStatus.INACTIVE,
                    WorkQueue_ID = rsto.workQueueID,
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
                if (rstos.Any(x => x.docItems.Any(y => y.docID == doc.ID)))
                    ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value, DocumentEventStatus.NEW, null, DocumentEventStatus.WORKING, this.BuVO);
                else
                    ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value, DocumentEventStatus.NEW, null, DocumentEventStatus.CLOSED, this.BuVO);
            });

            //create by anon
            rstos.ForEach(x =>
            {
                //New GI For Multi SKU
                var pickFullBases = x.docItems.FindAll(docItem => docItem.useFullPick == true).Select(docItem => docItem.bstoID).Distinct().ToList();
                if (pickFullBases.Count > 0)
                {
                    var packLists = x.docItems.Select(docItem => docItem.pstoID).Distinct().ToList();
                    var packCodeLists = x.docItems.Select(docItem => docItem.pstoCode).Distinct().ToList();
                    var listSTOLeft = ADO.StorageObjectADO.GetInstant().ListLeftSTO(pickFullBases, packLists, this.BuVO);

                    var groupSTOLeft = listSTOLeft.GroupBy(sto => new { sto.BaseCode, sto.BaseUnit })
                    .Select(sto => new { sto.Key.BaseCode, sto.Key.BaseUnit, StorageObject = sto.ToList() }).ToList();

                    groupSTOLeft.ForEach(gsto =>
                    {
                        var createGI = new CreateGIDocument();
                        var res = createGI.Execute(this.Logger, this.BuVO, new CreateGIDocument.TReq
                        {
                            refID = null,
                            ref1 = null,
                            ref2 = null,
                            souBranchID = this.StaticValue.Warehouses.First(wh => wh.ID == x.souWarehouseID).Branch_ID,
                            souWarehouseID = this.StaticValue.Warehouses.First(wh => wh.ID == x.souWarehouseID).ID,
                            souAreaMasterID = this.StaticValue.Warehouses.First(wh => wh.ID == x.souAreaID).Branch_ID,
                            desAreaMasterID = null,
                            movementTypeID = DocumentProcessTypeID.FG_TRANSFER_WM,
                            lot = null,
                            batch = null,
                            documentDate = DateTime.Now,
                            actionTime = DateTime.Now,
                            eventStatus = DocumentEventStatus.NEW,
                            issueItems = new List<CreateGIDocument.TReq.IssueItem>() {
                                    new CreateGIDocument.TReq.IssueItem
                                    {
                                        packCode = gsto.BaseCode,
                                        quantity = null,
                                        unitType = gsto.BaseUnit,
                                        batch = null,
                                        lot = null,
                                        orderNo = null,
                                        ref2 = null,
                                        options = null,
                                        eventStatus = DocumentEventStatus.NEW
                                    }
                                }
                        });

                        gsto.StorageObject.ForEach(sto =>
                        {
                            var disto = ADO.DocumentADO.GetInstant().InsertMappingSTO(new amt_DocumentItemStorageObject()
                            {
                                DocumentItem_ID = res.DocumentItems.First().ID,
                                DocumentType_ID = DocumentTypeID.GOODS_ISSUED,
                                BaseQuantity = sto.BaseQuantity,
                                BaseUnitType_ID = sto.BaseUnitType_ID,
                                Quantity = sto.Quantity,
                                UnitType_ID = sto.UnitType_ID,
                                Sou_StorageObject_ID = sto.ID.Value,
                                Des_StorageObject_ID = sto.ID,
                                WorkQueue_ID = x.workQueueID.Value
                            }, this.BuVO);
                        });
                    });
                }

                ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(x.rstoID, 
                    null, 
                    EntityStatus.ACTIVE, 
                    stoNextEventStatus, 
                    true, 
                    x.stoDoneSouEventStatus, 
                    x.stoDoneDesEventStatus, 
                    this.BuVO);
            });

            /////////////////////////////////CREATE Document(GR) Cross Dock
            var docGRCDs = Common.FeatureExecute.ExectProject<List<amt_Document>, List<amt_Document>>(FeatureCode.EXEWM_ASRSConfirmProcessQueue_CreateGRCrossDock, this.Logger, this.BuVO, docs);

            this.WCSSendQueue(rstos);

            return new TRes() { confirmResult = rstos, docGRCrossDocks = docGRCDs };
        }

        private void WCSSendQueue(List<RootStoProcess> rstos)
        {

            WCSQueueADO.TReq wcQueue = new WCSQueueADO.TReq() { queueOut = new List<WCSQueueADO.TReq.queueout>() };
            var groupQueueWcs = Common.FeatureExecute.ExectProject<List<RootStoProcess>, WCSQueueADO.TReq>(FeatureCode.EXEWM_ASRSConfirmProcessQueue_SendQueueWCS, this.Logger, this.BuVO, rstos);
            if (groupQueueWcs == null)
            {
                var getRsto = ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[] {
                    new SQLConditionCriteria("ID", string.Join(",", rstos.Select(x => x.rstoID).Distinct().ToArray()), SQLOperatorType.IN)
                }, this.BuVO);

            //WCSQueueADO.TReq wcQueue = new WCSQueueADO.TReq() { queueOut = new List<WCSQueueADO.TReq.queueout>() };
            //priority queue by doc and dicitem @Anon	
            //find for send wcs
            var groupRstos = rstos.FindAll(rsto =>
            {
                return StaticValue.GetAreaMasterGroupType(rsto.souAreaID) == AreaMasterGroupType.STORAGE_AUTO;
            }).GroupBy(x =>
            {
                var docID = x.docItems.Select(y => y.docID).First();
                return docID;
            }).Select(x => new { docID = x.Key, rstos = x.ToList() }).ToList();

                groupRstos.ForEach(rstoByDoc =>
                {
                    var docItemGroup = rstoByDoc.rstos.GroupBy(x => x.docItems.Select(y => y.docItemID).First()).Select(x => new { docItemID = x.Key, rstos = x.ToList() }).ToList();
                    var groupSeq = ADO.DataADO.GetInstant().NextNum("GroupSeqProcess", false, this.BuVO);
                    int seq = 1;
                    docItemGroup.ForEach(rstoByDocID =>
                    {
                        rstoByDocID.rstos.ForEach(rsto =>
                        {
                            wcQueue.queueOut.Add(new WCSQueueADO.TReq.queueout()
                            {
                                priority = rsto.priority,
                                queueID = rsto.workQueueID.Value,
                                desWarehouseCode = this.StaticValue.GetWarehousesCode(rsto.desWarehouseID),
                                desAreaCode = this.StaticValue.GetAreaMasterCode(rsto.desAreaID.Value),
                                desLocationCode = rsto.desLocationID.HasValue ?
                                               ADO.MasterADO.GetInstant().GetAreaLocationMaster(rsto.desLocationID.Value, this.BuVO).Code :
                                               null,

                                baseInfo = new WCSQueueADO.TReq.queueout.baseinfo()
                                {
                                    eventStatus = getRsto.FirstOrDefault(y => y.ID == rsto.rstoID).EventStatus,
                                    baseCode = rsto.rstoCode,
                                    pickSeqGroup = groupSeq.ToString(),
                                    pickSeqIndex = seq,
                                    packInfos = rsto.docItems.Select(x => new WCSQueueADO.TReq.queueout.baseinfo.packinfo()
                                    {
                                        batch = x.pstoBatch,
                                        lot = x.pstoLot,
                                        skuCode = x.pstoCode,
                                        skuQty = x.pickBaseQty,
                                    }).ToList()
                                }

                            });
                        });
                        seq++;
                    });
                });
            }
            else
            {
                wcQueue = groupQueueWcs;
            }
            //priority queue by doc and dicitem @Anon	
            

            //rstos.FindAll(rsto =>	
            //{	
            //    var area = StaticValue.AreaMasters.First(x => x.ID == rsto.souAreaID);	
            //    var areaType = StaticValue.AreaMasterTypes.First(x => x.ID == area.AreaMasterType_ID);	
            //    return areaType.groupType == AreaMasterGroupType.STORAGE;	
            //}	
            //).ForEach(rsto =>	
            //{	
            //    wcQueue.queueOut.Add(new WCSQueueADO.TReq.queueout()	
            //    {	
            //        priority = rsto.priority,	
            //        queueID = rsto.workQueueID.Value,	
            //        desWarehouseCode = this.StaticValue.GetWarehousesCode(rsto.desWarehouseID),	
            //        desAreaCode = this.StaticValue.GetAreaMasterCode(rsto.desAreaID),	
            //        desLocationCode = rsto.desLocationID.HasValue ?	
            //                               ADO.MasterADO.GetInstant().GetAreaLocationMaster(rsto.desLocationID.Value, this.BuVO).Code :	
            //                               null,	
            //        pickSeqGroup=0,	
            //        pickSeqIndex=0,	

            //        baseInfo = new WCSQueueADO.TReq.queueout.baseinfo()	
            //        {	
            //            eventStatus = getRsto.FirstOrDefault(y => y.ID == rsto.rstoID).EventStatus,	
            //            baseCode = rsto.rstoCode,	
            //            packInfos = rsto.docItems.Select(x => new WCSQueueADO.TReq.queueout.baseinfo.packinfo()	
            //            {	
            //                batch = x.pstoBatch,	
            //                lot = x.pstoLot,	
            //                skuCode = x.pstoCode,	
            //                skuQty = x.pickBaseQty	
            //            }).ToList()	
            //        }	

            //    });	
            //});
            if (wcQueue.queueOut.Count > 0)
            {
                var wcsRes = ADO.QueueApi.WCSQueueADO.GetInstant().SendQueue(wcQueue, this.BuVO);
                if (wcsRes._result.resultcheck == 0)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "Pallet has Problems.");
                }
            }
        }

        private List<RootStoProcess> ListRootStoProcess(TReq reqVO, List<amt_Document> docs)
        {
            var desWM = this.StaticValue.Warehouses.First(x => x.Code == reqVO.desASRSWarehouseCode);
            var desAM = this.StaticValue.AreaMasters.First(x => x.Warehouse_ID == desWM.ID && x.Code == reqVO.desASRSAreaCode);
            var desALM = ADO.MasterADO.GetInstant().GetAreaLocationMaster(reqVO.desASRSLocationCode, desAM.ID.Value, this.BuVO);
            List<RootStoProcess> rstoProcs = new List<RootStoProcess>();
            reqVO.processResults.ForEach(x =>
            {
                StorageObjectEventStatus? stoDoneSouEventStatus = null;
                StorageObjectEventStatus? stoDoneDesEventStatus = null;
                var doc = ADO.DocumentADO.GetInstant().Get(x.docID, this.BuVO);
                var statusSTO = Common.FeatureExecute.ExectProject<amt_Document, ProcessQueueDoneStatus>(FeatureCode.EXEWM_CUSTOM_STO_EVENTSTATUS, this.Logger, this.BuVO, doc);
                if (statusSTO != null)
                {
                    stoDoneSouEventStatus = statusSTO.stoDoneSouEventStatus;
                    stoDoneDesEventStatus = statusSTO.stoDoneDesEventStatus;
                }

                x.processResultItems.ForEach(y =>
                {
                    y.pickStos.ForEach(z => { AddRootStoProcess(z, false); });
                    if (y.lockStos != null)
                        y.lockStos.ForEach(z => { AddRootStoProcess(z, true); });
                    void AddRootStoProcess(SPOutSTOProcessQueueCriteria z, bool lockOnly)
                    {
                        var doc = docs.First(a => a.ID == x.docID);
                        var rsto = rstoProcs.FirstOrDefault(a => a.rstoID == z.rstoID);
                        if (rsto != null)
                        {
                            rsto.lockOnly = lockOnly;
                            rsto.docItems.Add(new RootStoProcess.DocItem()
                            {
                                docID = x.docID,
                                docItemID = y.docItemID,

                                bstoID = z.bstoID,
                                bstoCode = z.bstoCode,
                                pstoID = z.pstoID,
                                pstoCode = z.pstoCode,

                                pickQty = z.pickQty,
                                pickBaseQty = z.pickBaseQty,
                                pickUnitID = z.pstoUnitID,
                                pickBaseUnitID = z.pstoBaseUnitID,

                                useFullPick = z.useFullPick,
                            });

                            rsto.stoDoneSouEventStatus = stoDoneSouEventStatus;
                            rsto.stoDoneDesEventStatus = stoDoneDesEventStatus;
                            //rsto.pstoQty += z.pstoQty;
                            //rsto.pstoBaseQty += z.pstoBaseQty;
                            rsto.priority = (rsto.priority > y.priority ? rsto.priority : y.priority);
                        }
                        else
                        {
                            rstoProcs.Add(new RootStoProcess()
                            {
                                lockOnly = lockOnly,
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

                                            pickQty = z.pickQty,
                                            pickBaseQty = z.pickBaseQty,
                                            pickUnitID = z.pstoUnitID,
                                            pickBaseUnitID = z.pstoBaseUnitID,

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
                    }
                });
            });
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
