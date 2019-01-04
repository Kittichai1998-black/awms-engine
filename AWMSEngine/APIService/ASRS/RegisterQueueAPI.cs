using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.Business.Received;
using AWMSEngine.Engine.Business.WorkQueue;
using AWMSEngine.Engine.General;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.ASRS
{
    public class RegisterQueueAPI : BaseAPIService
    {
        public RegisterQueueAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();

            RegisterQueueReceiving.TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<RegisterQueueReceiving.TReq>(this.RequestVO);
            /*new PutAutoWarehouse().Execute(this.Logger, this.BuVO, new PutAutoWarehouse.TReq()
            {
                datas = req.mappingPallets
                .Select(x => new PutAutoWarehouse.TReq.TCodeName() { Code = x.source, Name = x.source, BranchCode = "1200" })
                .ToList()
            });*/
            //validate น้ำหนัก
            //เพิ่ม Mapping
            var res = new RegisterQueueReceiving().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
