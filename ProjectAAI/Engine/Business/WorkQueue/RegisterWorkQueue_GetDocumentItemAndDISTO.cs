using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.Common;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
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

            var opt_LGNUM = ObjectUtil.QryStrGetValue(stoRoot.options, OptionVOConst.OPT_LGNUM);
            var sou_warehouse = staticValue.Warehouses.FirstOrDefault(x => x.Code == opt_LGNUM);
            if (sou_warehouse == null)
                throw new AMWException(logger, AMWExceptionCode.V2001, "Source Warehouse " + opt_LGNUM + " Not Found");
            var sou_branch = staticValue.Branchs.FirstOrDefault(x => x.ID == sou_warehouse.Branch_ID);
            if (sou_branch == null)
                throw new AMWException(logger, AMWExceptionCode.V2001, "Source Branch Not Found");

            var warehouse = staticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            if (warehouse == null)
                throw new AMWException(logger, AMWExceptionCode.V2001, "Warehouse " + reqVO.warehouseCode + " Not Found");
            var branch = staticValue.Branchs.FirstOrDefault(x => x.ID == warehouse.Branch_ID);
            if (branch == null)
                throw new AMWException(logger, AMWExceptionCode.V2001, "Branch Not Found");
            var area = staticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode);
            if (area == null)
                throw new AMWException(logger, AMWExceptionCode.V2001, "Area " + reqVO.areaCode + " Not Found");

            var desWarehouse = new ams_Warehouse();
            var desBranch = new ams_Branch();
            var desArea = new ams_AreaMaster();
            if (reqVO.ioType == IOType.OUTPUT)
            {
                desWarehouse = staticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.desWarehouseCode);
                if (desWarehouse == null)
                    throw new AMWException(logger, AMWExceptionCode.V2001, "Warehouse " + reqVO.desWarehouseCode + " Not Found");
                desBranch = staticValue.Branchs.FirstOrDefault(x => x.ID == desWarehouse.Branch_ID);
                if (desBranch == null)
                    throw new AMWException(logger, AMWExceptionCode.V2001, "Branch Not Found");
                desArea = staticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.desAreaCode);
                if (desArea == null)
                    throw new AMWException(logger, AMWExceptionCode.V2001, "Area " + reqVO.desAreaCode + " Not Found");
            }
            var stoList = stoRoot.ToTreeList().Where(x => x.type == StorageObjectType.PACK).ToList();

            amt_Document doc = new amt_Document()
            {
                ID = null,
                Code = null,
                ParentDocument_ID = null,
                Lot = null,
                Batch = null,
                For_Customer_ID = string.IsNullOrWhiteSpace(reqVO.forCustomerCode) ? null : staticValue.Customers.First(x => x.Code == reqVO.forCustomerCode).ID,
                Sou_Customer_ID = null,
                Sou_Supplier_ID = null,
                Sou_Branch_ID = reqVO.ioType == IOType.INPUT ? sou_branch.ID.Value : branch.ID,
                Sou_Warehouse_ID = reqVO.ioType == IOType.INPUT ? sou_warehouse.ID.Value : warehouse.ID,
                Sou_AreaMaster_ID = reqVO.ioType == IOType.INPUT ? null : area.ID,

                Des_Customer_ID = null,
                Des_Supplier_ID = null,
                Des_Branch_ID = reqVO.ioType == IOType.INPUT ? branch.ID : desBranch.ID,
                Des_Warehouse_ID = reqVO.ioType == IOType.INPUT ? warehouse.ID : desWarehouse.ID,
                Des_AreaMaster_ID = reqVO.ioType == IOType.INPUT ? null : desArea.ID,

                DocumentDate = DateTime.Now,
                ActionTime = DateTime.Now,
                MovementType_ID = MovementType.FG_TRANSFER,
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
                var skuMaster = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_SKUMaster>((long)sto.skuID, buVO);
                if (skuMaster == null)
                    throw new AMWException(logger, AMWExceptionCode.V2001, "SKU ID '" + (long)sto.skuID + "' Not Found");
                var SKUMasterType = staticValue.SKUMasterTypes.Find(x => x.ID == (long)skuMaster.SKUMasterType_ID);
                if (SKUMasterType.Code == "EMPTYPALLET")
                {
                    doc.MovementType_ID = MovementType.EPL_TRANSFER_WM;
                }
                        
                var baseUnitTypeConvt = staticValue.ConvertToBaseUnitByPack(pack.ID.Value, sto.qty, pack.UnitType_ID);
                decimal? baseQuantity = null;
                if (sto.qty >= 0)
                    baseQuantity = baseUnitTypeConvt.baseQty;

                doc.DocumentItems.Add(new amt_DocumentItem()
                {
                    ID = null,
                    Code = sto.code,
                    SKUMaster_ID = sto.skuID.Value,
                    PackMaster_ID = pack.ID.Value,

                    Quantity = sto.qty,
                    //UnitType_ID = sto.unitID,
                    //BaseQuantity = sto.baseQty,
                    //BaseUnitType_ID = sto.baseUnitID,
                    UnitType_ID = baseUnitTypeConvt.unitType_ID,
                    BaseQuantity = baseQuantity,
                    BaseUnitType_ID = baseUnitTypeConvt.baseUnitType_ID,

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
                    DocItemStos = new List<amt_DocumentItemStorageObject>() { ConverterModel.ToDocumentItemStorageObject(sto, null, null, null) }

                });

            });

            var docID = AWMSEngine.ADO.DocumentADO.GetInstant().Create(doc, buVO).ID;
            var docItems = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(docID.Value, buVO);

            /* var docItemsAndSTO = new List<amt_DocumentItem>();

           docItems.ForEach(docItem =>
           {
             var sto = stoList.FirstOrDefault(x => x.skuID == docItem.SKUMaster_ID && x.batch == docItem.Batch);
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
*/
            return docItems;
        }
    }
}