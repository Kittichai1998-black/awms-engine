using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO;
using AWMSEngine.ADO.StaticValue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business
{
    public class DocGoodsReceivedCreateBySTO : BaseEngine<DocGoodsReceivedCreateBySTO.TReq, amt_Document>
    {
        public class TReq
        {
            public int? Des_Branch_ID;
            public int? Des_Warehouse_ID;
            public int? Des_AreaMaster_ID;
            public StorageObjectCriteria stomap;
        }
        protected override amt_Document ExecuteEngine(TReq reqVO)
        {
            var stopacks = this.GetPackForNewDoc(reqVO.stomap);
            amt_Document doc = null;

            long? sou_Branch_ID = null;
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
            }

            doc = new amt_Document()
            {
                ActionTime = null,
                Code = null,
                Sou_Branch_ID = sou_Branch_ID,
                Sou_Warehouse_ID = sou_Warehouse_ID,
                Sou_AreaMaster_ID = sou_AreaMaster_ID,
                Des_Branch_ID = reqVO.Des_Branch_ID,
                Des_Warehouse_ID = reqVO.Des_Warehouse_ID,
                Des_AreaMaster_ID = reqVO.Des_AreaMaster_ID,
                Supplier_ID = null,
                Options = null,
                DocumentDate = DateTime.Now,
                DocumentType_ID = DocumentTypeID.GOODS_RECEIVED,
                Dealer_ID = null,
                ID = null,
                EventStatus = DocumentEventStatus.ONPROGRESS,
                Ref1 = null,
                Ref2 = null,
                Ref3 = null,
                ParentDocument_ID = null,
                DocumentItems = new List<amt_DocumentItem>(),
                Remark = null

            };
            var packs = stopacks
                .GroupBy(x => new { code = x.code, mstID = x.mstID, options = ObjectUtil.ListKeyToQueryString(x.options) })
                .Select(x => new { key = x.Key, count = x.Count(), stoIDs = x.Select(y => y.id.Value).ToList() });
            foreach (var p in packs)
            {
                var packmst = ADO.DataADO.GetInstant().SelectByID<ams_PackMaster>(p.key.mstID, this.BuVO);
                doc.DocumentItems.Add(new amt_DocumentItem()
                {
                    SKU_ID = packmst.SKU_ID,
                    PackMaster_ID = p.key.mstID.Value,
                    Code = p.key.code,
                    ID = null,
                    EventStatus = DocumentEventStatus.ONPROGRESS,
                    Options = p.key.options,
                    Quantity = p.count,
                    ExpireDate = null,
                    ProductionDate = null,
                    Ref1 = null,
                    Ref2 = null,
                    Ref3 = null,
                    StorageObjectIDs = p.stoIDs
                });
            }


            doc = ADO.DocumentADO.GetInstant().Create(doc, BuVO);

            /*foreach (var docItem in doc.DocumentItems)
            {
                ADO.DocumentADO.GetInstant().MappingSTO(docItem.ID.Value, docItem.StorageObjectIDs, this.BuVO);
            }*/
            return doc;
        }

        private List<StorageObjectCriteria> GetPackForNewDoc(StorageObjectCriteria mapsto, List<StorageObjectCriteria> outMapstos = null)
        {
            if (outMapstos == null)
                outMapstos = new List<StorageObjectCriteria>();
            if (mapsto._onchange && mapsto.type == StorageObjectType.PACK)
            {
                outMapstos.Add(mapsto);
            }
            mapsto.mapstos.ForEach(x => GetPackForNewDoc(x, outMapstos));
            return outMapstos;
        }
    }
}
