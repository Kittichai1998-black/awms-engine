using AMWUtil.Common;
using AWMSEngine.APIService;
using AWMSModel.Criteria;
using Microsoft.AspNetCore.Mvc;
using ProjectPanKan.Engine.Business;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace ProjectPanKan.APIService.WM
{
    public class GetDocLoadByIDAPI : BaseAPIService
    {
        public GetDocLoadByIDAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = ObjectUtil.DynamicToModel<GetDocLoadByID.TReq>(this.RequestVO);
            var res = new GetDocLoadByID().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
