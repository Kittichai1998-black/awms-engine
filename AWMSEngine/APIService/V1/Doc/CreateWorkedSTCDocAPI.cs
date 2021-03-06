using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.Business.Auditor;
using AWMSEngine.Engine.Business.Loading;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Doc
{
    public class CreateWorkedSTCDocAPI : BaseAPIService
    {
        public CreateWorkedSTCDocAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<CreateWorkedSTCDocument.TDocReq>(this.RequestVO);
            var res = new CreateWorkedSTCDocument().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
