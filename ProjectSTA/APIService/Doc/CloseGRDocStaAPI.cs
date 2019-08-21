using AMWUtil.Common;
using AWMSEngine.APIService; 
using Microsoft.AspNetCore.Mvc;
using ProjectSTA.Engine.Business;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectSTA.APIService.Doc
{
    public class CloseGRDocStaAPI : BaseAPIService
    {
        public CloseGRDocStaAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }


        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<ClosedGRDocument.TReq>(this.RequestVO);
            var res = new ClosedGRDocument().Execute(this.Logger, this.BuVO, req);
            this.CommitTransaction();
            return res;
        }
    }
}
