﻿using AMWUtil.Exception;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Validation
{
    public class ValidateObjectSizeLowerLimit : BaseEngine<StorageObjectCriteria, NullCriteria>
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
                if (sto.minWeiKG.HasValue && sto.weiKG < sto.minWeiKG)
                    throw new AMWException(this.Logger, AMWExceptionCode.V3002, "น้ำหนักต่ำกว่าจากที่กำหนด");
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
                if (sto.mapstos.Count() == 0 && sto.objectSizeMaps.Any(x => x.minQuantity > 0))
                    throw new AMWException(this.Logger, AMWExceptionCode.V3002, "ต่ำกว่าจำนวนที่กำหนด");
                foreach (var s in sto.mapstos.GroupBy(x => x.objectSizeID).Select(x => new { objectSizeID = x.Key, sum = (decimal)x.Sum(y=>y.baseQty) }))
                {
                    var osm = sto.objectSizeMaps.FirstOrDefault(x => x.innerObjectSizeID == s.objectSizeID);
                    if (osm == null)
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ยังไม่ได้กำหนดค่า ไม่สามารถใส่ลงกล่อง หรือ พาเลท ขนาดนี้ได้");
                    }
                    if (osm.minQuantity.HasValue && s.sum < osm.minQuantity.Value)
                        throw new AMWException(this.Logger, AMWExceptionCode.V3002, "ต่ำกว่าจำนวนที่กำหนด");
                }

            }

            if (sto.mapstos != null)
                sto.mapstos.ForEach(x => this.ValidateQuantity(x));
        }
    }
}