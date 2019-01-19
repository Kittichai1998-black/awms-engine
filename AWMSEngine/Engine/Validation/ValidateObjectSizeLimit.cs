using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Validation
{
    public class ValidateObjectSizeLimit : BaseEngine<StorageObjectCriteria, NullCriteria>
    {
        protected override NullCriteria ExecuteEngine(StorageObjectCriteria reqVO)
        {
            if (reqVO.objectSizeID.HasValue)
                ValidateInner(reqVO.ToTreeList());
            return null;
        }

        private void ValidateInner(List<StorageObjectCriteria> stoTreeList)
        {
            var packMasters = ADO.DataADO.GetInstant().SelectBy<ams_PackMaster>(
                new SQLConditionCriteria(
                    "ID",
                    string.Join(',', stoTreeList.Where(x => x.type == StorageObjectType.PACK).Select(x => x.mstID.Value).Distinct().ToArray()),
                    SQLOperatorType.IN),
                this.BuVO);
            var baseMasters = ADO.DataADO.GetInstant().SelectBy<ams_BaseMaster>(
                new SQLConditionCriteria(
                    "ID",
                    string.Join(',', stoTreeList.Where(x => x.type == StorageObjectType.BASE).Select(x => x.mstID.Value).Distinct().ToArray()),
                    SQLOperatorType.IN),
                this.BuVO);

            foreach (var sto in stoTreeList)
            {
                if (sto.mapstos.Any(x => !sto.objectSizeMaps.Any(y => y.innerObjectSizeID == x.objectSizeID)))
                    throw new AMWException(this.Logger, AMWExceptionCode.V3002, "ไม่พบความสัมพันธ์ระหว่าง ObjectSize");

                foreach (var objSizeID in sto.mapstos.GroupBy(x => x.objectSizeID).Select(x => x.Key))
                {
                    var objSize = sto.objectSizeMaps.First(x => x.innerObjectSizeID == objSizeID);

                    if (objSize.minQuantity.HasValue &&
                        sto.mapstos.Where(x => x.objectSizeID == objSizeID).Sum(x => x.baseQty) < objSize.minQuantity.Value)
                        throw new AMWException(this.Logger, AMWExceptionCode.V3002, sto.code + " ต่ำกว่าที่กำหนดใน ObjectSize");

                    else if (objSize.maxQuantity.HasValue &&
                        sto.mapstos.Where(x => x.objectSizeID == objSizeID).Sum(x => x.baseQty) > objSize.maxQuantity.Value)
                        throw new AMWException(this.Logger, AMWExceptionCode.V3002, sto.code + " เกินกว่าที่กำหนดใน ObjectSize");
                }

                if (sto.minWeiKG.HasValue && sto.weiKG < sto.minWeiKG)
                    throw new AMWException(this.Logger, AMWExceptionCode.V3002, "Weight น้อยกว่าที่กำหนดใน ObjectSize");
                else if (sto.maxWeiKG.HasValue && sto.weiKG > sto.maxWeiKG)
                    throw new AMWException(this.Logger, AMWExceptionCode.V3002, "Weight เกินกว่าที่กำหนดใน ObjectSize");

                if (sto.weiAccept.HasValue && this.StaticValue.IsFeature(FeatureCode.IB0201))
                {
                    decimal? weiStd = this.GetGrossWeiSTDSummary(sto, baseMasters, packMasters);
                    if (!weiStd.HasValue)
                        throw new AMWException(this.Logger, AMWExceptionCode.V3002, "บางรายการสินค้าไม่ได้กำหนด Weight มาตราฐาน");

                    var weiStart = (1.0m - (sto.weiAccept.Value / 100.0m)) * weiStd.Value;
                    var weiEnd = (1.0m + (sto.weiAccept.Value / 100.0m)) * weiStd.Value;
                    if (!sto.weiKG.Value.IsBetween(weiStart,weiEnd))
                        throw new AMWException(this.Logger, AMWExceptionCode.V3002, "น้ำหนักสินค้าที่ยอมรับได้ต้องอยู่ระหว่าง '" + weiStart.ToString("0.000") + "kg.' ถึง '" + weiEnd.ToString("0.000") + "kg.' ");
                }

            }
        }

        private decimal? GetGrossWeiSTDSummary(StorageObjectCriteria sto, List<ams_BaseMaster> baseMasters, List<ams_PackMaster> packMasters)
        {
            decimal? wei = null;
            if (sto.type == StorageObjectType.BASE)
                wei = baseMasters.First(x => x.ID == sto.mstID).WeightKG;
            else if (sto.type == StorageObjectType.PACK)
                wei = packMasters.First(x => x.ID == sto.mstID).WeightKG;

            wei = wei.HasValue ? wei * sto.qty : null;

            if (sto.mapstos == null || sto.mapstos.Count() == 0 || !wei.HasValue)
                return wei;
            else
            {
                foreach(var sto2 in sto.mapstos)
                {
                    var wei2 = GetGrossWeiSTDSummary(sto2, baseMasters, packMasters);
                    if (wei2 == null)
                        return null;
                    wei = wei2.HasValue ? wei2 + wei : null;
                }
                return wei;
            }
        }
    }
}
