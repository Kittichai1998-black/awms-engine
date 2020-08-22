using AWMSEngine.Controllers.V2;
using AWMSEngine.Engine.V2.PDFGenerator;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Report
{
    public class PrintPDFReportAPI : BaseAPIService
    {
        public PrintPDFReportAPI(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<PDFContentCriteria>(this.RequestVO);
            var res = new PrintPDFReport().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
