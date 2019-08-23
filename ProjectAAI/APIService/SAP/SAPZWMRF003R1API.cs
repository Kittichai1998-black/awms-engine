using AWMSEngine.APIService;
using Microsoft.AspNetCore.Mvc;
using ProjectAAI.Engine.Business.Issued;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectAAI.APIService.SAP
{
    public class SAPZWMRF003R1API : BaseAPIService
    {
        public SAPZWMRF003R1API(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<CreateIssuedDocR1.TReq>(this.RequestVO);
            var res = new CreateIssuedDocR1();
            return res.Execute(this.Logger, this.BuVO, req);
        }
    }
}
