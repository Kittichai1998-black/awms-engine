using AMWUtil.Common;
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
        public PDFCreatorAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<PDFCreator.TReq>(this.RequestVO);
            var res = new PDFCreator().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
