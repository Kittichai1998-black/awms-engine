using AMWUtil.Common;
using AWMSEngine.ADO;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
namespace ProjectAERP.ADO.ERPApi
{
    public class ERPInterfaceCountingADO : BaseAPIAccess<ERPInterfaceCountingADO>
    {

        public AMWWHCounting SendToERPCounting(dynamic reqVO, string apiConfigName, VOCriteria buVO)
        {
            //var res = new TRes();
            AMWWHCounting res = this.SendJson<AMWWHCounting>(apiConfigName, reqVO, null, buVO);

            return res;
        }
    }
}
