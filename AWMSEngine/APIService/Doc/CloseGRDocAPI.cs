﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.Business.Received;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Doc
{
    public class CloseGRDocAPI : BaseAPIService
    {
        public CloseGRDocAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {

            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<ClosingDocument.TDocReq>(this.RequestVO);
            var res = new ClosingDocument().Execute(this.Logger, this.BuVO, req);
            this.CommitTransaction();
            //return res;

            this.BeginTransaction();
            var reqSAP = ObjectUtil.DynamicToModel<ClosedDocument.TDocReq>(this.RequestVO);
            var resSAP = new ClosedDocument().Execute(this.Logger, this.BuVO, reqSAP);
            return resSAP;
        }
    }
}
