using AMWUtil.Common;
using AWMSEngine.Engine.V2.General;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Data
{
    public class GetValueQRCodeAPI : BaseAPIService
    {
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<GetValueQRCode.TReq>(this.RequestVO);
            var res = new GetValueQRCode().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
