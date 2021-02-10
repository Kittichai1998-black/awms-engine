using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ADO.WCSStaticValue
{
    public partial class StaticValueManager
    {
        public List<acs_Config> LoadConfig(VOCriteria buVO = null)
        {
            return this._Configs = ADO.WCSDB.DataADO.GetInstant().SelectBy<acs_Config>("status", 1, buVO ?? new VOCriteria());
        }
        public List<acs_McMaster> LoadMcMaster(VOCriteria buVO = null)
        {
            return this._McMasters = ADO.WCSDB.DataADO.GetInstant().SelectBy<acs_McMaster>("status", 1, buVO ?? new VOCriteria());
        }
        public List<acs_McRegistry> LoadMcRegistry(VOCriteria buVO = null)
        {
            return this._McRegistrys = ADO.WCSDB.DataADO.GetInstant().SelectBy<acs_McRegistry>("status", 1, buVO ?? new VOCriteria());
        }
    }
}
