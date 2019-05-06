using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Common;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.V2.Business.Received;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectSTA.Engine.Business.WorkQueue
{
    public class RegisterQueueReceiving : AWMSEngine.Engine.V2.Business.WorkQueue.BaseRegisterWorkQueue
    {
        private ams_AreaLocationMaster _locationASRS;
        private ams_Warehouse _warehouseASRS;
        private ams_AreaMaster _areaASRS;

        protected override StorageObjectCriteria GetSto(TReq reqVO)
        {

            //Init Data from ASRS
            this.InitDataASRS(reqVO);
            var sto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode,
                _warehouseASRS.ID, _areaASRS.ID, false, true, this.BuVO);
            if (sto == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Storage Object of Base Code: '" + reqVO.baseCode + "' Not Found");
            if (sto.code != reqVO.baseCode)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Base Code: '" + reqVO.baseCode + "' INCORRECT");

            return sto;
        }

        protected override List<amt_DocumentItem> GetDocumentItemAndDISTO(StorageObjectCriteria sto, TReq reqVO)
        {
            List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();
            List<amt_Document> documents = new List<amt_Document>();

            if (sto.eventStatus == StorageObjectEventStatus.NEW)
            {
                docItems = this.ProcessReceiving(sto, reqVO);

                if (docItems.Count() == 0)
                    throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ไม่พบเอกสาร Receive");
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ไม่สามารถรับ Base Code '" + reqVO.baseCode + "' เข้าคลังได้ เนื่องจากมีสถานะ '" + sto.eventStatus + "'");
            }

            return docItems;
        }
 
        private void InitDataASRS(TReq reqVO)
         {
            this._warehouseASRS = StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            if (_warehouseASRS == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Warehouse Code '" + reqVO.warehouseCode + "' Not Found");
            this._areaASRS = StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode && x.Warehouse_ID == _warehouseASRS.ID);
            if (_areaASRS == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Area Code '" + reqVO.areaCode + "' Not Found");
            this._locationASRS = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.locationCode),
                    new KeyValuePair<string,object>("AreaMaster_ID",_areaASRS.ID.Value),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO).FirstOrDefault();
            if (_locationASRS == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Location Code '" + reqVO.locationCode + "' Not Found");
         }
         
         //BEGIN*******************ProcessReceiving***********************

         private List<amt_DocumentItem> ProcessReceiving(StorageObjectCriteria mapsto, TReq reqVO)
         {
             List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();
             var mapstoTree = mapsto.ToTreeList();
             var packs = mapstoTree.Where(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.NEW).ToList();
            foreach (var packH in packs)
            {
                long souBranchID = StaticValue.Warehouses.First(x => x.ID == _warehouseASRS.ID).Branch_ID.Value;
                //var docItem = AWMSEngine.ADO.DocumentADO.GetInstant().ListDocs(DocumentTypeID.GOODS_RECEIVED, souBranchID, _warehouseASRS.ID.Value, _areaASRS.ID.Value, MovementType.NORMAL, this.BuVO);
                var docItem = AWMSEngine.ADO.DocumentADO.GetInstant()
                   .ListItemCanMapV2(DocumentTypeID.GOODS_RECEIVED, packH.mstID, packH.baseQty, souBranchID, _warehouseASRS.ID, null, null, packH.unitID, packH.baseUnitID, packH.orderNo, null, null, this.BuVO)
                   .FirstOrDefault(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.NEW);

                //pack Info พบ Docitem ที่สามารถ Mapping ได้
                if (docItem != null)
                {
                    AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(ConverterModel.ToDocumentItemStorageObject(packH, null, null, docItem.ID), this.BuVO);
                    var doc = AWMSEngine.ADO.DocumentADO.GetInstant().Get(docItem.Document_ID, this.BuVO);
                    if (doc.EventStatus == DocumentEventStatus.NEW)
                    {
                        AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value, DocumentEventStatus.NEW, null, DocumentEventStatus.WORKING, this.BuVO);
                        if (doc.ParentDocument_ID.HasValue)
                            AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ParentDocument_ID.Value, DocumentEventStatus.NEW, null, DocumentEventStatus.WORKING, this.BuVO);
                    }
                    docItems.Add(docItem);
                }
                else
                {
                    var doc = AWMSEngine.ADO.DocumentADO.GetInstant().ListDocs(DocumentTypeID.GOODS_RECEIVED, souBranchID, _warehouseASRS.ID, _areaASRS.ID, 1, this.BuVO)
                       .FirstOrDefault(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.NEW);
                    //Pack Info ไม่พบ Document Item ใดๆที่ตรงกับในระบบ
                    if (doc == null)
                    {
                        doc = new CreateGRDocument().Execute(this.Logger, this.BuVO,
                            new CreateGRDocument.TReq()
                            {
                                refID = null,
                                ref1 = null,
                                ref2 = null,
                                souBranchID = this.StaticValue.Warehouses.First(x => x.ID == _warehouseASRS.ID).Branch_ID,
                                souWarehouseID = _warehouseASRS.ID,
                                desBranchID = this.StaticValue.Warehouses.First(x => x.ID == _warehouseASRS.ID).Branch_ID,
                                desWarehouseID = _warehouseASRS.ID,
                                desAreaMasterID = _areaASRS.ID,
                                movementTypeID = MovementType.RECEIVE_PRODUCTION,
                                orderNo = packH.orderNo,
                                lot = null,
                                batch = null,
                                documentDate = DateTime.Now,
                                actionTime = DateTime.Now,
                                eventStatus = DocumentEventStatus.WORKING,
                                receiveItems = new List<CreateGRDocument.TReq.ReceiveItem>() {
                                                    new CreateGRDocument.TReq.ReceiveItem
                                                    {
                                                        packCode = packH.code,
                                                        quantity = null,
                                                        unitType = packH.unitCode,
                                                        batch = null,
                                                        lot = null,
                                                        orderNo = packH.orderNo,
                                                        ref2 = null,
                                                        options = packH.options,
                                                        eventStatus = DocumentEventStatus.WORKING,
                                                        docItemStos = new List<amt_DocumentItemStorageObject>() { ConverterModel.ToDocumentItemStorageObject(packH) }

                                                    }}
                            });
                        docItems.AddRange(doc.DocumentItems);
                    }
                    //insert mappingDisto ก่อน

                    //Pack Info พบ Document แต่ไม่พบ DocumentItem
                    else
                    {
                        var packConvert = this.StaticValue.ConvertToBaseUnitByPack(packH.mstID.Value, 1, packH.unitID);
                        docItem = new amt_DocumentItem()
                        {
                            Document_ID = doc.ID.Value,
                            Code = packH.code,
                            PackMaster_ID = packH.mstID,
                            Quantity = null,
                            UnitType_ID = packH.unitID,
                            BaseQuantity = null,
                            BaseUnitType_ID = packH.baseUnitID,
                            Batch = null,
                            Lot = null,
                            OrderNo = packH.orderNo,
                            ProductionDate = packH.productDate,
                            SKUMaster_ID = packConvert.skuMaster_ID,
                            EventStatus = DocumentEventStatus.WORKING,
                            Ref2 = null,
                            DocItemStos = new List<amt_DocumentItemStorageObject>() { ConverterModel.ToDocumentItemStorageObject(packH) }
                        };
                        AWMSEngine.ADO.DocumentADO.GetInstant().CreateItem(docItem, this.BuVO);
                        docItems.Add(docItem);
                    }
                }
            }

            return docItems;
         }
        /* private List<amt_DocumentItem> ProcessReceiving_CreateDocumentItems(TReq reqVO, long souWarehouseID, List<StorageObjectCriteria> packs, bool isAutoCreate)
         {
             List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();
             return docItems;

         }*/


    }
}
