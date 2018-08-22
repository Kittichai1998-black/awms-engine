using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.General
{
    public class STOFullSearch :BaseEngine<SPInSTOSearchCriteria, STOFullSearch.TRes>
    {
        public class TRes
        {
            public List<StorageObjectFullCriteria> datas;
        }
        protected override TRes ExecuteEngine(SPInSTOSearchCriteria reqVO)
        {
            TRes res = new TRes();
            res.datas = ADO.StorageObjectADO.GetInstant().Search(reqVO, this.BuVO);

            return res;
        }
    }
}
