using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectMRK.Engine.Business.WorkQueue
{
    public class RegisterWorkQueue_GetDocumentItemAndDISTO : IProjectEngine<RegisterWorkQueue.TReqDocumentItemAndDISTO, List<amt_DocumentItem>>
    {
        public List<amt_DocumentItem> ExecuteEngine(AMWLogger logger, VOCriteria buVO, RegisterWorkQueue.TReqDocumentItemAndDISTO data)
        {
            var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
            var reqVO = data.reqVO;
            var sto = data.sto;

            var distos = new List<amt_DocumentItem>();
            var stoIDs = AWMSEngine.ADO.StorageObjectADO.GetInstant().ListPallet(reqVO.baseCode, buVO).Select(x => x.ID.Value).ToList();

            var docs = AWMSEngine.ADO.DocumentADO.GetInstant().ListBySTO(stoIDs, DocumentTypeID.GOODS_RECEIVED, buVO)
                .FindAll(x=>x.EventStatus == DocumentEventStatus.NEW || x.EventStatus == DocumentEventStatus.WORKING);

            var packs = sto.ToTreeList().FindAll(x => x.type == StorageObjectType.PACK);

            var souWarehouse = StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            if (souWarehouse == null)
            {
                throw new AMWException(logger, AMWExceptionCode.V2001, "Warehouse " + reqVO.warehouseCode + " NotFound");
            }

            if(docs.Count > 0)
            {
                docs.ForEach(x =>
                {
                    var docItems = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(x.ID.Value, buVO);
                    distos.AddRange(docItems);
                });
            }
            else
            {
                if (sto.eventStatus == StorageObjectEventStatus.NEW)
                {
                    var getDocItems = CreateDoc(sto, buVO);
                    distos.AddRange(getDocItems);
                }
                else if(sto.eventStatus == StorageObjectEventStatus.AUDITED || sto.eventStatus == StorageObjectEventStatus.AUDITING)
                {
                    packs.ForEach(pack =>
                    {
                        var disto = new amt_DocumentItemStorageObject
                        {
                            ID = null,
                            DocumentItem_ID = null,
                            Sou_StorageObject_ID = pack.id.Value,
                            Des_StorageObject_ID = pack.id.Value,
                            Quantity = 0,
                            BaseQuantity = 0,
                            UnitType_ID = pack.unitID,
                            BaseUnitType_ID = pack.baseUnitID,
                            Status = EntityStatus.ACTIVE
                        };

                        AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(disto, buVO);
                    });
                }
            }

            return distos;
        }

        private List<amt_DocumentItem> CreateDoc(StorageObjectCriteria stos, VOCriteria buVO)
        {
            var sto = stos.ToTreeList().Find(x => x.type == StorageObjectType.PACK);

            amt_Document doc = new amt_Document()
            {
                ID = null,
                Code = null,
                ParentDocument_ID = null,
                Lot = null,
                Batch = sto.batch,
                For_Customer_ID = null,
                Sou_Customer_ID = null,
                Sou_Supplier_ID = null,
                Sou_Branch_ID = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant().Branchs.FirstOrDefault().ID.Value,
                Sou_Warehouse_ID = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant().Warehouses.FirstOrDefault(x=>x.Code == "M501").ID.Value,
                Sou_AreaMaster_ID = null,

                Des_Customer_ID = null,
                Des_Supplier_ID = null,
                Des_Branch_ID = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant().Branchs.FirstOrDefault().ID.Value,
                Des_Warehouse_ID = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant().Warehouses.FirstOrDefault(x => x.Code == "M501").ID.Value,
                Des_AreaMaster_ID = null,
                DocumentDate = DateTime.Now,
                ActionTime = null,
                MovementType_ID = MovementType.FG_RETURN_WM,
                RefID = null,
                Ref1 = null,
                Ref2 = null,

                DocumentType_ID = DocumentTypeID.GOODS_RECEIVED,
                EventStatus = DocumentEventStatus.NEW,

                Remark = null,
                Options = "basecode=" + stos.code,
                Transport_ID = null,

                DocumentItems = new List<amt_DocumentItem>(),

            };
            doc.DocumentItems.Add(new amt_DocumentItem()
            {
                ID = null,
                Code = sto.code,
                SKUMaster_ID = sto.skuID,
                PackMaster_ID = sto.mstID,

                Quantity = Convert.ToDecimal(sto.qty),
                UnitType_ID = sto.unitID,
                BaseQuantity = Convert.ToDecimal(sto.baseQty),
                BaseUnitType_ID = sto.baseUnitID,

                OrderNo = null,
                Batch = sto.batch,
                Lot = null,

                Options = null,
                ExpireDate = null,
                ProductionDate = sto.productDate,
                Ref1 = null,
                Ref2 = null,
                RefID = "basecode=" + stos.code,

                EventStatus = DocumentEventStatus.NEW,

            });

            var docID = AWMSEngine.ADO.DocumentADO.GetInstant().Create(doc, buVO).ID;
            var docItems = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(docID.Value, buVO);

            var disto = new amt_DocumentItemStorageObject
            {
                ID = null,
                DocumentItem_ID = docItems.FirstOrDefault().ID.Value,
                Sou_StorageObject_ID = sto.id.Value,
                Des_StorageObject_ID = sto.id.Value,
                Quantity = sto.qty,
                BaseQuantity = sto.baseQty,
                UnitType_ID = sto.unitID,
                BaseUnitType_ID = sto.baseUnitID,
                Status = EntityStatus.INACTIVE
            };

            AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(disto, buVO);

            return docItems;
            
        }
    }
}
