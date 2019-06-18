using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Engine;
using AWMSEngine.Engine.Business.Received;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectTAP.Engine.Business.WorkQueue
{
    public class RegisterWorkQueue_GetDocumentItemAndDISTO : IProjectEngine<
        RegisterWorkQueue.TReqDocumentItemAndDISTO,
        List<amt_DocumentItem>
        >
    {
        public List<amt_DocumentItem> ExecuteEngine(AMWLogger logger, VOCriteria buVO, RegisterWorkQueue.TReqDocumentItemAndDISTO data)
        {
            //var mapsto = data.sto;
            //var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
            //MovementType FG_Movement = MovementType.FG_TRANSFER_WM;
            //amt_Document doc = AWMSEngine.ADO.DocumentADO.GetInstant().ListDocs(DocumentTypeID.GOODS_RECEIVED, null, null, null, FG_Movement, buVO)
            //                       //var doc = AWMSEngine.ADO.DocumentADO.GetInstant().ListDocs(DocumentTypeID.GOODS_RECEIVED, souBranchID, _warehouseASRS.ID, null, FG_Movement, this.BuVO)
            //                       .FirstOrDefault(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.NEW); //_areaASRS.ID
            //                                                                                                                                       //Pack Info ไม่พบ Document Item ใดๆที่ตรงกับในระบบ
            //if (doc == null)
            //{
            //    //สร้างเอกสารรับเข้า ปกติ FG_Transfer, FG_RETURNCUSTOMER
            //    doc = new CreateGRDocument().Execute(logger, buVO,
            //               new CreateGRDocument.TReq()
            //               {
            //                   refID = null,
            //                   ref1 = null,
            //                   ref2 = null,
            //                   souBranchID = null,
            //                   souWarehouseID = null,
            //                   souAreaMasterID = null,
            //                   desBranchID = StaticValue.Warehouses.First(x => x.ID == mapsto.warehouseID).Branch_ID,
            //                   desWarehouseID = mapsto.warehouseID,
            //                   desAreaMasterID = null,
            //                   movementTypeID = FG_Movement,
            //                   lot = null,
            //                   batch = null,
            //                   documentDate = DateTime.Now,
            //                   actionTime = DateTime.Now,
            //                   eventStatus = DocumentEventStatus.NEW,
            //                   receiveItems = new List<CreateGRDocument.TReq.ReceiveItem>() {
            //                                            new CreateGRDocument.TReq.ReceiveItem
            //                                            {
            //                                                packCode = packH.code,
            //                                                quantity = null,
            //                                                unitType = packH.unitCode,
            //                                                batch = null,
            //                                                lot = null,
            //                                                orderNo = FG_Movement == MovementType.EPL_TRANSFER_WM ? null : packH.orderNo,
            //                                                ref2 = null,
            //                                                eventStatus = DocumentEventStatus.NEW,
            //                                                docItemStos = new List<amt_DocumentItemStorageObject>() { ConverterModel.ToDocumentItemStorageObject(packH, null, null, null)}

            //                                            }}
            //               });

            //    docItems.AddRange(doc.DocumentItems);
            //}

























            var reqVO = data.reqVO;
            var sto = data.sto;
            List<amt_DocumentItem> docItem = new List<amt_DocumentItem>();
            var date = Convert.ToDateTime(reqVO.mappingPallets[0].prodDate);
            var diList = ADO.DocumentADO.GetInstant().ListDocsItemCheckRegister(reqVO.mappingPallets[0].code, date, int.Parse(reqVO.mappingPallets[0].qty), reqVO.mappingPallets[0].itemNo, buVO);


            List<amt_DocumentItemStorageObject> diSto = new List<amt_DocumentItemStorageObject>();

            foreach (var diListData in diList)
            {
                diSto = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                   new SQLConditionCriteria[] {
                        new SQLConditionCriteria("DocumentItem_ID", diListData.ID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status", 1, SQLOperatorType.EQUALS, SQLConditionType.AND)
                }, new SQLOrderByCriteria[] { }, null, null, buVO);
                diListData.DocItemStos = diSto;
            }

            if (diSto.Count > 0)
            {
                //มีใน disto
                foreach (var diListData in diList)
                {

                    var sumQtyInDocItem = diSto.Where(x => x.Status == EntityStatus.ACTIVE).Sum(x => x.Quantity).Value;
                    var sumQtyCheck = diListData.Quantity - sumQtyInDocItem;

                    if (Int32.Parse(reqVO.mappingPallets[0].qty) <= sumQtyCheck)
                    {
                        //map
                        var UnitType = StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(x => x.Code == reqVO.mappingPallets[0].unit);
                        amt_DocumentItemStorageObject dataMapDisto = new amt_DocumentItemStorageObject()
                        {
                            DocumentItem_ID = diListData.ID.Value,
                            Sou_StorageObject_ID = sto.id.Value,
                            Des_StorageObject_ID = null,
                            Quantity = System.Convert.ToDecimal(reqVO.mappingPallets[0].qty),
                            BaseQuantity = System.Convert.ToDecimal(reqVO.mappingPallets[0].qty),
                            UnitType_ID = UnitType.ID.Value,
                            BaseUnitType_ID = UnitType.ID.Value,

                        };

                        var mapDiSto = AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(dataMapDisto, buVO);
                        diListData.DocItemStos.Add(mapDiSto);
                    }
                    else
                    {
                        //error สินค้าไม่พอ
                        throw new AMWException(logger, AMWExceptionCode.V1001, "Qty is not receive");

                    }
                }
            }
            else
            {   //ไม่มีใน disto map ได้เลย
                foreach (var diListData in diList)
                {
                    var UnitType = StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(x => x.Code == reqVO.mappingPallets[0].unit);
                    amt_DocumentItemStorageObject dataMapDisto = new amt_DocumentItemStorageObject()
                    {
                        DocumentItem_ID = diListData.ID.Value,
                        Sou_StorageObject_ID = sto.id.Value,
                        Des_StorageObject_ID = sto.id.Value,
                        Quantity = System.Convert.ToDecimal(reqVO.mappingPallets[0].qty),
                        BaseQuantity = System.Convert.ToDecimal(reqVO.mappingPallets[0].qty),
                        UnitType_ID = UnitType.ID.Value,
                        BaseUnitType_ID = UnitType.ID.Value,
                        Status = EntityStatus.ACTIVE
                    };

                    var mapDiSto = AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(dataMapDisto, buVO);
                    diListData.DocItemStos.Add(mapDiSto);

                }
            }
            return diList;


        }
    }
}
