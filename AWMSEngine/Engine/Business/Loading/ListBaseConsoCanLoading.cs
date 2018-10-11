using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Loading
{
    public class ListBaseConsoCanLoading : BaseEngine<ListBaseConsoCanLoading.TReq, ListBaseConsoCanLoading.TRes>
    {
        public class TReq
        {
            public long LDDocID;
        }
        public class TRes : SPOutSTORootCanUseCriteria
        {
            public bool isLoaded;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var loadingItems = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>("Document_ID", reqVO.LDDocID, this.BuVO);
            var stoLoadings = ADO.StorageObjectADO.GetInstant().ListInDoc(reqVO.LDDocID, null, DocumentTypeID.LOADING, this.BuVO);
            List<StorageObjectCriteria> stoIssueds = new List<StorageObjectCriteria>();
            if (loadingItems.GroupBy(x => x.LinkDocument_ID).Any(x => x.Count() > 1))
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Loading ID : " + reqVO.LDDocID + " / LinkDocument_ID Dupplicate");
            loadingItems.ForEach(x => {
                var stoIssued = ADO.StorageObjectADO.GetInstant().ListInDoc(reqVO.LDDocID, null, DocumentTypeID.GOODS_ISSUED, this.BuVO);
                stoIssueds.AddRange(stoIssued);
            });


            /*TRes res = new TRes();
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
                */
            return null;

        }
    }
}
