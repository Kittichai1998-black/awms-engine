using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.General;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.ASRS
{
    public class RegisterQueueAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 20;
        }
        public RegisterQueueAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
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
