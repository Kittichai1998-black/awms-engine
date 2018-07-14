using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business
{
    public class FreeSTO : BaseEngine<FreeSTO.TReqModel, StorageObjectCriteria>
    {
        public class TReqModel
        {
            public string code;
            public bool isInStorage;
        }
        protected override StorageObjectCriteria ExecuteEngine(TReqModel reqVO)
        {
            StorageObjectCriteria res =
                ADO.StorageObjectADO.GetInstant()
                .GetFree(reqVO.code, reqVO.isInStorage, this.BuVO);
            return res;
        }

    }
}
