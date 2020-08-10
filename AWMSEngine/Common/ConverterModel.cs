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
        public static List<amt_WorkQueueDocumentItem> ToDocumentItemWorkQueue(
          List<amt_DocumentItem> docItems,
          StorageObjectCriteria mapsto,
          long? workQueusID = null)
        {
            var mapstoTree = mapsto.ToTreeList();
            List<amt_WorkQueueDocumentItem> res = new List<amt_WorkQueueDocumentItem>();
            if (docItems != null)
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

                    var getSto = mapstoTree.Where(x => x.type == StorageObjectType.PACK).FirstOrDefault();

                        var unitConvert = StaticValueManager.GetInstant().ConvertToNewUnitBySKU(getSto.skuID.Value, baseQty, getSto.baseUnitID, getSto.unitID);

                        amt_WorkQueueDocumentItem r = new amt_WorkQueueDocumentItem()
                        {
                            BaseQuantity = unitConvert.oldQty,
                            BaseUnitType_ID = unitConvert.oldUnitType_ID,
                            Quantity = unitConvert.newQty,
                            UnitType_ID = unitConvert.newUnitType_ID,
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
                    unitID ?? x.unitID).newQty,
                UnitType_ID = unitID ?? x.unitID,
                DocumentItem_ID = docItemID ?? 0,
                Sou_StorageObject_ID = x.id.Value,
                Des_StorageObject_ID = x.id.Value
            }).ToList();
        }
         
    }
}
