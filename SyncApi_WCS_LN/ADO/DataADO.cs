using AMWUtil.Logger;
using SyncApi_WCS_LN.Const;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace SyncApi_WCS_LN.ADO
{
    public class DataADO : AMWUtil.DataAccess.BaseDatabaseAccess
    {
        private static DataADO _instant { get; set; }
        public static DataADO GetInstant()
        {
            if (_instant == null)
                _instant = new DataADO();
            return _instant;
        }

        private DataADO() : base(ConfigADO.DatatbaseConfigs[ConfigString.KEY_DB_CONNECTIONSTRING])
        {
        }

        public List<T> Query<T>(string sp_name, AMWLogger logger, object parameters = null)
        {
            List<T> res = new List<T>();
            //Dapper.DynamicParameters p = parameters == null ? null : this.CreateDynamicParameters(parameters);
            if (parameters == null)
            {
                res.AddRange(this.Query<T>(sp_name, System.Data.CommandType.StoredProcedure, null, logger).ToList());
            }
            else
            {


                Dapper.DynamicParameters _parameters = new Dapper.DynamicParameters();
                using JsonDocument document = JsonDocument.Parse(parameters.ToString());

                JsonElement root = document.RootElement;
                if (root.ValueKind == JsonValueKind.Object)
                {
                    foreach (JsonProperty x in root.EnumerateObject())
                    {
                        string val;
                        if (x.Value.ValueKind == JsonValueKind.Number || x.Value.ValueKind == JsonValueKind.String)
                        {
                            val = x.Value.ToString();
                        }
                        else if (x.Value.ValueKind == JsonValueKind.Null)
                        {
                            val = "";
                        }
                        else
                        {
                            val = Newtonsoft.Json.JsonConvert.SerializeObject(x.Value);
                        }

                        _parameters.Add(x.Name, val);
                    }
                    res.AddRange(this.Query<T>(sp_name, System.Data.CommandType.StoredProcedure, _parameters, logger).ToList());
                }
                else
                {
                    foreach (JsonElement array in root.EnumerateArray())
                    {
                        foreach (JsonProperty x in array.EnumerateObject())
                        {
                            string val;
                            if (x.Value.ValueKind == JsonValueKind.Number || x.Value.ValueKind == JsonValueKind.String)
                            {
                                val = x.Value.ToString();
                            }
                            else if (x.Value.ValueKind == JsonValueKind.Null)
                            {
                                val = "";
                            }
                            else
                            {
                                val = Newtonsoft.Json.JsonConvert.SerializeObject(x.Value);
                            }

                            _parameters.Add(x.Name, val);
                        }
                        res.AddRange(this.Query<T>(sp_name, System.Data.CommandType.StoredProcedure, _parameters, logger).ToList());
                    }
                }
            }
            return res;
        }
    }
}
