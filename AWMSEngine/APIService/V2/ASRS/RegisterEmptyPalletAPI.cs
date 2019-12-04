using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.ASRS
{
    public class RegisterEmptyPalletAPI : BaseAPIService
    {
        public RegisterEmptyPalletAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();

            RegisterWorkQueue.TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<RegisterWorkQueue.TReq>(this.RequestVO);
            var engine = new Engine.V2.Business.WorkQueue.RegisterEmptyPallet();
            var res = engine.Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
