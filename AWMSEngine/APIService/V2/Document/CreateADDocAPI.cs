using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Engine.V2.Business.Auditor;
using AWMSEngine.Engine.V2.Business.Issued;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.Document
{
    public class CreateADDocAPI : BaseAPIService
    {
        public CreateADDocAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            CreateADDocument.TReq reqData = ObjectUtil.DynamicToModel<CreateADDocument.TReq>(this.RequestVO);
            var res = new CreateADDocument().Execute(
                this.Logger,
                this.BuVO,
                reqData);

            return res;
        }
    }

}
