﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService.WM
{
    public class GetMstSTOAPI : BaseAPIService
    {
        protected override dynamic ExecuteEngineManual()
        {
            var res = new Engine.Business.NewSTO().Execute(
                this.Logger, this.BuVO,
                new Business.NewSTO.TReqModel()
                {
                    //amount=1,
                    code=this.RequestVO.code,
                    options= new List<KeyValuePair<string, string>>()
                });
            return res;
        }
    }
}
