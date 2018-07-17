using AMWUtil.Exception;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Validation
{
    public class ValidateInnerSTOOverlimit : BaseEngine<StorageObjectCriteria, NullCriteria>
    {
        protected override NullCriteria ExecuteEngine(StorageObjectCriteria reqVO)
        {
            if (!reqVO.objectSizeMaps.Any(x => reqVO.mapstos.Any(y => y.objectSizeID == x.innerObjectSizeID)))
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ยังไม่ได้กำหนดค่า ไม่สามารถใส่ลงกล่อง หรือ พาเลทได้");
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
                foreach (var s in sto.mapstos.GroupBy(x => x.objectSizeID).Select(x => new { objectSizeID = x.Key, count = (decimal)x.Count() }))
                {
                    var osm = sto.objectSizeMaps.FirstOrDefault(x => x.innerObjectSizeID == s.objectSizeID);
                    if (osm == null)
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ยังไม่ได้กำหนดค่า ไม่สามารถใส่ลงกล่อง หรือ พาเลทได้");
                    }
                    if (osm.maxQuantity.HasValue && s.count > osm.maxQuantity.Value)
                        throw new AMWException(this.Logger, AMWExceptionCode.V3002, "เกินจำนวนที่กำหนด");
                }
                
            }

            if (sto.mapstos != null)
                sto.mapstos.ForEach(x => this.ValidateQuantity(x));
        }
    }
}
