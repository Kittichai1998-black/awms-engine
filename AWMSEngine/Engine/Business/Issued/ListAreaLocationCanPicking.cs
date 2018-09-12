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
            public long docItemID;
        }
        public class TRes
        {
            public List<TData> datas;
            public class TData
            {
                public int areaID;
                public string areaCode;
                public int? areaLocationID;
                public string areaLocationCode;
                public int warehouseID;
                public string warehouseCode;
                public int branchID;
                public string branchCode;
                public int packQty;
            }

        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            List<SPOutSTORootIssued> stos = ADO.StorageObjectADO.GetInstant().FindRootForIssued(reqVO.docItemID, this.BuVO);
            TRes res = new TRes();
            res.datas = stos
                .GroupBy(x => new {
                    areaID = x.areaID,
                    areaCode = x.areaCode,
                    areaLocationID = x.areaLocationID,
                    areaLocationCode = x.areaLocationCode,
                    branchID = x.branchID,
                    branchCode = x.branchCode,
                    warehouseID = x.warehouseID,
                    warehouseCode = x.warehouseCode
                })
                .Select(x => new TRes.TData()
                {
                    areaID = x.Key.areaID,
                    areaCode = x.Key.areaCode,
                    areaLocationID = x.Key.areaLocationID,
                    areaLocationCode = x.Key.areaLocationCode,
                    branchID = x.Key.branchID,
                    branchCode = x.Key.branchCode,
                    warehouseID = x.Key.warehouseID,
                    warehouseCode = x.Key.warehouseCode,
                    packQty = x.Sum(y => y.packQty)
                }).ToList();

            return res;

        }
    }
}
