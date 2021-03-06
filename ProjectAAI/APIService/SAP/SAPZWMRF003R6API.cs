using AWMSEngine.APIService;
using Microsoft.AspNetCore.Mvc;
using ProjectAAI.Engine.Business.Issued;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectAAI.APIService.SAP
{
    public class SAPZWMRF003R6API : BaseAPIService
    {
        public SAPZWMRF003R6API(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<SAPZWMRF003R6.TReq>(this.RequestVO);
            var res = new SAPZWMRF003R6();
            return res.Execute(this.Logger, this.BuVO, req);
        }
    }
}
