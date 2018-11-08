using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.WorkQueue
{
    public class RegisterQueueReceiving : BaseEngine<RegisterQueueReceiving.TReq,RegisterQueueReceiving.TRes>
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
            public string loactionCode;//รหัสเกต
        }
        public class TRes //ข้อมูล Response ไปให้ WCS
        {
            public string souWarehouseCode;//รหัสคลังสินค้า
            public string souAreaCode;//รหัสโซน
            public string souLocationCode;//รหัสเกต
            public string desWarehouseCode;//รหัสคลังสินค้า
            public string desAreaCode;//รหัสโซน
            public string desLocationCode;//รหัสเกต
            public int queueID;//รหัสคิว
            public BaseInfo baseInfo;//ข้อมูลพาเลทและสินค้าในพาเลท
            public class BaseInfo
            {
                public string baseCode;//รหัสพาเลท
                public List<PackInfo> packInfos;//ข้อมูลสินค้าในพาเลท
                public class PackInfo
                {
                    public string packCode;//รหัส Packet
                    public int packQty;//จำนวน Packet
                    public string skuCode;//รหัส SKU
                    public int skuQty;//จำนวนสินค้านับจาก SKU
                    public string lot;
                    public string batch;

                    public DateTime? minProductDate;//วันผลิด ต่ำสุดจากทั้งหมดใยพาเลท
                    public DateTime? maxProductDate;//วันผลิด สูงสุดจากทั้งหมดใยพาเลท
                    public DateTime? minExpireDate;//วันหมดอายุ ต่ำสุดจากทั้งหมดใยพาเลท
                    public DateTime? maxExpireDate;//วันหมดอายุ สูงสุดจากทั้งหมดใยพาเลท
                }
            }
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var wm = this.StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            if (wm == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Warehouse Code '" + reqVO.warehouseCode + "'");
            var am = this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode && x.Warehouses_ID == wm.ID);
            if (am == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Area Code '" + reqVO.areaCode + "'");
            var lm = ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.loactionCode),
                    new KeyValuePair<string,object>("Area_ID",am.ID.Value),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO).FirstOrDefault();
            if (lm == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Location Code '" + reqVO.loactionCode + "'");


            var mapsto = ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode, wm.ID, null, false, true, this.BuVO);
            if (mapsto == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Base Code '" + reqVO.baseCode + "'");

            if (mapsto.eventStatus == StorageObjectEventStatus.IDEL)
            {
                this.ValidateReceiving(mapsto, reqVO);
                mapsto.eventStatus = StorageObjectEventStatus.RECEIVING;
            }
            else if (mapsto.eventStatus == StorageObjectEventStatus.AUDITING || mapsto.eventStatus == StorageObjectEventStatus.AUDITED)
            {
                this.ValidateAuditReturn(mapsto, reqVO);
            }
            else if (mapsto.eventStatus == StorageObjectEventStatus.RECEIVED)
            {
                this.ValidateWarehouseMoving(mapsto, reqVO);
            }
            else
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ไม่สามารถรับ Base Code '" + reqVO.baseCode + "' เข้าคลังได้ เนื่องจากมีสถานะ '" + mapsto.eventStatus + "'");
            
            mapsto.weiKG = reqVO.weight;
            mapsto.lengthM = reqVO.length;
            mapsto.heightM = reqVO.height;
            mapsto.widthM = reqVO.width;
            mapsto.warehouseID = wm.ID.Value;
            mapsto.areaID = wm.ID.Value;
            mapsto.parentID = lm.ID.Value;
            mapsto.parentType = StorageObjectType.LOCATION;

            ADO.StorageObjectADO.GetInstant()
                .UpdateStatusToChild(mapsto.id.Value, StorageObjectEventStatus.IDEL, null, StorageObjectEventStatus.RECEIVING, this.BuVO);
            ADO.StorageObjectADO.GetInstant()
                .PutV2(mapsto, this.BuVO);

            var res = this.GenerateResponse(mapsto,reqVO);
            return res;
        }

        private void ValidateReceiving(StorageObjectCriteria mapsto, TReq reqVO)
        {
            var mapstoTree = mapsto.ToTreeList();
            var packReceivigngs = mapstoTree.FindAll(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.IDEL);
            var docs = ADO.DocumentADO.GetInstant()
                .ListBySTO(
                    packReceivigngs.Select(x => x.id.Value).ToList(),
                    DocumentTypeID.GOODS_RECEIVED,
                    this.BuVO);
            List<dynamic> stoInDocs = new List<dynamic>();
            docs.ForEach(x =>
            {
                if (x.EventStatus != DocumentEventStatus.WORKING)
                    throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ไม่สามารถรับเข้าได้. เอกสาร Goods Receved มีสถานะ '" + x.EventStatus + "'");

                var sids = ADO.DocumentADO.GetInstant().ListStoIDInDocs(x.ID.Value, this.BuVO);
                stoInDocs.AddRange(sids.Select(y => new {
                    StorageObject_ID = y.StorageObject_ID,
                    DocumentItem_ID = y.DocumentItem_ID,
                    Document_ID = x.ID.Value
                }));
            });


            if (!packReceivigngs.TrueForAll(x => stoInDocs.Any(y => y.StorageObjec_ID == x.id)))
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ไม่สามารถรับเข้าได้. สินค้าไม่มีเอกสาร Goods Receved อ้างอิง");
        }

        private void ValidateAuditReturn(StorageObjectCriteria mapsto, TReq reqVO)
        {
            var mapstoTree = mapsto.ToTreeList();
            var packAudits = mapstoTree.FindAll(
                                    x => x.type == StorageObjectType.PACK && 
                                    (x.eventStatus == StorageObjectEventStatus.AUDITING || x.eventStatus == StorageObjectEventStatus.AUDITED));
            var docs = ADO.DocumentADO.GetInstant()
                .ListBySTO(
                    packAudits.Select(x => x.id.Value).ToList(),
                    DocumentTypeID.STOCK_AUDIT,
                    this.BuVO);
            List<dynamic> stoInDocs = new List<dynamic>();
            docs.ForEach(x =>
            {
                if (x.EventStatus != DocumentEventStatus.WORKING)
                    throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ไม่สามารถรับเข้าได้. เอกสาร Stock Audit มีสถานะ '" + x.EventStatus + "'");

                var sids = ADO.DocumentADO.GetInstant().ListStoIDInDocs(x.ID.Value, this.BuVO);
                stoInDocs.AddRange(sids.Select(y => new {
                    StorageObject_ID = y.StorageObject_ID,
                    DocumentItem_ID = y.DocumentItem_ID,
                    Document_ID = x.ID.Value
                }));
            });

            if (!packAudits.TrueForAll(x => stoInDocs.Any(y => y.StorageObjec_ID == x.id)))
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ไม่สามารถรับเข้าได้. สินค้าไม่มีเอกสาร Stock Audit อ้างอิง");
        }

        private void ValidateWarehouseMoving(StorageObjectCriteria mapsto, TReq reqVO)
        {

        }
        private TRes GenerateResponse(StorageObjectCriteria mapsto, TReq reqVO)
        {
            TRes res = new TRes()
            {
                souWarehouseCode = reqVO.warehouseCode,
                souAreaCode = reqVO.areaCode,
                souLocationCode = reqVO.loactionCode,

                desWarehouseCode = reqVO.warehouseCode,
                desAreaCode = "STO",
                desLocationCode = null,

                queueID = 1,

                baseInfo = new TRes.BaseInfo()
                {
                    baseCode = mapsto.code,
                    packInfos = mapsto.ToTreeList()
                                    .Where(x=>x.type== StorageObjectType.PACK)
                                    .GroupBy(x=>new {
                                        packID = x.mstID,
                                        packCode = x.code,
                                        batch = x.batch,
                                        lot = x.lot
                                    })
                                    .Select(x=> {
                                        //var sm = ADO.DataADO.GetInstant().SelectBy<dynamic>()
                                        var v = new TRes.BaseInfo.PackInfo()
                                        {
                                            packCode = x.Key.packCode,
                                            packQty = x.Count(),
                                            batch = x.Key.batch,
                                            lot = x.Key.lot,

                                        };
                                        return v;
                                    })
                                    .ToList()
                }
            };

            return res;
        }

    }
}
