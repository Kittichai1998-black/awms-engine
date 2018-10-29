﻿using AMWUtil.Common;
using AWMSEngine.Engine.General;
using AWMSModel.Criteria.SP.Request;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.UI
{
    public class SearchStorageObjectAPI : BaseAPIService
    {
        public SearchStorageObjectAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = ObjectUtil.DynamicToModel<SPInSTOSearchCriteria>(this.RequestVO);
            var res = new SearchStorageObject().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
