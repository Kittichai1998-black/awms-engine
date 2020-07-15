using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.V2.Business.Wave;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.Wave
{
    public class WorkingWaveAPI : BaseAPIService
    {
        public WorkingWaveAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<WorkingWave.TReq>(this.RequestVO);
            var exec = new WorkingWave().Execute(this.Logger, this.BuVO, req);
            return exec;
        }
    }
}
