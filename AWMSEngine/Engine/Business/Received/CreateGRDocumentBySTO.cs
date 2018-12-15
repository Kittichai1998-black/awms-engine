using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Common;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Received
{
    public class CreateGRDocumentBySTO : BaseEngine<CreateGRDocumentBySTO.TReq, amt_Document>
    {
        public class TReq
        {
            public StorageObjectCriteria stomap;
        }
        protected override amt_Document ExecuteEngine(TReq reqVO)
        {
            var stopacks = this.ListPackSTOIDs(reqVO.stomap);
            var stopackLockByDock = ADO.DocumentADO.GetInstant().ListStoIDInDocs(stopacks.Select(x => x.id.Value).ToList(), DocumentTypeID.GOODS_RECEIVED, this.BuVO);

            stopacks.RemoveAll(x => stopackLockByDock.Any(y => y.StorageObject_ID == x.id));

            amt_Document doc = null;

            /*long? sou_Branch_ID = null;
            long? sou_Warehouse_ID = null;
            long? sou_AreaMaster_ID = null;
            if (reqVO.stomap.type == StorageObjectType.LOCATION)
            {
                var locationMst = ADO.DataADO.GetInstant().SelectByID<ams_AreaLocationMaster>(reqVO.stomap.id, BuVO);
                var areaMst = this.StaticValue.AreaMasters.Where(x => x.ID == locationMst.AreaMaster_ID).FirstOrDefault();
                var warehouseMst = areaMst == null ? null : this.StaticValue.Warehouses.Where(x => x.ID == areaMst.Warehouses_ID).FirstOrDefault();
                var branchMst = warehouseMst == null ? null : this.StaticValue.Branchs.Where(x => x.ID == warehouseMst.Branch_ID).FirstOrDefault();
                sou_AreaMaster_ID = areaMst != null ? areaMst.ID : null;
                sou_Warehouse_ID = warehouseMst != null ? warehouseMst.ID : null;
                sou_Branch_ID = branchMst != null ? branchMst.ID : null;
            }*/

            long? des_Branch_ID = null;
            long? des_Warehouse_ID = reqVO.stomap.warehouseID;
            long? des_AreaMaster_ID = reqVO.stomap.areaID;
            this.StaticValue.Warehouses.FindAll(x => x.ID == des_Warehouse_ID).ForEach(x => des_Branch_ID = x.Branch_ID);

            //var docItem = ADO.DataADO.GetInstant().SelectByID<amt_DocumentItem>(DocumentTypeID.GOODS_RECEIVED, this.BuVO);
            //string des_Supplier_ID = docItem.Options;
            


            doc = new amt_Document()
            {
                ActionTime = null,
                Code = null,
                Sou_Customer_ID = null,
                Sou_Supplier_ID = null,
                Sou_Branch_ID = null,
                Sou_Warehouse_ID = null,
                Sou_AreaMaster_ID = null,
                Des_Customer_ID = null,
                Des_Branch_ID = des_Branch_ID,
                Des_Warehouse_ID = des_Warehouse_ID,
                Des_AreaMaster_ID = des_AreaMaster_ID,
                Options = null,
                DocumentDate = DateTime.Now,
                DocumentType_ID = DocumentTypeID.GOODS_RECEIVED,
                ID = null,
                EventStatus = DocumentEventStatus.WORKING,
                RefID = null,
                Ref1 = null,
                Ref2 = null,
                ParentDocument_ID = null,
                DocumentItems = new List<amt_DocumentItem>(),
                Remark = reqVO.stomap.code


            };
            var packs = stopacks
                .GroupBy(x => new { code = x.code, mstID = x.mstID, options = x.options })
                .Select(x => new { key = x.Key, count = x.Count(), stoIDs = x.Select(y => y).ToList() });
            //if (packs.Count() == 0)
            //    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "ไม่พบสินค้ารอรับเข้า");
            foreach (var p in packs)
            {
                var packmst = ADO.DataADO.GetInstant().SelectByID<ams_PackMaster>(p.key.mstID, this.BuVO);
                doc.DocumentItems.Add(new amt_DocumentItem()
                {
                    SKUMaster_ID = packmst.SKUMaster_ID,
                    PackMaster_ID = p.key.mstID.Value,
                    Code = p.key.code,
                    ID = null,
                    EventStatus = DocumentEventStatus.WORKING,
                    Options = p.key.options,
                    Quantity = p.count,
                    ExpireDate = null,
                    ProductionDate = null,
                    Ref1 = null,
                    Ref2 = null,
                    RefID = null,
                    //TODO
                    DocItemStos = ConverterModel.ToDocumentItemStorageObject(p.stoIDs)
                });
            }

            if (packs.Count() > 0)
                doc = ADO.DocumentADO.GetInstant().Create(doc, BuVO);

            /*foreach (var docItem in doc.DocumentItems)
            {
                ADO.DocumentADO.GetInstant().MappingSTO(docItem.ID.Value, docItem.StorageObjectIDs, this.BuVO);
            }*/
            return doc;
        }

        private List<StorageObjectCriteria> ListPackSTOIDs(StorageObjectCriteria mapsto)
        {
            List<StorageObjectCriteria> mapstos = new List<StorageObjectCriteria>();
            if (mapsto.type == StorageObjectType.PACK)
            {
                mapstos.Add(mapsto);
            }
            mapsto.mapstos.ForEach(x => mapstos.AddRange(ListPackSTOIDs(x)));
            return mapstos;
        }
    }
}
