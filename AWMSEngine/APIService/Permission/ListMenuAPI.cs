using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using AWMSEngine.Common;
using Microsoft.AspNetCore.Mvc;
using AWMSEngine.Engine.General;

namespace AWMSEngine.APIService.Permission
{
    public class ListMenuAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 57; //57
        }
        public ListMenuAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var res1 = new ListMenu().Execute(this.Logger, this.BuVO,
                new ListMenu.TReqModel() { Token = this.RequestVO.token });

            return res1;
        }
    }
}
