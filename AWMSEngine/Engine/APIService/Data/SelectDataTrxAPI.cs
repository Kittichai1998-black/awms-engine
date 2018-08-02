using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService.Data
{
    public class SelectDataTrxAPI : BaseAPIService
    {
        
        protected override dynamic ExecuteEngineManual()
        {
            var res1= new General.SelectSql().Execute(this.Logger, this.BuVO,
                new General.SelectSql.TReqModel()
                {
                    table_prefix = "amt_",
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
