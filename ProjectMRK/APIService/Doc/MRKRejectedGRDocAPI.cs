using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using ProjectMRK.Engine.Business;
using ProjectMRK.Engine.Business.Received;
using Microsoft.AspNetCore.Mvc;
using AWMSEngine.APIService;

namespace ProjectMRK.APIService.Doc
{
    public class MRKRejectedGRDocAPI : BaseAPIService
    {
        public MRKRejectedGRDocAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<RejectedGRDocument.TDocReq>(this.RequestVO);
            var res = new RejectedGRDocument().Execute(this.Logger, this.BuVO, req);

            return res;

        }
    }
}
