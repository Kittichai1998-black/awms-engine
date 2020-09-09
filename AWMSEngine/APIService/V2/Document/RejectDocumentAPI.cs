﻿using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business.Document;
using AWMSEngine.Engine.V2.Business.Received;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Document
{
    public class RejectDocumentAPI : BaseAPIService
    {
        public RejectDocumentAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req= ObjectUtil.DynamicToModel<RejectDocument.TReq>(this.RequestVO);
            var res = new RejectDocument().Execute(this.Logger,this.BuVO,req);
            return res;
        }
    }
}
