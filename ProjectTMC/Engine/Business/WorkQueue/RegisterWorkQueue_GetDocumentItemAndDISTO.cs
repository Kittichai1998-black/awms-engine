using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Common;
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

namespace ProjectTMC.Engine.Business.WorkQueue
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

            if (sto.eventStatus == StorageObjectEventStatus.NEW || sto.eventStatus == StorageObjectEventStatus.AUDITED || sto.eventStatus == StorageObjectEventStatus.AUDITING)
            {
                //เช็ค sku type
                //var skuMasterData = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_SKUMaster>(
                //new KeyValuePair<string, object>[] {
                //    new KeyValuePair<string,object>("Code",reqVO.mappingPallets[0].code),
                //    new KeyValuePair<string,object>("Status",1),
                //}, buVO).FirstOrDefault();
                
                //if(skuMasterData.SKUMasterType_ID == 58)
                //{
                    docItems = this.GetDocumentProcessReceiving(sto, reqVO, logger, buVO);
                   
                //}
                //else
                //{
                //    docItems = this.ProcessReceiving(sto, reqVO, logger, buVO);
                //}

                //if (sto.eventStatus != StorageObjectEventStatus.AUDITED && sto.eventStatus != StorageObjectEventStatus.AUDITING)
                //{
                //    if (docItems.Count() == 0)
                //        throw new AMWException(logger, AMWExceptionCode.V2001, "Good Received Document Not Found");
                //}
            }
            else
            {
                throw new AMWException(logger, AMWExceptionCode.V2002, "Can't receive Base Code '" + reqVO.baseCode + "' into ASRS because it has Event Status '" + sto.eventStatus + "'");
            }

            return docItems;
        }
        //==========================================================================================================
        private List<amt_DocumentItem> GetDocumentProcessReceiving(StorageObjectCriteria mapsto, RegisterWorkQueue.TReq reqVO, AMWLogger logger, VOCriteria buVO)
        {
            List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();
            
            var DocItemsMap = new List<amt_DocumentItemStorageObject>();

            var docGR = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
            new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.mappingPallets[0].code)
            }, buVO).FirstOrDefault();
            var qtyPack = System.Convert.ToDecimal(reqVO.mappingPallets[0].qty);

            
            if (docGR == null)
            {
                throw new AMWException(logger, AMWExceptionCode.V1001, "Good Received Document Not Found");
            }
            if (docGR.Quantity < qtyPack)
            {
                throw new AMWException(logger, AMWExceptionCode.V1001, "Qty more then Good Received Document");
            }

            var distoRes = AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(new amt_DocumentItemStorageObject()
                {
                    DocumentItem_ID = docGR.ID,
                    DocumentType_ID = DocumentTypeID.GOODS_RECEIVED,
                    WorkQueue_ID = null,
                    Sou_StorageObject_ID = mapsto.mapstos[0].id.Value,
                    Des_StorageObject_ID = mapsto.mapstos[0].id.Value,
                    Quantity = qtyPack,
                    BaseQuantity = qtyPack,
                    UnitType_ID = docGR.UnitType_ID.Value,
                    BaseUnitType_ID = docGR.BaseUnitType_ID.Value,
                    Status = EntityStatus.INACTIVE

                }, buVO);
            docGR.DocItemStos = new List<amt_DocumentItemStorageObject> { distoRes };
            
            
            return new List<amt_DocumentItem> { docGR };
        }
        //==========================================================================================================
        private List<amt_DocumentItem> ProcessReceiving(StorageObjectCriteria mapsto, RegisterWorkQueue.TReq reqVO, AMWLogger logger, VOCriteria buVO)
        {
            List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();


            foreach (var mappingPallet in reqVO.mappingPallets)
            {
                var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
                var mapstoTree = mapsto.ToTreeList();
                var packs = mapstoTree.Where(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.NEW).ToList();

                if (mapsto.eventStatus == StorageObjectEventStatus.AUDITED || mapsto.eventStatus == StorageObjectEventStatus.AUDITING)
                {
                    var listDoc = AWMSEngine.ADO.DocumentADO.GetInstant()
                        .ListBySTO(mapstoTree.FindAll(x => x.type == StorageObjectType.PACK)
                        .Select(x => x.id.Value).ToList(), DocumentTypeID.AUDIT, buVO);

                    var listDocItem = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(listDoc.FirstOrDefault().ID.Value, buVO);

                    var mapstoPack = mapstoTree.FindAll(x => x.type == StorageObjectType.PACK).FirstOrDefault();

                    listDocItem.ForEach(docItem =>
                    {
                        docItem.DocItemStos.ForEach(disto =>
                        {
                            AWMSEngine.ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value,
                                disto.Sou_StorageObject_ID,
                                Convert.ToDecimal(mappingPallet.qty) - mapstoPack.qty,
                                Convert.ToDecimal(mappingPallet.qty) - mapstoPack.qty,
                                EntityStatus.ACTIVE, buVO);
                        });
                    });

                    var pack = reqVO.mappingPallets.FirstOrDefault(y => mapstoPack.code == y.code);
                    mapstoPack.qty = Convert.ToDecimal(pack.qty);
                    mapstoPack.baseQty = Convert.ToDecimal(pack.qty);

                    AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(mapstoPack, buVO);

                    return listDocItem;

                }
                else
                {
                    foreach (var packH in packs)
                    {

                        amt_Document doc = new amt_Document();

                        doc = new CreateGRDocument().Execute(logger, buVO,
                                       new CreateGRDocument.TReq()
                                       {
                                           refID = null,
                                           ref1 = null,
                                           ref2 = null,
                                           souBranchID = null,
                                           souWarehouseID = StaticValue.Warehouses.First(x => x.Code == reqVO.warehouseCode).ID,
                                           souAreaMasterID = StaticValue.AreaMasters.First(x => x.Code == reqVO.areaCode).ID,
                                           desBranchID = StaticValue.Warehouses.First(x => x.ID == mapsto.warehouseID).Branch_ID,
                                           desWarehouseID = mapsto.warehouseID,
                                           desAreaMasterID = StaticValue.AreaMasters.First(x => x.Code == reqVO.areaCode).ID,
                                           movementTypeID = MovementType.WIP_TRANSFER_WM,
                                           lot = null,
                                           batch = null,
                                           forCustomerID = null,
                                           documentDate = DateTime.Now,
                                           actionTime = DateTime.Now,
                                           eventStatus = DocumentEventStatus.NEW,
                                           receiveItems = new List<CreateGRDocument.TReq.ReceiveItem>() {
                                                                new CreateGRDocument.TReq.ReceiveItem
                                                                {
                                                                    packCode = packH.code,
                                                                    quantity = null,
                                                                    unitType = packH.unitCode,
                                                                    batch = null,
                                                                    lot = packH.lot,
                                                                    orderNo = packH.orderNo,
                                                                    ref2 = null,
                                                                    productionDate = packH.productDate,
                                                                    eventStatus = DocumentEventStatus.NEW,
                                                                    docItemStos = new List<amt_DocumentItemStorageObject>() { ConverterModel.ToDocumentItemStorageObject(packH, null, null, null)}

                                                                }}
                                       });

                        docItems.AddRange(doc.DocumentItems);

                    }
                }
            }
            return docItems;
        }

    }
}

