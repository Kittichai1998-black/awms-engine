using AMWUtil.Common;
using AWMSEngine.APIService;
using AWMSEngine.Controllers.V2;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using ProjectBOTHY.Engine.Business.Document;
using ProjectBOTHY.Engine.WorkQueue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectBOTHY.APIService
{
    public class CancelPalletAPI : BaseAPIService
    {
        public CancelPalletAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {

            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<CancelPallet.TReq>(this.RequestVO);
            var res = new CancelPallet().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
