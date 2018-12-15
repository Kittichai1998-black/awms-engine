using AMWUtil.Common;
using AWMSEngine.ADO.StaticValue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Common
{
    public static class ConverterModel
    {

        public static WorkQueueCriteria ToWorkQueueCriteria(this SPworkQueue workQ)
        {
            WorkQueueCriteria res = new WorkQueueCriteria()
            {
                //areaCode = ADO.StaticValue.StaticValueManager.GetInstant().AreaMasterLines.Find(x => x.ID == this.AreaMaster_ID).Code
            };
            return res;
        }

        public static List<amt_WorkQueueDocumentItem> ToDocumentItemWorkQueue(
          List<amt_DocumentItem> docItems,
          StorageObjectCriteria mapsto,
          long? workQueusID = null)
        {
            var mapstoTree = mapsto.ToTreeList();
            List<amt_WorkQueueDocumentItem> res = new List<amt_WorkQueueDocumentItem>();
            foreach (var di in docItems)
            {
                decimal baseQty = mapstoTree
                                            .Where(x => x.type == StorageObjectType.PACK &&
                                                    x.mstID == di.PackMaster_ID &&
                                                    x.baseUnitID == di.BaseUnitType_ID &&
                                                    x.batch == di.Batch &&
                                                    x.lot == di.Lot &&
                                                    x.orderNo == di.OrderNo)
                                            .Sum(x => x.baseQty);
                var unitConvert = StaticValueManager.GetInstant().ConvertToNewUnitBySKU(di.SKUMaster_ID.Value, baseQty, di.BaseUnitType_ID.Value, di.UnitType_ID.Value);
                amt_WorkQueueDocumentItem r = new amt_WorkQueueDocumentItem()
                {
                    BaseQuantity = unitConvert.baseQty,
                    BaseUnitType_ID = unitConvert.baseUnitType_ID,
                    Quantity = unitConvert.qty,
                    UnitType_ID = unitConvert.unitType_ID,
                    DocumentItem_ID = di.ID.Value,
                    WorkQueue_ID = workQueusID ?? 0
                };
                res.Add(r);
            }
            return res;
        }

        public static amt_DocumentItemStorageObject ToDocumentItemStorageObject(
          this StorageObjectCriteria pack,
          decimal? baseQty = null,
          long? unitID = null,
          long? docItemID = null)
        {
            return ToDocumentItemStorageObject(new StorageObjectCriteria[] { pack }.ToList(), baseQty, unitID, docItemID).First();
        }
        public static List<amt_DocumentItemStorageObject> ToDocumentItemStorageObject(
          this List<StorageObjectCriteria> packs,
          decimal? baseQty = null,
          long? unitID = null,
          long? docItemID = null)
        {
            if (packs.Any(x => x.type != StorageObjectType.PACK))
                throw new Exception("DocumentItem Mapping ได้กับ Pack เท่านั้น");
            return packs.Select(x => new amt_DocumentItemStorageObject()
            {
                BaseQuantity = baseQty ?? x.baseQty,
                BaseUnitType_ID = x.baseUnitID,
                Quantity = StaticValueManager.GetInstant().ConvertToNewUnitByPack(
                    x.mstID.Value,
                    baseQty ?? x.baseQty,
                    x.baseUnitID,
                    unitID ?? x.unitID).qty,
                UnitType_ID = unitID ?? x.unitID,
                DocumentItem_ID = docItemID ?? 0,
                StorageObject_ID = x.id.Value
            }).ToList();
        }
    }
}
