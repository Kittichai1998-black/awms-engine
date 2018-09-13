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
    public class SelectDataViwAPI : BaseAPIService
    {
        public SelectDataViwAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var res1= new SelectSql().Execute(this.Logger, this.BuVO,
                new SelectSql.TReqModel()
                {
                    table_prefix = "amv_",
                    t = this.RequestVO.t,
                    ft = this.RequestVO.ft,
                    f = this.RequestVO.f,
                    g= this.RequestVO.g,
                    l= this.RequestVO.l,
                    q = this.RequestVO.q,
                    s = this.RequestVO.s,
                    sk = this.RequestVO.sk
                });

            return res1;
        }
    }
}
