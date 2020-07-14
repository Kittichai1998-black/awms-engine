using AMWUtil.Common;
using AWMSEngine.Controllers.V2;
using AWMSEngine.Engine.V2.PDFGenerator;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Report
{
    public class PDFCreatorAPI : BaseAPIService
    {
        public PDFCreatorAPI(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<PDFCreateTest.TReq>(this.RequestVO);
            var res = new PDFCreateTest().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
