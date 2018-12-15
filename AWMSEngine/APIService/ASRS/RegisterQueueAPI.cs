using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.Business.Received;
using AWMSEngine.Engine.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
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
            //validate น้ำหนัก
            //เพิ่ม Mapping
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<RegisterQueueReceiving.TReq>(this.RequestVO);
            var res = new RegisterQueueReceiving().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
