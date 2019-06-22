using AWMSEngine.Engine.General;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.Data
{
    public class SelectDataErpAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 28;
        }
        public SelectDataErpAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var res1= new SelectSql().Execute(this.Logger, this.BuVO,
                new SelectSql.TReqModel()
                {
                    table_prefix = "ers_",
                    t = this.RequestVO.t,
                    ft = this.RequestVO.ft,
                    f = this.RequestVO.f,
                    g= this.RequestVO.g,
                    l= this.RequestVO.l,
                    q = this.RequestVO.q,
                    s = this.RequestVO.s,
                    sk = this.RequestVO.sk,
                    isCounts = this.RequestVO.isCounts
                });

            return res1;
        }
    }
}
