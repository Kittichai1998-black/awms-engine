using AWMSEngine.Engine.Business.WorkQueue;
using AWMSModel.Criteria;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.ASRS
{
    public class DoneQueueAPI : BaseAPIService
    {
        public DoneQueueAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<DoneQueue.TReq>(this.RequestVO);
            WorkQueueCriteria res = new DoneQueue().Execute(this.Logger, this.BuVO, req);
            new Engine.General.MoveStoInGateToNextArea().Execute(this.Logger, this.BuVO, new Engine.General.MoveStoInGateToNextArea.TReq()
            {
                baseStoID = res.baseInfo.id
            });
            return res;
        }
    }
}
