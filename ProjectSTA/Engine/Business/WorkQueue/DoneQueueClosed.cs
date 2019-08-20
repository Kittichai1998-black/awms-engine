using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AMWUtil.Logger;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Common;
using AWMSEngine.Engine;
using AWMSEngine.Engine.Business.Received;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;

namespace ProjectSTA.Engine.Business.WorkQueue
{
    public class DoneQueueClosed : IProjectEngine<DoneQueue.TReq, Boolean?>
    {
        public Boolean? ExecuteEngine(AMWLogger logger, VOCriteria buVO, DoneQueue.TReq reqVO)
        {
            var docItems = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemByWorkQueue(reqVO.queueID.Value, buVO);
            var docs = AWMSEngine.ADO.DocumentADO.GetInstant().ListAndItem(docItems.Select(x => x.Document_ID).ToList(), buVO);

            var stos = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode, null, null, false, true, buVO);
            var stosTree = stos.ToTreeList().Find(x => x.type == StorageObjectType.PACK);

            docItems.ForEach(docItem =>
            {
                if (docItem.BaseQuantity < stos.baseQty)
                {
                    CreateGRDocument(docs, stosTree, logger, buVO);
                }
            });

            return null;
        }

        private void CreateGRDocument(List<amt_Document> docs, StorageObjectCriteria sto, AMWLogger logger, VOCriteria buVO)
        {
            var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();

            //var mapsto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(sto[0].ID.Value, StorageObjectType.PACK, false, false, buVO);
            foreach (var document in docs)
            {
                var docItems = new List<CreateGRDocument.TReq.ReceiveItem>();

                document.DocumentItems.ForEach(docItem =>
                {
                    if(sto.skuID == docItem.SKUMaster_ID && sto.baseQty > docItem.BaseQuantity )
                    {
                        docItems.Add(new CreateGRDocument.TReq.ReceiveItem
                        {
                            packCode = sto.code,
                            quantity = sto.baseQty - docItem.BaseQuantity,
                            unitType = sto.unitCode, //StaticValue.UnitTypes.First(x => x.ID == mapsto.UnitType_ID).Code,
                            batch = docItem.Batch,
                            lot = docItem.Lot,
                            orderNo = docItem.OrderNo,
                            ref2 = docItem.Ref2,
                            expireDate = docItem.ExpireDate,
                            productionDate = docItem.ExpireDate,
                            ref1 = docItem.Ref1,
                            refID = docItem.RefID,
                            options = sto.options,
                            eventStatus = DocumentEventStatus.NEW,
                            docItemStos = new List<amt_DocumentItemStorageObject>() { ConverterModel.ToDocumentItemStorageObject(sto) }
                        });
                    }
                    
                });

                var doc = new CreateGRDocument().Execute(logger, buVO,
                    new CreateGRDocument.TReq
                    {
                        parentDocumentID = document.ID,
                        refID = null,
                        ref1 = null,
                        ref2 = null,
                        souBranchID = document.Des_Branch_ID,
                        souWarehouseID = document.Des_Warehouse_ID,
                        souAreaMasterID = document.Des_AreaMaster_ID,
                        desBranchID = document.Sou_Branch_ID,
                        desWarehouseID = document.Sou_Warehouse_ID,
                        desAreaMasterID = document.Sou_AreaMaster_ID,
                        movementTypeID = MovementType.FG_PICK_RETURN_WM,
                        lot = sto.lot,
                        batch = sto.batch,
                        documentDate = DateTime.Now,
                        actionTime = DateTime.Now,
                        eventStatus = DocumentEventStatus.NEW,
                        receiveItems = docItems

                    });
            }
        }
    }
}
