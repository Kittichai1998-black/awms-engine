using AMWUtil.Common;
using AMWUtil.Exception;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Validation
{
    public class ValidateObjectSizeLimit : BaseEngine<StorageObjectCriteria, NullCriteria>
    {
        protected override NullCriteria ExecuteEngine(StorageObjectCriteria reqVO)
        {
            this.ValidateLimit(reqVO, true, true, true);
            return null;
        }


        protected void ValidateLimit(StorageObjectCriteria sto, bool chkLow, bool chkOver , bool chkRange = false)
        {
            this.Logger.LogInfo("Validate StoCode:" + sto.code + " -> Inner Weight:" + sto.innerWeiKG + "kg" + " -> Volume:" + sto.volume+"unit");
            if (chkLow)
            {
                if (sto.objectSize.minInnerWeiKG.HasValue && (sto.innerWeiKG ?? 0) < sto.objectSize.minInnerWeiKG.Value)
                    throw new AMWException(this.Logger, AMWExceptionCode.V3002, "น้ำหนัก '" + sto.weiKG + "kg' ต่ำกว่าที่กำหนด '" + sto.objectSize.minInnerWeiKG + "kg'");
                if (sto.objectSize.minInnerVolume.HasValue && sto.volume > sto.objectSize.minInnerVolume)
                    throw new AMWException(this.Logger, AMWExceptionCode.V3002, "ปริมาตร '" + sto.volume + "unit' ต่ำกว่าที่กำหนด '" + sto.objectSize.minInnerVolume + "unit'");
            }

            if (chkOver)
            {
                if (sto.objectSize.maxInnerWeiKG.HasValue && (sto.innerWeiKG ?? 0) > sto.objectSize.maxInnerWeiKG.Value)
                    throw new AMWException(this.Logger, AMWExceptionCode.V3002, "น้ำหนัก '" + sto.weiKG + "kg' มากกว่าที่กำหนด '" + sto.objectSize.maxInnerWeiKG + "kg'");
                if (sto.objectSize.maxInnerVolume.HasValue && sto.volume > sto.objectSize.maxInnerVolume)
                    throw new AMWException(this.Logger, AMWExceptionCode.V3002, "ปริมาตร '" + sto.volume + "unit' มากกว่าที่กำหนด '" + sto.objectSize.maxInnerVolume + "unit'");
            }

            if (chkRange)
            {
                var stdWei = GetGrossWeiSTDSummary(sto);
                if (sto.objectSize.weiAccept.HasValue && sto.weiKG.HasValue)
                {
                    if (!stdWei.HasValue)
                        throw new AMWException(this.Logger, AMWExceptionCode.V3002, "ไม่ได้ config weight standard");

                    var stdWeiRange = stdWei.Value * (sto.objectSize.weiAccept.Value / 100.0m);
                    var stdWeiStart = stdWei.Value - stdWeiRange;
                    var stdWeiEnd = stdWei.Value + stdWeiRange;
                    if (!sto.weiKG.Value.IsBetween(stdWeiStart, stdWeiEnd))
                        throw new AMWException(this.Logger, AMWExceptionCode.V3002, "น้ำหนักสินค้าที่ยอมรับได้ต้องอยู่ระหว่าง '" + stdWeiStart.ToString("0.000") + "kg.' ถึง '" + stdWeiEnd.ToString("0.000") + "kg.' ");

                }
            }

            if (sto.mapstos != null)
                sto.mapstos.ForEach(x => this.ValidateLimit(x, chkLow, chkOver, chkRange));
        }


        private decimal? GetGrossWeiSTDSummary(StorageObjectCriteria sto)
        {
            decimal? wei = sto.mstWeiKG * sto.qty;

            if (sto.mapstos == null || sto.mapstos.Count() == 0 || !wei.HasValue)
                return wei;
            else
            {
                foreach(var sto2 in sto.mapstos)
                {
                    var wei2 = GetGrossWeiSTDSummary(sto2);
                    if (wei2 == null)
                        return null;
                    wei = wei2.HasValue ? wei2 + wei : null;
                }
                return wei;
            }
        }
    }
}
