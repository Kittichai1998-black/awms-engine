using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Common;
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
    public class RegisterQueueReceiving2 : AWMSEngine.Engine.BaseEngine<RegisterQueueReceiving2.TReq, List<amt_DocumentItem>>
    {
        public class TReq //ข้อมูล Request จาก WCS
        {
            public string baseCode;//รหัสพาเลท
            public decimal? weight;//น้ำหนัก Kg.
            public decimal? width;//กว้าง M.
            public decimal? length;//ยาว M.
            public decimal? height;//สูง M.
            public string warehouseCode;//รหัสคลังสินค้า
            public string areaCode;//รหัสโซน
            public string locationCode;//รหัสเกต
            public DateTime actualTime;
        }
        private ams_AreaLocationMaster _locationASRS;
        private ams_Warehouse _warehouseASRS;
        private ams_AreaMaster _areaASRS;

        protected override List<amt_DocumentItem> ExecuteEngine(TReq reqVO)
        {
            //Init Data from ASRS
            this.InitDataASRS(reqVO);
            var sto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode,
               null, null, false, true, this.BuVO);
            //var sto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode,
           //    _warehouseASRS.ID, _areaASRS.ID, false, true, this.BuVO);
            if (_areaASRS.ID != sto.areaID)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Area don't macth");
            if (_locationASRS.ID != sto.parentID)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Location don't macth");

            if (sto == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Storage Object of Base Code: '" + reqVO.baseCode + "' Not Found");
            if (sto.code != reqVO.baseCode)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Base Code: '" + reqVO.baseCode + "' INCORRECT");

            List<amt_DocumentItem> docItems = null;
            //รับสินค้าใหม่เข้าคลัง
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
            if (packs != null)
            {
                foreach (var packH in packs)
                {
                    long souBranchID = StaticValue.Warehouses.First(x => x.ID == _warehouseASRS.ID).Branch_ID.Value;
                    //หา  List<amt_DocumentItem> ที่มีสินค้าตรงกัน และเช็ค Options(CartonNo) ถ้าไม่ตรงให้เพิ่ม DocItem ใหม่
                    var docItem = AWMSEngine.ADO.DocumentADO.GetInstant()
                       .ListItemCanMapV2(DocumentTypeID.GOODS_RECEIVED, packH.mstID, packH.baseQty, souBranchID, _warehouseASRS.ID, null, null, packH.unitID, packH.baseUnitID, packH.orderNo, null, null, packH.options, this.BuVO)
                       .FirstOrDefault(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.NEW);

                    //pack Info พบ Docitem ที่สามารถ Mapping ได้
                    if (docItem != null)
                    {
                       var docItemsSto = AWMSEngine.ADO.DocumentADO.GetInstant()
                       .ListStoInDocs(docItem.Document_ID, this.BuVO)
                       .FirstOrDefault(x => x.Status == EntityStatus.INACTIVE && x.Sou_StorageObject_ID == packH.id);
                        if (docItemsSto != null)
                            throw new AMWException(this.Logger, AMWExceptionCode.V1001, "'Document Item StorageObject had SKU Code '" + packH.code + "', Order No.'" + packH.orderNo + "' on Pallet Code '"+ reqVO.baseCode + "' already");
                        
                        AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(ConverterModel.ToDocumentItemStorageObject(packH, null, null, docItem.ID), this.BuVO);
                       /* var doc = AWMSEngine.ADO.DocumentADO.GetInstant().Get(docItem.Document_ID, this.BuVO);
                        if (doc.EventStatus == DocumentEventStatus.NEW)
                        {
                            AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value, DocumentEventStatus.NEW, null, DocumentEventStatus.WORKING, this.BuVO);
                            if (doc.ParentDocument_ID.HasValue)
                                AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ParentDocument_ID.Value, DocumentEventStatus.NEW, null, DocumentEventStatus.WORKING, this.BuVO);
                        }*/
                        docItems.Add(docItem);
                    }
                    else 
                    {
                        var doc = AWMSEngine.ADO.DocumentADO.GetInstant().ListDocs(DocumentTypeID.GOODS_RECEIVED, souBranchID, _warehouseASRS.ID, null, MovementType.RECEIVE_PRODUCTION, this.BuVO)
                           .FirstOrDefault(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.NEW); //_areaASRS.ID
                        //Pack Info ไม่พบ Document Item ใดๆที่ตรงกับในระบบ และยังไม่มี Document ใหม่
                        if (doc == null)
                        {
                            //สร้าง Document, Document Item ใหม่,  InsertMappingSTO ภายในฟังก์ชั่น CreateGRDocument
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
                                    eventStatus = DocumentEventStatus.NEW,
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
                                                        eventStatus = DocumentEventStatus.NEW,
                                                        docItemStos = new List<amt_DocumentItemStorageObject>() { ConverterModel.ToDocumentItemStorageObject(packH) }

                                                    }}
                                });
                            docItems.AddRange(doc.DocumentItems);
                        }

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
                                Options = packH.options,
                                ProductionDate = packH.productDate,
                                SKUMaster_ID = packConvert.skuMaster_ID,
                                EventStatus = DocumentEventStatus.NEW,
                                Ref2 = null,
                                DocItemStos = new List<amt_DocumentItemStorageObject>() { ConverterModel.ToDocumentItemStorageObject(packH) }
                            };
                            AWMSEngine.ADO.DocumentADO.GetInstant().CreateItem(docItem, this.BuVO);
                            docItems.Add(docItem);
                        }
                    }
                }
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Don't had SKU" + reqVO.baseCode + " in pallet.");
            }

            return docItems;
        }
    }
}
