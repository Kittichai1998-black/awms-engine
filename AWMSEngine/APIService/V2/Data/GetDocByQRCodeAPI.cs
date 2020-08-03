using AMWUtil.Common;
using AWMSEngine.Engine.V2.General;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Data
{
    public class GetDocByQRCodeAPI : BaseAPIService
    {
        public GetDocByQRCodeAPI(Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<GetDocByQRCode.TReq>(this.RequestVO);
            var res = new GetDocByQRCode().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
