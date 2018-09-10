using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.Business;
using AWMSEngine.Engine.Business.Issued;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Engine.APIService.Doc
{
    public class GIDocRejectAPI : BaseAPIService
    {
        public GIDocRejectAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<GIDocRejected.TDocReq>(this.RequestVO);
            var res = new GIDocRejected().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
