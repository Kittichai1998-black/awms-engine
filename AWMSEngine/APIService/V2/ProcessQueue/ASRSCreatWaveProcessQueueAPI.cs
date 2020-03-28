using AWMSEngine.ADO.StaticValue;
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
            //this.RollbackTransaction();

            if (req.desASRSAreaCode)
            {
                var nextDistoWaveSeq = new NextDistoWaveSeq();

                var nextDistoWaveSeqs = nextDistoWaveSeq.Execute(this.Logger, this.BuVO, new NextDistoWaveSeq.TReq()
                {
                    DesAreaID = StaticValueManager.GetInstant().AreaMasters.Find(x=>x.Code == req.desASRSAreaCode).ID.Value,
                    DesLocationID = null,
                    CurrentDistoIDs = res.CurrentDistoIDs
                });
            }
         
            return res;
        }
    }
}
