using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.Business;
using AWMSEngine.Engine.Business.Received;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Doc
{
    public class RejectedGRDocAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 44;
        }
        public RejectedGRDocAPI(ControllerBase controllerAPI) : base(controllerAPI)
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
