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
            MovementType mvtDoc = mvt != null ? (MovementType)Enum.Parse(typeof(MovementType), mvt) : MovementType.FG_TRANSFER_WM;

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
                ActionTime = null,
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
                                //doc.MovementType_ID = MovementType.FG_PICK_RETURN_WM;

                                var resDocItems = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemBySTO(new List<long> { packH.id.Value }, DocumentTypeID.GOODS_RECEIVED, EntityStatus.INACTIVE, buVO);
                                if (resDocItems == null)
                                    throw new AMWException(logger, AMWExceptionCode.V1001, "GR Document Item of Pack Code '" + packH.code + "' Not Found");
                                return resDocItems;
                                /* var resDiSto = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                                          new SQLConditionCriteria[] {
                                                new SQLConditionCriteria("Sou_StorageObject_ID",packH.id, SQLOperatorType.EQUALS),
                                                new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS)
                                          }, buVO).FirstOrDefault();
                                 if (resDiSto == null)
                                     throw new AMWException(logger, AMWExceptionCode.V1001, "GR Document Item Storage Object of Pack Code '" + packH.code + "' Not Found");
                                 var resDocItem = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_DocumentItem>(resDiSto.DocumentItem_ID, buVO);
                                 if (resDocItem == null)
                                     throw new AMWException(logger, AMWExceptionCode.V1001, "GR Document Item of Pack Code '" + packH.code + "' Not Found");
                                 resDocItem.DocItemStos = new List<amt_DocumentItemStorageObject>() { resDiSto };

                                  */
                            }
                            //else if (mvtDoc == MovementType.FG_LOAD_RETURN_WM)
                           // {
                                //doc.MovementType_ID = MovementType.FG_LOAD_RETURN_WM;
                              //  doc.Sou_Warehouse_ID = warehouse.ID.Value;
                               // doc.Sou_Branch_ID = branch.ID.Value;
                                //หา docGI
                                /* var STOPicked = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(
                                          new SQLConditionCriteria[] {
                                                new SQLConditionCriteria("Code",packH.code, SQLOperatorType.EQUALS),
                                                new SQLConditionCriteria("OrderNo",packH.orderNo, SQLOperatorType.EQUALS),
                                                new SQLConditionCriteria("EventStatus",StorageObjectEventStatus.PICKED, SQLOperatorType.EQUALS)
                                               // new SQLConditionCriteria("Status", EntityStatus.DONE, SQLOperatorType.NOTEQUALS)
                                          }, buVO);

                               STOPicked.ForEach(stopick => {
                                    if(stopick.Options != null && stopick.Options.Length > 0)
                                    {
                                        var stopick_CARTON_NO = ObjectUtil.QryStrGetValue(stopick.Options, OptionVOConst.OPT_CARTON_NO);
                                        //1-100 --90-95
                                        //101-200 --105
                                        var packH_CARTON_NO = ObjectUtil.QryStrGetValue(packH.options, OptionVOConst.OPT_CARTON_NO);
                                        //90-95,105
                                        
                                        if (stopick_CARTON_NO == packH_CARTON_NO)
                                        {
                                            var resDocItems = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemBySTO(new List<long> { packH.id.Value }, DocumentTypeID.GOODS_ISSUED, EntityStatus.ACTIVE, buVO).FirstOrDefault();
                                            if (resDocItems == null)
                                                throw new AMWException(logger, AMWExceptionCode.V1001, "GR Document Item of Pack Code '" + packH.code + "' Not Found");

                                            var docpiked = AWMSEngine.ADO.DocumentADO.GetInstant().Get(resDocItems.Document_ID, buVO);
                                            doc.ParentDocument_ID = resDocItems.Document_ID;

                                            doc.Sou_Branch_ID = docpiked.Des_Branch_ID;
                                            doc.Sou_Warehouse_ID = docpiked.Des_Warehouse_ID;
                                            //doc.souAreaMasterID = document.Des_AreaMaster_ID,
                                            doc.Des_Branch_ID = docpiked.Sou_Branch_ID;
                                            doc.Des_Warehouse_ID = docpiked.Sou_Warehouse_ID;
                                            //desAreaMasterID = document.Sou_AreaMaster_ID,
                                        }
                                    }
                                });
                                */
                            //}
                            else
                            {   //FG_TRANSFER_WM รับเข้าเเบบปกติ
                                doc.Sou_Warehouse_ID = warehouse.ID.Value;
                                doc.Sou_Branch_ID = branch.ID.Value;
                            }
                        /*}
                        else
                        {   //FG_TRANSFER_WM รับเข้าเเบบปกติ
                            doc.Sou_Warehouse_ID = warehouse.ID.Value;
                            doc.Sou_Branch_ID = branch.ID.Value;
                        }*/
                        
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
                    UnitType_ID = baseUnitTypeConvt.unitType_ID,
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
