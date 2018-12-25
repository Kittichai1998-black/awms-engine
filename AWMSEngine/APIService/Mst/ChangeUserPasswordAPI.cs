using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Mst
{
    public class ChangeUserPasswordAPI : BaseAPIService
    {
        public ChangeUserPasswordAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var reqData = AMWUtil.Common.ObjectUtil.DynamicToModel<Engine.General.ChangePass.TReq>(this.RequestVO);
            var res = new Engine.General.ChangePass().Execute(this.Logger, this.BuVO, reqData);
            return res;
        }
    }
}
