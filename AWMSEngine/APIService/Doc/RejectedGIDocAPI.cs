using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.Business;
using AWMSEngine.Engine.Business.Issued;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Doc
{
    public class RejectedGIDocAPI : BaseAPIService
    { 
      public override int APIServiceID()
    {
        return 43;
    }
    
        public RejectedGIDocAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<RejectedGIDocumnet.TReq>(this.RequestVO);
            var res = new RejectedGIDocumnet().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
