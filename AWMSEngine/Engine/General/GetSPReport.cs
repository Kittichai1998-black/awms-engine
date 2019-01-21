using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.General
{
    public class GetSPReport : BaseEngine<Dictionary<string, string>, GetSPReport.TRes>
    {
        public class TRes
        {
            public List<dynamic> datas;
        }
        protected override TRes ExecuteEngine(Dictionary<string, string> reqVO)
        {
            string spname = string.Empty;
            Dapper.DynamicParameters parameters = new Dapper.DynamicParameters();
            foreach (var key in reqVO.Keys)
            {
                if (key.ToLower().Equals("spname"))
                {
                    spname = "RP_" + reqVO[key];
                }
                else if (!key.ToLower().Equals("apikey") && !key.ToLower().Equals("_apikey") &&
                    !key.ToLower().Equals("token") && !key.ToLower().Equals("_token"))
                {
                    parameters.Add(key, reqVO[key]);
                }
            }
            TRes res = new TRes()
            {
                datas = ADO.DataADO.GetInstant().QuerySP(spname, parameters, this.BuVO)
            };
            return res;
        }
    }
}
