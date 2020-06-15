using AMWUtil.Common;
using AWMSEngine.ADO;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
namespace ProjectAERP.ADO.ERPApi
{
    public class ERPInterfaceADO : BaseAPIAccess<ERPInterfaceADO>
    {

        public ERPRetuenWHInboundClosing SendToERP(dynamic reqVO, string apiConfigName, VOCriteria buVO)
        {
            //var res = new TRes();
            ERPRetuenWHInboundClosing res = this.SendJson<ERPRetuenWHInboundClosing>(apiConfigName, reqVO, null, buVO);

            return res;
        }
    }
}
