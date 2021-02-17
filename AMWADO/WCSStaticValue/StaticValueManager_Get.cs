using AMWUtil.Common;
using AMWUtil.Exception;
using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace ADO.WCSStaticValue
{
    public partial class StaticValueManager
    {
        public string GetConfigValue(string key)
        {
            return this.Configs.First(x => x.DataKey == key).DataValue;
        }
        public acs_Config GetConfig(string key)
        {
            return this.Configs.FirstOrDefault(x => x.DataKey == key);
        }
        public acs_McMaster GetMcMaster(string code)
        {
            return this.McMasters.FirstOrDefault(x => x.Code == code);
        }
        public acs_McRegistry GetMcRegistry(string key)
        {
            return this.McRegistrys.FirstOrDefault(x => x.DataKey == key);
        }
        public acs_Location GetLocation(long id)
        {
            return this.Locations.FirstOrDefault(x => x.ID == id);
        }
    }
}
