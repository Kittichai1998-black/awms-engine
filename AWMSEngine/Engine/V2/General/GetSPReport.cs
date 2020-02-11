using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.General
{
    public class GetSPReport : BaseEngine<Dictionary<string, string>, GetSPReport.TRes>
    {
        public class TRes
        {
            public dynamic datas;
        }
        protected override TRes ExecuteEngine(Dictionary<string, string> reqVO)
        {
            
            if (reqVO.ContainsKey("spnames"))
            {
                Dictionary<string, dynamic> datas = new Dictionary<string, dynamic>();
                var spnames = reqVO["spnames"].Split(',');
                foreach(var n in spnames)
                {
                    var spname = "RP_" + n;
                    Dapper.DynamicParameters parameters = new Dapper.DynamicParameters();
                    foreach(var key in reqVO.Keys)
                    {
                        if (!key.ToLower().Equals("spnames") &&
                            !key.ToLower().Equals("apikey") && !key.ToLower().Equals("_apikey") &&
                            !key.ToLower().Equals("token") && !key.ToLower().Equals("_token"))
                        {
                            parameters.Add(key, reqVO[key]);
                        }
                    }

                    datas.Add(n, ADO.DataADO.GetInstant().QuerySP(spname, parameters, this.BuVO));


                }
                TRes res = new TRes()
                {
                    datas = datas
                };
                return res;
            } 
            else
            {
                Dapper.DynamicParameters parameters = new Dapper.DynamicParameters();
                string spname = string.Empty;
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
}
