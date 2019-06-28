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

            var docs = AWMSEngine.ADO.DocumentADO.GetInstant().ListBySTO(stoIDs, DocumentTypeID.GOODS_RECEIVED, buVO);

            if (docs == null)
            {
                var pack = sto.ToTreeList().FindAll(x => x.type == StorageObjectType.PACK).FirstOrDefault();

                var souWarehouse = StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
                if (souWarehouse == null)
                {
                    throw new AMWException(logger, AMWExceptionCode.V2001, "Warehouse " + reqVO.warehouseCode + " NotFound");
                }
                var desWarehouse = StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.desWarehouseCode);
                if (desWarehouse == null)
                {
                    throw new AMWException(logger, AMWExceptionCode.V2001, "Warehouse " + reqVO.desWarehouseCode + " NotFound");
                }

                amt_Document doc = new amt_Document()
                {
                    ID = null,
                    Code = null,
                    ParentDocument_ID = null,
                    Lot = null,
                    Batch = pack.batch,
                    Sou_Branch_ID = souWarehouse.ID.Value,
                    Sou_Warehouse_ID = souWarehouse.ID.Value,
                    Sou_AreaMaster_ID = reqVO.areaCode == "" ? StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode).ID : null,

                    Des_Branch_ID = desWarehouse.ID.Value,
                    Des_Warehouse_ID = desWarehouse.ID.Value,
                    Des_AreaMaster_ID = reqVO.desAreaCode == "" ? StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.desAreaCode).ID : null,
                    DocumentDate = DateTime.Now,
                    MovementType_ID = MovementType.FG_TRANSFER_WM,

                    DocumentType_ID = DocumentTypeID.GOODS_RECEIVED,
                    EventStatus = DocumentEventStatus.NEW,

                    Remark = null,
                    Options = "palletCode=" + reqVO.baseCode,
                    Transport_ID = null,

                    DocumentItems = new List<amt_DocumentItem>(),

                };

                doc.DocumentItems.Add(new amt_DocumentItem()
                {
                    ID = null,
                    Code = pack.code,
                    SKUMaster_ID = pack.skuID.Value,
                    PackMaster_ID = pack.mstID,

                    Quantity = pack.qty,
                    UnitType_ID = pack.unitID,
                    BaseQuantity = pack.baseQty,
                    BaseUnitType_ID = pack.baseUnitID,

                    OrderNo = null,
                    Batch = pack.batch,
                    Lot = null,

                    Options = null,
                    ExpireDate = null,
                    ProductionDate = pack.productDate,
                    Ref1 = null,
                    Ref2 = null,
                    RefID = "palletCode=" + reqVO.baseCode,

                    EventStatus = DocumentEventStatus.NEW,

                });

                var docID = AWMSEngine.ADO.DocumentADO.GetInstant().Create(doc, buVO).ID;

                var docItems = AWMSEngine.ADO.DocumentADO.GetInstant().ListItem(docID.Value, buVO);

                amt_DocumentItemStorageObject disto = new amt_DocumentItemStorageObject();
                docItems.ForEach(docItem =>
                {
                    disto = new amt_DocumentItemStorageObject()
                    {
                        ID = null,
                        DocumentItem_ID = docItem.ID.Value,
                        Sou_StorageObject_ID = pack.id.Value,
                        Des_StorageObject_ID = pack.id.Value,
                        Quantity = docItem.Quantity.Value,
                        BaseQuantity = docItem.Quantity.Value,
                        UnitType_ID = docItem.BaseUnitType_ID.Value,
                        BaseUnitType_ID = docItem.BaseUnitType_ID.Value,
                        Status = EntityStatus.INACTIVE
                    };
                });

                AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(disto, buVO);

                distos.AddRange(AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(docID.Value, buVO));
            }
            else
            {
                docs.ForEach(x =>
                {
                    distos.AddRange(AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(x.ID.Value, buVO));
                });
            }

            if(distos == null)
            {
                throw new AMWException(logger, AMWExceptionCode.V1001, "Document of Base Code '" + reqVO.baseCode + "' Not Found");
            }

            return distos;
        }
    }
}
