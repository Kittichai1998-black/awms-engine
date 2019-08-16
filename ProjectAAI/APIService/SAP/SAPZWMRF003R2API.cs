using AWMSEngine.APIService;
using Microsoft.AspNetCore.Mvc;
using ProjectAAI.Engine.Business.Issued;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectAAI.APIService.SAP
{
    public class SAPZWMRF003R2API : BaseAPIService
    {
        public SAPZWMRF003R2API(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        public override int APIServiceID()
        {
            return 765;
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<SAPZWMRF003R2.TReq>(this.RequestVO);
            var res = new SAPZWMRF003R2();
            return res.Execute(this.Logger, this.BuVO, req);
        }
    }
}
