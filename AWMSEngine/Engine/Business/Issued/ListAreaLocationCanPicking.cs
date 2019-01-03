using AWMSModel.Criteria.SP.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Issued
{
    public class ListAreaLocationCanPicking : BaseEngine<ListAreaLocationCanPicking.TReq, ListAreaLocationCanPicking.TRes>
    {
        public class TReq
        {
            public List<long> docItemIDs;
        }
        public class TRes
        {
            public List<TData> datas;
            public class TData
            {
                public long id;
                public string code;
                public int areaID;
                public string areaCode;
                public int? areaLocationID;
                public string areaLocationCode;
                public int warehouseID;
                public string warehouseCode;
                public int branchID;
                public string branchCode;
                public decimal packQty;
                public string packUnitCode;
                public decimal packBaseQty;
                public string packBaseUnitCode;
            }

        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();
            res.datas = new List<TRes.TData>();
            foreach (long id in reqVO.docItemIDs)
            {
                List<SPOutSTORootCanUseCriteria> stos = ADO.StorageObjectADO.GetInstant().ListRootCanPicking(id, this.BuVO);
                var datas = stos
                    .GroupBy(x => new {
                        id = x.id,
                        code = x.code,
                        areaID = x.areaID,
                        areaCode = x.areaCode,
                        areaLocationID = x.areaLocationID,
                        areaLocationCode = x.areaLocationCode,
                        branchID = x.branchID,
                        branchCode = x.branchCode,
                        warehouseID = x.warehouseID,
                        warehouseCode = x.warehouseCode,
                        packBaseUnitCode = x.packBaseUnitCode,
                        packUnitCode = x.packUnitCode
                    })
                    .Select(x => new TRes.TData()
                    {
                        id = x.Key.id,
                        code = x.Key.code,
                        areaID = x.Key.areaID,
                        areaCode = x.Key.areaCode,
                        areaLocationID = x.Key.areaLocationID,
                        areaLocationCode = x.Key.areaLocationCode,
                        branchID = x.Key.branchID,
                        branchCode = x.Key.branchCode,
                        warehouseID = x.Key.warehouseID,
                        warehouseCode = x.Key.warehouseCode,
                        packQty = x.Sum(y => y.packQty),
                        packBaseQty = x.Sum(y => y.packBaseQty),
                        packBaseUnitCode = x.Key.packBaseUnitCode,
                        packUnitCode = x.Key.packUnitCode
                    }).ToList();
                res.datas.AddRange(datas);
            }
            

            return res;

        }
    }
}
