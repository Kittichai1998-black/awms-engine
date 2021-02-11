using AMWUtil.Common;
using AMWUtil.Exception;
using ADO.WMSStaticValue;
using AMSModel.Criteria.SP.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.General
{
    public class CheckEmptyLocation : BaseEngine<CheckEmptyLocation.TReq,CheckEmptyLocation.TRes>
    {
        public class TReq
        {
            public long? warehouseID;
            public string warehouseCode;
            public long? areaID;
            public string areaCode;
            public string locationCode;
            public string gate;
            public string bank;
            public int? bay;
            public int? level;
        }
        public class TRes {
            public List<EmptyLocation> locations;
            public class EmptyLocation: SPOutCountItemInLocation
            {
                public bool isEmpty;
            }
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            long? wmId = reqVO.warehouseID;
            if (!wmId.HasValue)
            {
                var warehouse = StaticValueManager.GetInstant().Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
                if (warehouse == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Warehouse Code '" + reqVO.warehouseCode + "'");
                wmId = warehouse.ID;
            }
            long? amId = reqVO.areaID;
            if (!amId.HasValue)
            {
                var area = StaticValueManager.GetInstant().AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode);
                if (area == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบ Area Code '" + reqVO.areaCode + "'");
                amId = area.ID;
            }
            var locations = ADO.WMSDB.AreaADO.GetInstant()
                .CountItemInLocation(wmId, amId, reqVO.locationCode, reqVO.gate, reqVO.bank, reqVO.bay, reqVO.level, this.BuVO)
                .Select(x => {
                    var v = ObjectUtil.JsonCast<TRes.EmptyLocation>(x);
                    v.isEmpty = v.countProducts == 0;
                    return v;
                })
                .ToList();

            return new TRes() { locations= locations };
        }

    }
}
