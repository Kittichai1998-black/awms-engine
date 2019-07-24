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

namespace ProjectAAI.Engine.Business.WorkQueue
{
    public class RegisterWorkQueue_GetDocumentItemAndDISTO : IProjectEngine<RegisterWorkQueue.TReqDocumentItemAndDISTO, List<amt_DocumentItem>>
    {
        public List<amt_DocumentItem> ExecuteEngine(AMWLogger logger, VOCriteria buVO, RegisterWorkQueue.TReqDocumentItemAndDISTO data)
        {
            var reqVO = data.reqVO;
            var stoRoot = data.sto;
            var staticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();

            var warehouse = staticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            if(warehouse == null)
                throw new AMWException(logger, AMWExceptionCode.V2001, "Warehouse " + reqVO.warehouseCode + " Not Found");
            var branch = staticValue.Branchs.FirstOrDefault(x => x.ID == warehouse.Branch_ID);
            if (branch == null)
                throw new AMWException(logger, AMWExceptionCode.V2001, "Branch Not Found");
            var area = staticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode);
            if (area == null)
                throw new AMWException(logger, AMWExceptionCode.V2001, "Area " + reqVO.areaCode + " Not Found");

            var desWarehouse = staticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.desWarehouseCode);
            if (desWarehouse == null)
                throw new AMWException(logger, AMWExceptionCode.V2001, "Warehouse " + reqVO.desWarehouseCode + " Not Found");
            var desBranch = staticValue.Branchs.FirstOrDefault(x => x.ID == desWarehouse.Branch_ID);
            if (desBranch == null)
                throw new AMWException(logger, AMWExceptionCode.V2001, "Branch Not Found");
            var desArea = staticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.desAreaCode);
            if (desArea == null)
                throw new AMWException(logger, AMWExceptionCode.V2001, "Area " + reqVO.desAreaCode + " Not Found");

            var stoList = stoRoot.ToTreeList().Where(x=> x.type == StorageObjectType.PACK).ToList();

            amt_Document doc = new amt_Document()
            {
                ID = null,
                Code = null,
                ParentDocument_ID = null,
                Lot = null,
                Batch = null,
                For_Customer_ID = null,
                Sou_Customer_ID = null,
                Sou_Supplier_ID = null,
                Sou_Branch_ID = branch.ID.Value,
                Sou_Warehouse_ID = warehouse.ID.Value,
                Sou_AreaMaster_ID = area.ID.Value,

                Des_Customer_ID = null,
                Des_Supplier_ID = null,
                Des_Branch_ID = desBranch.ID.Value,
                Des_Warehouse_ID = desWarehouse.ID.Value,
                Des_AreaMaster_ID = desArea.ID.Value,
                DocumentDate = DateTime.Now,
                ActionTime = null,
                MovementType_ID = MovementType.FG_TRANSFER_WM,
                RefID = null,
                Ref1 = null,
                Ref2 = null,

                DocumentType_ID = reqVO.ioType == IOType.INPUT ? DocumentTypeID.GOODS_RECEIVED : DocumentTypeID.GOODS_ISSUED,
                EventStatus = DocumentEventStatus.NEW,

                Remark = null,
                Options = null,
                Transport_ID = null,

                DocumentItems = new List<amt_DocumentItem>(),

            };

            stoList.ForEach(sto =>
            {
                var pack = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_PackMaster>(sto.code, buVO);
                if (pack == null)
                    throw new AMWException(logger, AMWExceptionCode.V2001, "Pack " + sto.code + " Not Found");

                var PackMasterType = staticValue.PackMasterTypes.Find(x => x.ID == (long)pack.PackMasterType_ID);
                if (PackMasterType.Code != "EMPTYPALLET")
                {
                    doc.MovementType_ID = MovementType.EPL_TRANSFER_WM;
                }
                
                doc.DocumentItems.Add(new amt_DocumentItem()
                {
                    ID = null,
                    Code = sto.code,
                    SKUMaster_ID = sto.skuID.Value,
                    PackMaster_ID = pack.ID.Value,

                    Quantity = sto.qty,
                    UnitType_ID = sto.unitID,
                    BaseQuantity = sto.baseQty,
                    BaseUnitType_ID = sto.baseUnitID,

                    OrderNo = sto.orderNo,
                    Batch = sto.batch,
                    Lot = sto.lot,

                    Options = null,
                    ExpireDate = null,
                    ProductionDate = sto.productDate,
                    Ref1 = null,
                    Ref2 = null,
                    RefID = null,

                    EventStatus = DocumentEventStatus.NEW,

                });

            });

            var docID = AWMSEngine.ADO.DocumentADO.GetInstant().Create(doc, buVO).ID;
            var docItems = AWMSEngine.ADO.DocumentADO.GetInstant().ListItem(docID.Value, buVO);

            var docItemsAndSTO = new List<amt_DocumentItem>();

            docItems.ForEach(docItem =>
            {
                var sto = stoList.FirstOrDefault(x => x.skuID == docItem.SKUMaster_ID);
                var disto = new amt_DocumentItemStorageObject()
                {
                    ID = null,
                    DocumentItem_ID = docItem.ID.Value,
                    Sou_StorageObject_ID = sto.id.Value,
                    Des_StorageObject_ID = sto.id.Value,
                    Quantity = docItem.Quantity.Value,
                    BaseQuantity = docItem.Quantity.Value,
                    UnitType_ID = docItem.BaseUnitType_ID.Value,
                    BaseUnitType_ID = docItem.BaseUnitType_ID.Value,
                    Status = EntityStatus.INACTIVE
                };

                AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(disto, buVO);
                docItemsAndSTO.Add(AWMSEngine.ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem(docItem.ID.Value, buVO));
            });

            return docItemsAndSTO;
        }
    }
}
