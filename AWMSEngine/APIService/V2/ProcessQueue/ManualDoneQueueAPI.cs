using ADO.WCSAPI;
using AWMSEngine.Controllers.V2;
using AWMSEngine.Engine.V2.Business.WorkQueue;

namespace AWMSEngine.APIService.V2.ProcessQueue
{
    public class ManualDoneQueueAPI : BaseAPIService
    {
        public ManualDoneQueueAPI(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel <WCSQueueADO.TReqCheckQueue> (this.RequestVO);
            var res = new ManualDoneQueue().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
