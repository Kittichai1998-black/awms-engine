using AMWUtil.Exception;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectMRK.Engine.Business.WorkQueue
{
    public class GetLastPallet : BaseEngine<GetLastPallet.TReq, GetLastPallet.TRes>
    {
        public class TReq
        {
            public string palletCode;
            public string warehouseCode;
            public string areaCode;
            public string locationCode;
        }

        public class TRes
        {
            public string warehouseCode;
            public string areaCode;
            public string locationCode;
            public BaseInfo baseInfo;
            public class BaseInfo
            {
                public long id;
                public string baseCode;
                public List<PackInfos> packInfos;
                public class PackInfos
                {
                    public string code;
                    public decimal qty;
                    public string unit;
                    public decimal baseQty;
                    public string baseUnit;
                    public string batch;
                    public string lot;
                    public string orderNo;
                    public DateTime? prodDate;
                }
            }
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var stos = AWMSEngine.ADO.StorageObjectADO.GetInstant().GetLastPallet(reqVO.palletCode, reqVO.warehouseCode, reqVO.areaCode, reqVO.locationCode, this.BuVO);
            var res = new TRes();
            if (res == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Pallet " + reqVO + " Data Not Found");

            var getBaseSto = stos.First();
            res.warehouseCode = getBaseSto.warehouseCode;
            res.areaCode = getBaseSto.areaCode;
            res.locationCode = getBaseSto.locationCode;
            res.baseInfo = new TRes.BaseInfo
            {
                id = getBaseSto.id,
                baseCode = getBaseSto.baseCode,
                packInfos = stos.Select(sto =>
                {
                    return new TRes.BaseInfo.PackInfos()
                    {
                        code = sto.code,
                        qty = sto.qty,
                        unit = sto.unit,
                        baseQty = sto.baseQty,
                        baseUnit = sto.baseUnit,
                        batch = sto.batch,
                        lot = sto.lot,
                        orderNo = sto.orderNo,
                        prodDate = sto.prodDate
                    };
                }).ToList()
            };

            return res;
        }
    }
}
