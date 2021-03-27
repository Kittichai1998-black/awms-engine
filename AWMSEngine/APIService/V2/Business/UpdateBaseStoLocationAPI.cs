using AMSModel.Criteria.API;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Business
{
    public class UpdateBaseStoLocationAPI : BaseAPIService
    {
        protected override dynamic ExecuteEngineManual()
        {
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<WMRes_UpdateBaseStoLocation>(this.RequestVO);

            var res = new UpdateBaseStoLocation().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
