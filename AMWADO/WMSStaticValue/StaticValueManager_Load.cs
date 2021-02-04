using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
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
    }
}
