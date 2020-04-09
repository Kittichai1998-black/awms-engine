using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Entity;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.Wave
{
    public class DoneDistoWaveSeqAPI : BaseAPIService
    {
        public DoneDistoWaveSeqAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true, bool isJsonResponse = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize, isJsonResponse)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<DoneDistoWaveSeq.TReq>(this.RequestVO);
            var exec = new DoneDistoWaveSeq().Execute(this.Logger, this.BuVO, req);

            List<amt_WaveSeq> waveSeq = exec.waveSeqs;

            var reqClose = AMWUtil.Common.ObjectUtil.DynamicToModel<ClosedWave.TReq>(waveSeq);
            new ClosedWave().Execute(this.Logger, this.BuVO, reqClose);

            return exec;

        }
    }
}
