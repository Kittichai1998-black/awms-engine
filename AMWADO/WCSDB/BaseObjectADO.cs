using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ADO.WCSDB
{
    public class BaseObjectADO : BaseWCSDB<BaseObjectADO>
    {
        public act_BaseObject GetByCode(string code, VOCriteria BuVO)
        {
            var baseObj = ADO.WCSDB.DataADO.GetInstant()
                .SelectBy<act_BaseObject>(
                new SQLConditionCriteria[] {
                    new SQLConditionCriteria("Code", code, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status", 1, SQLOperatorType.EQUALS)
                }, BuVO).FirstOrDefault();
            return baseObj;
        }
    }
}
