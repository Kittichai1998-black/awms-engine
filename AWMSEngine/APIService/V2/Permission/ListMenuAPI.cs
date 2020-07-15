using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using AWMSEngine.Common;
using Microsoft.AspNetCore.Mvc;
using AWMSEngine.Engine.V2.General;

namespace AWMSEngine.APIService.V2.Permission
{ 
    public class ListMenuAPI : BaseAPIService
    {
        public ListMenuAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
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
