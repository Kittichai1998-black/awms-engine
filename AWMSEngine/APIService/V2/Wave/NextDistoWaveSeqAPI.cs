using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Controllers.V2;
using AWMSEngine.Engine.V2.Business.Wave;
using AMSModel.Entity;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.Wave
{
    public class NextDistoWaveSeqAPI : BaseAPIService
    {
        public NextDistoWaveSeqAPI(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<NextDistoWaveSeq.TReq>(this.RequestVO);
            List<amt_DocumentItemStorageObject> exec = new NextDistoWaveSeq().Execute(this.Logger, this.BuVO, req);

            

            return exec;
        }
    }
}
