using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.Common;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business.Issued;
using AWMSEngine.Engine.V2.Business.Received;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectSTA.Engine.Business.WorkQueue
{
    public class RegisterWorkQueue_GetDocumentItemAndDISTO : IProjectEngine<
        RegisterWorkQueue.TReqDocumentItemAndDISTO,
        List<amt_DocumentItem>
        >
    {

        public List<amt_DocumentItem> ExecuteEngine(AMWLogger logger, VOCriteria buVO, RegisterWorkQueue.TReqDocumentItemAndDISTO data)
        {
            var reqVO = data.reqVO;
            var sto = data.sto;
            List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();
            //รับสินค้าใหม่เข้าคลัง, รับเข้าpallet เปล่า, สร้างเอกสารเบิกpallet เปล่า, 
            if (sto.eventStatus == StorageObjectEventStatus.NEW)
            {
                docItems = this.ProcessReceiving(sto, reqVO, logger, buVO);

                if (docItems.Count() == 0)
                    throw new AMWException(logger, AMWExceptionCode.V2001, "Good Received Document Not Found");
            }
            //return picking
            else if (sto.eventStatus == StorageObjectEventStatus.RECEIVED)
            {
                
                var stoEmp = sto.ToTreeList().Find(x => x.type == StorageObjectType.PACK);
                var skuMaster = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_SKUMaster>(stoEmp.skuID.Value, buVO);
                if (skuMaster == null)
                    throw new AMWException(logger, AMWExceptionCode.V2001, "SKU ID '" + (long)sto.skuID + "' Not Found");
                var SKUMasterType = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant().SKUMasterTypes.Find(x => x.ID == skuMaster.SKUMasterType_ID);
                if (SKUMasterType.Code == "EMPTYPALLET")
                {
                    docItems = this.ProcessReceiving(sto, reqVO, logger, buVO);

                    if (docItems.Count() == 0)
                        throw new AMWException(logger, AMWExceptionCode.V2001, "Good Received Document Not Found");

                }
            }
            else
            {
                throw new AMWException(logger, AMWExceptionCode.V2002, "Can't receive Base Code '" + reqVO.baseCode + "' into ASRS because it has Event Status '" + sto.eventStatus + "'");
            }

            return docItems;
        }

        //BEGIN*******************ProcessReceiving***********************

        private List<amt_DocumentItem> ProcessReceiving(StorageObjectCriteria mapsto, RegisterWorkQueue.TReq reqVO, AMWLogger logger, VOCriteria buVO)
        {
            var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();

            var warehouse = StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            if (warehouse == null)
                throw new AMWException(logger, AMWExceptionCode.V2001, "Warehouse " + reqVO.warehouseCode + " Not Found");
            var branch = StaticValue.Branchs.FirstOrDefault(x => x.ID == warehouse.Branch_ID);
            if (branch == null)
                throw new AMWException(logger, AMWExceptionCode.V2001, "Branch Not Found");
            var area = StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode);
            if (area == null)
                throw new AMWException(logger, AMWExceptionCode.V2001, "Area " + reqVO.areaCode + " Not Found");

            var desWarehouse = new ams_Warehouse();
            var desBranch = new ams_Branch();
            var desArea = new ams_AreaMaster();
            if (reqVO.ioType == IOType.OUTPUT)
            {
                desWarehouse = StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.desWarehouseCode);
                if (desWarehouse == null)
                    throw new AMWException(logger, AMWExceptionCode.V2001, "Warehouse " + reqVO.desWarehouseCode + " Not Found");
                desBranch = StaticValue.Branchs.FirstOrDefault(x => x.ID == desWarehouse.Branch_ID);
                if (desBranch == null)
                    throw new AMWException(logger, AMWExceptionCode.V2001, "Branch Not Found");
                desArea = StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.desAreaCode);
                if (desArea == null)
                    throw new AMWException(logger, AMWExceptionCode.V2001, "Area " + reqVO.desAreaCode + " Not Found");
            }

            var mvt = ObjectUtil.QryStrGetValue(mapsto.options, OptionVOConst.OPT_MVT);
            MovementType mvtDoc = mvt != null && mvt.Length > 0 ? (MovementType)Enum.Parse(typeof(MovementType), mvt) : MovementType.FG_TRANSFER_WM;

            var pstos = mapsto.ToTreeList().Where(x => x.type == StorageObjectType.PACK).ToList();
            if (pstos == null || pstos.Count() == 0)
                throw new AMWException(logger, AMWExceptionCode.V2001, "Data of Packs Not Found");

            amt_Document doc = new amt_Document()
            {
                ID = null,
                Code = null,
                ParentDocument_ID = null,
                Lot = null,
                Batch = null,
                For_Customer_ID = string.IsNullOrWhiteSpace(reqVO.forCustomerCode) ? null : StaticValue.Customers.First(x => x.Code == reqVO.forCustomerCode).ID,
                Sou_Customer_ID = null,
                Sou_Supplier_ID = null,
                Sou_Branch_ID = reqVO.ioType == IOType.INPUT ? null : branch.ID,
                Sou_Warehouse_ID = reqVO.ioType == IOType.INPUT ? null : warehouse.ID,
                Sou_AreaMaster_ID = reqVO.ioType == IOType.INPUT ? null : area.ID,

                Des_Customer_ID = null,
                Des_Supplier_ID = null,
                Des_Branch_ID = reqVO.ioType == IOType.INPUT ? branch.ID : desBranch.ID,
                Des_Warehouse_ID = reqVO.ioType == IOType.INPUT ? warehouse.ID : desWarehouse.ID,
                Des_AreaMaster_ID = reqVO.ioType == IOType.INPUT ? null : desArea.ID,

                DocumentDate = DateTime.Now,
                ActionTime = DateTime.Now,
                MovementType_ID = mvtDoc,
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

            foreach (var packH in pstos)
            {
                
                ams_SKUMaster skuMaster = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_SKUMaster>((long)packH.skuID, buVO);
                if (skuMaster == null)
                    throw new AMWException(logger, AMWExceptionCode.V2001, "SKU ID '" + (long)packH.skuID + "' Not Found");
                ams_PackMaster packMaster = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_PackMaster>((long)packH.mstID, buVO);
                if (packMaster == null)
                    throw new AMWException(logger, AMWExceptionCode.V2001, "PackMaster ID '" + (long)packH.mstID + "' Not Found");

                
                var empPallet = StaticValue.SKUMasterTypes.Find(x => x.ID == (long)skuMaster.SKUMasterType_ID);
                if (empPallet.Code != "EMPTYPALLET")
                {
                    //ไม่ใช่พาเลทเปล่า
                    if (packH.options != null && packH.options.Length > 0)
                    {
                        //เช็คค่า Sou_Warehouse_ID จาก options
                        var Sou_Warehouse_ID = ObjectUtil.QryStrGetValue(packH.options, OptionVOConst.OPT_SOU_WAREHOUSE_ID);
                        if (Sou_Warehouse_ID != null && Sou_Warehouse_ID.Length > 0)
                        { 
                            var checkWhID = StaticValue.Warehouses.First(x => x.ID == Convert.ToInt32(Sou_Warehouse_ID));
                            if (checkWhID == null)
                                throw new AMWException(logger, AMWExceptionCode.V2001, "Warehouse ID '" + Sou_Warehouse_ID + "' Not Found");
                            doc.Sou_Warehouse_ID = checkWhID.ID.Value;

                            doc.Sou_Branch_ID = StaticValue.Branchs.First(x => x.ID == checkWhID.Branch_ID).ID;
                            
                        }
                        //var mvt = ObjectUtil.QryStrGetValue(packH.options, OptionVOConst.OPT_MVT);

                        //if (mvtDoc != null)
                        //{
                            if (mvtDoc == MovementType.FG_TRANSFER_CUS)
                            {   //customer return
                                //doc.MovementType_ID = MovementType.FG_TRANSFER_CUS;
                                //เช็ค่า Sou_Customer_ID จาก options
                                var Sou_Customer_ID = ObjectUtil.QryStrGetValue(packH.options, OptionVOConst.OPT_SOU_CUSTOMER_ID);
                                if (Sou_Customer_ID != null && Sou_Customer_ID.Length > 0)
                                {
                                    var checkCusID = StaticValue.Customers.First(x => x.ID == Convert.ToInt32(Sou_Customer_ID));
                                    if (checkCusID == null)
                                        throw new AMWException(logger, AMWExceptionCode.V2001, "Customer ID '" + Sou_Customer_ID + "' Not Found");
                                    doc.Sou_Customer_ID = checkCusID.ID.Value;
                                }
                            }
                            else if (mvtDoc == MovementType.WIP_TRANSFER_WM)
                            {
                                //doc.MovementType_ID = MovementType.WIP_TRANSFER_WM;
                            }
                            else if (mvtDoc == MovementType.FG_PICK_RETURN_WM)
                            {   //picking return
                                List<amt_DocumentItem> tempDocItems = new List<amt_DocumentItem>();

                                var resDocItems = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemBySTO(new List<long> { packH.id.Value }, DocumentTypeID.GOODS_RECEIVED, EntityStatus.INACTIVE, buVO);
                                    if (resDocItems == null)
                                        throw new AMWException(logger, AMWExceptionCode.V1001, "GR Document Item of Pack Code '" + packH.code + "' Not Found");

                                resDocItems.ForEach(dit => {
                                    tempDocItems.Add(AWMSEngine.ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem(dit.ID.Value, buVO));
                                });

                                return tempDocItems;
                            }
                            else
                            {   //FG_TRANSFER_WM , MovementType.FG_LOAD_RETURN_WMรับเข้าเเบบปกติ
                                doc.Sou_Warehouse_ID = warehouse.ID.Value;
                                doc.Sou_Branch_ID = branch.ID.Value;
                            } 
                    }

                }
                else
                {
                    doc.MovementType_ID = MovementType.EPL_TRANSFER_WM;
                    doc.Sou_Warehouse_ID = warehouse.ID.Value;
                    doc.Sou_Branch_ID = branch.ID.Value;

                }

               
                var baseUnitTypeConvt = StaticValue.ConvertToBaseUnitByPack(packMaster.ID.Value, packH.qty, packMaster.UnitType_ID);
                decimal? baseQuantity = null;
                if (packH.qty >= 0)
                    baseQuantity = baseUnitTypeConvt.baseQty;

                doc.DocumentItems.Add(new amt_DocumentItem()
                {
                    ID = null,
                    Code = packH.code,
                    SKUMaster_ID = packH.skuID.Value,
                    PackMaster_ID = packMaster.ID.Value,

                    Quantity = packH.qty, 
                    UnitType_ID = baseUnitTypeConvt.newUnitType_ID,
                    BaseQuantity = baseQuantity,
                    BaseUnitType_ID = baseUnitTypeConvt.baseUnitType_ID,

                    OrderNo = packH.orderNo,
                    Batch = packH.batch,
                    Lot = packH.lot,

                    Options = null,
                    ExpireDate = null,
                    ProductionDate = packH.productDate,
                    Ref1 = null,
                    Ref2 = null,
                    RefID = null,

                    EventStatus = DocumentEventStatus.NEW,
                    DocItemStos = new List<amt_DocumentItemStorageObject>() { ConverterModel.ToDocumentItemStorageObject(packH, null, null, null) }

                });

                
            }

            var docID = AWMSEngine.ADO.DocumentADO.GetInstant().Create(doc, buVO).ID;
            var docItems = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(docID.Value, buVO);
            return docItems;

        }
         
    }
}
