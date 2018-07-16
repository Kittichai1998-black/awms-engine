using AMWUtil.Exception;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Validation
{
    public class ValidateInnerSTOLowerlimit : BaseEngine<StorageObjectCriteria, NullCriteria>
    {
        protected override NullCriteria ExecuteEngine(StorageObjectCriteria reqVO)
        {
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
                if (sto.minWeiKG.HasValue && sto.weiKG > sto.minWeiKG)
                    throw new AMWException(this.Logger, AMWExceptionCode.V3002, sto.code + " weight over limit");
            }
            if (sto.mapstos != null)
                sto.mapstos.ForEach(x => this.ValidateQuantity(sto));
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
                    if (osm != null)
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Object Sizte Not Map");
                    }
                    if (osm.minQuantity.HasValue && s.count > osm.minQuantity.Value)
                        throw new AMWException(this.Logger, AMWExceptionCode.V3002, sto.code + "Over limit");
                }
                
            }

            if (sto.mapstos != null)
                sto.mapstos.ForEach(x => this.ValidateQuantity(sto));
        }
    }
}
