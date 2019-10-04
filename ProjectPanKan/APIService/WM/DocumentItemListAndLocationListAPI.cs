using AMWUtil.Common;
using AWMSEngine.APIService;
using AWMSModel.Criteria;
using Microsoft.AspNetCore.Mvc;
using ProjectPanKan.Engine.Business;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectPanKan.APIService.WM
{
    public class DocumentItemListAndLocationListAPI : BaseAPIService
    {
        public DocumentItemListAndLocationListAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            long docID = this.RequestVO.docID;
            var res = new DocumentItemListAndLocationList().Execute(this.Logger, this.BuVO, docID);
            return res;
        }
    }
}
