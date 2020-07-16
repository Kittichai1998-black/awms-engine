using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSModel.Criteria;
using Microsoft.AspNetCore.Mvc;
using ProjectAERP.Engine.Document;

namespace ProjectAERP.APIService.Document
{
    public class DoneQueueClosedAPI : AWMSEngine.APIService.BaseAPIService
    {
        public DoneQueueClosedAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<ERPRetuenWHInboundClosed>(this.RequestVO);
            var res = new DoneQueueClosed().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
