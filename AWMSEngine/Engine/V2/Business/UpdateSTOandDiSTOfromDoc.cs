using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business
{
    public class UpdateSTOandDiSTOfromDoc : BaseEngine<UpdateSTOandDiSTOfromDoc.TReq, NullCriteria>
    {

        public class TReq
        {
            public long? distoID;
            public decimal? Quantity;
        }

        protected override NullCriteria ExecuteEngine(TReq reqVO)
        {
            var getDiSTO = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_DocumentItemStorageObject>(reqVO.distoID.Value, this.BuVO);

            if (getDiSTO == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูล Document Item Storage Object");

            var getStoPack = ADO.StorageObjectADO.GetInstant().Get(getDiSTO.Sou_StorageObject_ID, StorageObjectType.PACK, false, false, BuVO);
            var baseUnitTypeConvt = StaticValue.ConvertToBaseUnitBySKU(getStoPack.skuID.Value, reqVO.Quantity.Value, getStoPack.unitID);

            getStoPack.qty = reqVO.Quantity.Value;
            getStoPack.baseQty = baseUnitTypeConvt.baseQty;

            var stoIDUpdated = ADO.StorageObjectADO.GetInstant().PutV2(getStoPack, this.BuVO);

            ADO.DocumentADO.GetInstant().UpdateMappingSTO(getDiSTO.ID.Value, null, reqVO.Quantity.Value, baseUnitTypeConvt.baseQty, EntityStatus.INACTIVE, BuVO);

            return null;
        }

    }
}