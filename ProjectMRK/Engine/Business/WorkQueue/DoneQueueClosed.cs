using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AMWUtil.Logger;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Common;
using AWMSEngine.Engine;
using AWMSEngine.Engine.General;
using AWMSEngine.Engine.V2.Business.Issued;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;

namespace ProjectMRK.Engine.Business.WorkQueue
{
    public class DoneQueueClosed : IProjectEngine<DoneQueue.TReq, WorkQueueCriteria>
    {
        public WorkQueueCriteria ExecuteEngine(AMWLogger logger, VOCriteria buVO, DoneQueue.TReq reqVO)
        {
            List<amt_Document> docs = new List<amt_Document>();
            var docItems = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemByWorkQueueDisto(reqVO.queueID.Value, buVO);
            var stos = AWMSEngine.ADO.StorageObjectADO.GetInstant().ListPallet(reqVO.baseCode, buVO).ToList();
            var docsCode = docItems.Select(x => x.Document_ID).Distinct().ToList();
            var queue = AWMSEngine.ADO.WorkQueueADO.GetInstant().Get(reqVO.queueID.Value, buVO);

            docsCode.ForEach(x =>
            {
                var doc = AWMSEngine.ADO.DocumentADO.GetInstant().Get(x, buVO);
                docs.Add(doc);
            });

            if(docs.Count > 0)
            {
                docs.ForEach(x =>
                {
                    var distos = AWMSEngine.ADO.DocumentADO.GetInstant().ListDISTOByDoc(x.ID.Value, buVO);

                    if (queue.IOType == IOType.INPUT)
                    {
                        if (x.MovementType_ID == MovementType.FG_FAST_TRANSFER_WM)
                        {
                            var souAreaQueue = StaticValueManager.GetInstant().AreaMasters.FirstOrDefault(area => area.ID == queue.Sou_AreaMaster_ID);
                            var desAreaQueue = StaticValueManager.GetInstant().AreaMasters.FirstOrDefault(area => area.ID == queue.Des_AreaMaster_ID);
                            if (desAreaQueue.Code == "OF" && souAreaQueue.Code == "IP")
                            {
                                CreateGIDocument(docs, stos, logger, buVO);
                                AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(queue.StorageObject_ID.Value, null, null, StorageObjectEventStatus.PICKED, buVO);
                            }
                            else
                            {
                                AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(queue.StorageObject_ID.Value,
                                    StorageObjectEventStatus.RECEIVING, null, StorageObjectEventStatus.RECEIVED, buVO);
                            }
                        }
                        else
                        {
                            if (x.DocumentType_ID == DocumentTypeID.AUDIT)
                            {
                                var getDiSTO = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                                    {
                                new SQLConditionCriteria("WorkQueue_ID", queue.StorageObject_ID.Value, SQLOperatorType.EQUALS)
                                    }, buVO);

                                AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(queue.StorageObject_ID.Value,
                                        null, null, StorageObjectEventStatus.RECEIVED, buVO);

                                getDiSTO.ForEach(y => {
                                    AWMSEngine.ADO.DocumentADO.GetInstant().UpdateMappingSTO(y.ID.Value, EntityStatus.ACTIVE, buVO);
                                });
                            }
                            else
                            {
                                AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(queue.StorageObject_ID.Value,
                                    StorageObjectEventStatus.RECEIVING, null, StorageObjectEventStatus.RECEIVED, buVO);
                            }
                        }
                    }
                    else
                    {
                        //var packStos = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(queue.StorageObject_ID.Value, StorageObjectType.BASE, false, true, buVO)
                        //.ToTreeList().FindAll(y => y.type == StorageObjectType.PACK);
                        //packStos.ForEach(packSto =>
                        //{
                        //    AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(packSto.id.Value,
                        //        StorageObjectEventStatus.PICKING, null, StorageObjectEventStatus.PICKED, buVO);
                        //});

                        // add by ple

                        var getArea = new MoveStoInGateToNextArea();
                        var treq = new MoveStoInGateToNextArea.TReq()
                        {
                            stoID = queue.StorageObject_ID.Value
                        };
                        getArea.Execute(logger, buVO, treq);

                        if (x.DocumentType_ID == DocumentTypeID.AUDIT)
                        {
                            AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(queue.StorageObject_ID.Value,
                                StorageObjectEventStatus.AUDITING, null, StorageObjectEventStatus.AUDITING, buVO);
                        }
                        else
                        {
                            AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(queue.StorageObject_ID.Value,
                                StorageObjectEventStatus.PICKING, null, StorageObjectEventStatus.PICKED, buVO);
                        }
                    }

                    if (distos.TrueForAll(y => y.Status == EntityStatus.ACTIVE))
                    {
                        if (x.DocumentType_ID == DocumentTypeID.AUDIT && queue.IOType == IOType.INPUT)
                        {
                            AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(x.ID.Value, null, null, DocumentEventStatus.CLOSED, buVO);
                        }
                        else
                        {
                            AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(x.ID.Value, DocumentEventStatus.CLOSING, null, DocumentEventStatus.CLOSED, buVO);
                        }
                    }
                });
            }
            else
            {
                var stoBase = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode, null, null, false, true, buVO);
                var stoPack = stoBase.ToTreeList().FindAll(x => x.type == StorageObjectType.PACK).FirstOrDefault();
                var getDisto = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                    {
                            new SQLConditionCriteria("Sou_StorageObject_ID", stoPack.id, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("Status", EntityStatus.INACTIVE, SQLOperatorType.EQUALS),
                    }, buVO);

                getDisto.FindAll(x=> x.DocumentItem_ID != null).ForEach(x =>
                {
                    AWMSEngine.ADO.DocumentADO.GetInstant().UpdateMappingSTO(x.ID.Value, EntityStatus.ACTIVE, buVO);
                    x.Status = EntityStatus.ACTIVE;
                });

                var getDocItem = getDisto.FindAll(x => x.DocumentItem_ID != null && x.DocumentType_ID == DocumentTypeID.AUDIT);
                if(getDocItem.TrueForAll(x=> x.Status == EntityStatus.ACTIVE))
                {
                    var getDocID = AWMSEngine.ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem((getDocItem.First().DocumentItem_ID.Value), buVO);
                    AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(getDocID.Document_ID, null, null, DocumentEventStatus.CLOSED, buVO);
                }
            }

            return new WorkQueueCriteria();
        }

        private void CreateGIDocument(List<amt_Document> docs, List<amt_StorageObject> sto, AMWLogger logger, VOCriteria buVO)
        {
            var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();

            var mapsto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(sto[0].ID.Value, StorageObjectType.PACK, false, false, buVO);
            foreach (var document in docs)
            {
                var doc = new CreateGIDocument().Execute(logger, buVO,
                    new CreateGIDocument.TReq
                    {
                        parentDocumentID = document.ID,
                        refID = null,
                        ref1 = null,
                        ref2 = null,
                        souBranchID = document.Des_Branch_ID,
                        souWarehouseID = document.Des_Warehouse_ID,
                        souAreaMasterID = document.Des_AreaMaster_ID,
                        desBranchID = StaticValue.Warehouses.First(x => x.ID == mapsto.warehouseID).Branch_ID,
                        desWarehouseID = document.Des_Warehouse_ID,
                        desAreaMasterID = null,
                        movementTypeID = MovementType.FG_FAST_TRANSFER_WM,
                        lot = mapsto.lot,
                        batch = mapsto.batch,
                        documentDate = DateTime.Now,
                        actionTime = DateTime.Now,
                        eventStatus = DocumentEventStatus.CLOSED,
                        issueItems = new List<CreateGIDocument.TReq.IssueItem>() {
                            new CreateGIDocument.TReq.IssueItem
                            {
                                packCode = mapsto.code,
                                quantity = null,
                                unitType = mapsto.unitCode, //StaticValue.UnitTypes.First(x => x.ID == mapsto.UnitType_ID).Code,
                                batch = null,
                                lot = null,
                                orderNo = mapsto.orderNo,
                                ref2 = null,
                                options = mapsto.options,
                                eventStatus = DocumentEventStatus.CLOSED,
                                docItemStos = new List<amt_DocumentItemStorageObject>() { ConverterModel.ToDocumentItemStorageObject(mapsto) }

                            }}

                    });
                
                AWMSEngine.ADO.DocumentADO.GetInstant().UpdateMappingSTO(doc.DocumentItems.FirstOrDefault().DocItemStos.FirstOrDefault().ID.Value, EntityStatus.ACTIVE, buVO);

                //AWMSEngine.ADO.DataADO.GetInstant().UpdateBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]{
                //     new SQLConditionCriteria("DocumentItem_ID", null, SQLOperatorType.EQUALS)
                //    }, new KeyValuePair<string, object>[]{
                //        new KeyValuePair<string, object>("Status", EntityStatus.ACTIVE)
                //    }, buVO);
            }
        }
    }
}
