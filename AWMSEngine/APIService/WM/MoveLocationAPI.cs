﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.Business;
using Microsoft.AspNetCore.Mvc;
namespace AWMSEngine.APIService.WM
{
    public class MoveLocationAPI : BaseAPIService
    {
        public MoveLocationAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<UpdateStoMoveLocation.TDocReq>(this.RequestVO);
            var res = new UpdateStoMoveLocation().Execute(this.Logger, this.BuVO, req);
            return res;

        }
    }
}
