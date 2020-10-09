using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business
{
    public class GetInfoBaseSTO : BaseEngine<GetInfoBaseSTO.TReq, StorageObjectCriteria>
    {
       
        public class TReq
        {
            public string baseCode;
        }
       
        protected override StorageObjectCriteria ExecuteEngine(TReq reqVO)
        {

            var getSto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(reqVO.baseCode, null, null, false, true, BuVO);
             
            //add ได้เฉพาะ Received receiving
            return getSto;
        }

    }
}
