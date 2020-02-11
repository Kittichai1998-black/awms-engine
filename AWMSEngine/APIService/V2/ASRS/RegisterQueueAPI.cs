
using AWMSEngine.Engine.V2.Business.WorkQueue;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.ASRS
{
    public class RegisterQueueAPI : BaseAPIService
    {
        public RegisterQueueAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();

            RegisterWorkQueue.TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<RegisterWorkQueue.TReq>(this.RequestVO);
            /*new PutAutoWarehouse().Execute(this.Logger, this.BuVO, new PutAutoWarehouse.TReq()
            {
                datas = req.mappingPallets
                .Select(x => new PutAutoWarehouse.TReq.TCodeName() { Code = x.source, Name = x.source, BranchCode = "1200" })
                .ToList()
            });*/
            var res = new RegisterWorkQueue().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
