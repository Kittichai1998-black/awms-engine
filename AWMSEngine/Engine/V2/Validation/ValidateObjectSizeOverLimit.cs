using AMWUtil.Exception;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Validation
{
    public class ValidateObjectSizeOverLimit : BaseEngine<StorageObjectCriteria, NullCriteria>
    {
        protected override NullCriteria ExecuteEngine(StorageObjectCriteria reqVO)
        {
            //if (!reqVO.objectSizeMaps.Any(x => reqVO.mapstos.Any(y => y.objectSizeID == x.innerObjectSizeID)))
            //    throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ไม่สามารถนำลงกล่องหรือพาเลทได้ ตั้งค่าการจัดการขนาดสินค้าและพาเลท");
            this.ValidateWeight(reqVO);
            this.ValidateQuantity(reqVO);

            return null;
        }

        private void ValidateWeight(StorageObjectCriteria sto)
        {
            if (sto.type == AWMSModel.Constant.EnumConst.StorageObjectType.PACK)
                return;
            if (sto.objectSizeID.HasValue)
            {
                this.Logger.LogDebug("//Validate Weight : " + sto.code);
                if (sto.maxWeiKG.HasValue && sto.weiKG > sto.maxWeiKG)
                    throw new AMWException(this.Logger, AMWExceptionCode.V3002, "น้ำหนักเกินจากที่กำหนด");
            }
            if (sto.mapstos != null)
                sto.mapstos.ForEach(x => this.ValidateWeight(x));
        }
        private void ValidateQuantity(StorageObjectCriteria sto)
        {
            if (sto.type == AWMSModel.Constant.EnumConst.StorageObjectType.PACK)
                return;
            if (sto.objectSizeID.HasValue)
            {
                this.Logger.LogDebug("//Validate Quantity : " + sto.code);

                foreach (var s in sto.mapstos.GroupBy(x => x.objectSizeID).Select(x => new { objectSizeID = x.Key, sum = (decimal)x.Sum(y => y.baseQty) }))
                {
                    var osm = sto.objectSizeMaps.FirstOrDefault(x => x.innerObjectSizeID == s.objectSizeID);
                    if (osm == null)
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ยังไม่ได้กำหนดค่า ไม่สามารถใส่ลงกล่อง หรือ พาเลทได้");
                    }
                    if (osm.maxQuantity.HasValue && s.sum > osm.maxQuantity.Value)
                        throw new AMWException(this.Logger, AMWExceptionCode.V3002, "เกินจำนวนที่กำหนด");
                }

            }

            if (sto.mapstos != null && sto.mapstos.Count() > 0)
                sto.mapstos.ForEach(x => this.ValidateQuantity(x));
        }
    }
}