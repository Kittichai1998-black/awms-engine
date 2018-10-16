﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.Business.Loading;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Doc
{
    public class CreateLDDocAPI : BaseAPIService
    {
        public CreateLDDocAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = ObjectUtil.DynamicToModel<CreateLDDocument.TDocReq>(this.RequestVO);
            var res = new CreateLDDocument().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
