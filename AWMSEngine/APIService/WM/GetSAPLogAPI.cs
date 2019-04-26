using AMWUtil.Common;
using AWMSEngine.Engine.Business.Auditor;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.WM
{
    public class GetSAPLogAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 70;
        }
        public GetSAPLogAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            string options = "docID=" + this.RequestVO.docID;
            return ADO.DocumentADO.GetInstant().GetSAPResponse(options, this.BuVO);
        }
    }
}
