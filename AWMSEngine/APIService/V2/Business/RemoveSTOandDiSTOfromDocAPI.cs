using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Business
{
    public class RemoveSTOandDiSTOfromDocAPI : BaseAPIService
    {
        public RemoveSTOandDiSTOfromDocAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<RemoveSTOandDiSTOfromDoc.TReq>(this.RequestVO);
            var res = new RemoveSTOandDiSTOfromDoc().Execute(this.Logger, this.BuVO, req);
            return res;

        }
    }
}
