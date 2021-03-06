using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;

using ADO.WMSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business
{
    public class GetDataConvertUnit : BaseEngine<GetDataConvertUnit.TReq, GetDataConvertUnit.TRes>
    {
        public class TReq
        {
            public long skuID;
            public long unitRepackID;
            public long newUnitID;
            public long oldQty;

        }
        public class TRes
        {
            public ConvertUnitCriteria qtyRepack;
            public string newUnitRepack;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var res = new TRes();

            var newQty = StaticValue.ConvertToNewUnitBySKU(
                reqVO.skuID,
                reqVO.oldQty,
                reqVO.unitRepackID,
                reqVO.newUnitID);

            var newUnit = StaticValue.UnitTypes.FirstOrDefault(x => x.ID == newQty.newUnitType_ID).Code;
            res.qtyRepack = newQty;
            res.newUnitRepack = newUnit;
            return res;
        }
    }
}
