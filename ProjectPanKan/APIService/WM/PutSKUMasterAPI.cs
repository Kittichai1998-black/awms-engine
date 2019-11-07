﻿using AWMSEngine.Engine.General;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using Microsoft.AspNetCore.Mvc;
using AWMSEngine.APIService;
using AWMSModel.Criteria;
using ProjectPanKan.Engine.Business;


namespace ProjectPanKan.APIService.WM
{
    public class PutSKUMasterAPI : BaseAPIService
    {
        public PutSKUMasterAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }


        protected override dynamic ExecuteEngineManual()
        {
            List<ams_SKUMaster> req1 = ObjectUtil.DynamicToModel<ams_SKUMaster>(this.RequestVO.data);
            this.BeginTransaction();
            var res = new PutMaster<ams_SKUMaster>().Execute(this.Logger, this.BuVO, new PutMaster<ams_SKUMaster>.TReq { datas = req1, whereFields = new List<string> { "ID" } });

            return res;
        }
    }
}
