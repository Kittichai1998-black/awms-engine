﻿using System;
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
        public RecieveCrossDockAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = false) : base(controllerAPI, isAuthenAuthorize)
        {
        }
        public override int APIServiceID()
        {
            return 93;
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