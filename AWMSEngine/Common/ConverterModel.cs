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

        public static amt_DocumentItemStorageObject ToDocumentItemStorageObject(
          this StorageObjectCriteria pack,
          decimal? baseQty = null,
          long? mapByUnitID = null,
          long? docItemID = null)
        {
            return ToDocumentItemStorageObject(new StorageObjectCriteria[] { pack }.ToList(), baseQty, mapByUnitID, docItemID).First();
        }
        public static List<amt_DocumentItemStorageObject> ToDocumentItemStorageObject(
          this List<StorageObjectCriteria> packs,
          decimal? baseQty = null,
          long? mainUnitID = null,
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
                    mainUnitID ?? x.unitID).qty,
                UnitType_ID = mainUnitID ?? x.unitID,
                DocumentItem_ID = docItemID ?? 0,
                StorageObject_ID = x.id.Value
            }).ToList();
        }
    }
}
