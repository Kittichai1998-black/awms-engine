﻿using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using AWMSEngine.Common;
using AMWUtil.Common;
using Microsoft.AspNetCore.Mvc;
using AWMSEngine.Engine.General;

namespace AWMSEngine.APIService.Data
{
    public class InsUpdDataAPI : BaseAPIService
    {
        public InsUpdDataAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            object x = 1;

            var res1 = new InsertSql().Execute(this.Logger, this.BuVO,
                new InsertSql.TReqModel()
                {
                    datas = this.RequestVO.datas,
                    nr = this.RequestVO.nr,
                    pk = this.RequestVO.pk,
                    t = this.RequestVO.t
                });

            return res1;
        }
    }
}