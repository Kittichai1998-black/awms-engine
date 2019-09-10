using AMWUtil.Common;
using AWMSEngine.APIService;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.V2.Business.Picking;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Business
{
    public class TestPickAPI : BaseAPIService
    {
        public TestPickAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
     
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel <TestPick.TReq>(this.RequestVO);           
            var res = new TestPick().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
