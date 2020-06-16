using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Engine.V2.Business.Wave;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.ProcessQueue
{
    public class ASRSCreatWaveProcessQueueAPI : BaseAPIService
    {
        public ASRSCreatWaveProcessQueueAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<ASRSCreatWaveProcessQueue.TReq>(this.RequestVO);
            var res = new ASRSCreatWaveProcessQueue().Execute(this.Logger, this.BuVO, req);


            if (req.flagAuto)
            {
                var workingWave = new WorkingWave();
                var working = workingWave.Execute(this.Logger, this.BuVO, new WorkingWave.TReq()
                {
                    waveID = res.WaveID
                    
                });
            }
            return res;
        }
    }
}
