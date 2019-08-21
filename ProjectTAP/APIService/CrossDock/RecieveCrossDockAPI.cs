using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.APIService;
using Microsoft.AspNetCore.Mvc;
using ProjectTAP.Engine.Business.Crossdock;

namespace ProjectTAP.APIService.CrossDock
{
    public class RecieveCrossDockAPI : BaseAPIService
    {
        public RecieveCrossDockAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = false) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<RecieveCrossdock.TReq>(this.RequestVO);
            var crossdock = new RecieveCrossdock();
            var res = crossdock.Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
