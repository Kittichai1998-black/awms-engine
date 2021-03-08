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
        public act_BaseObject GetByID(long id, VOCriteria BuVO)
        {
            var baseObj = ADO.WCSDB.DataADO.GetInstant()
                .SelectBy<act_BaseObject>(
                new SQLConditionCriteria[] {
                    new SQLConditionCriteria("ID", id, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS)
                }, BuVO).FirstOrDefault();
            return baseObj;
        }
        public act_BaseObject GetByCode(string code, VOCriteria BuVO)
        {
            var baseObj = ADO.WCSDB.DataADO.GetInstant()
                .SelectBy<act_BaseObject>(
                new SQLConditionCriteria[] {
                    new SQLConditionCriteria("Code", code, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS)
                }, BuVO).FirstOrDefault();
            return baseObj;
        }
        public act_BaseObject GetByLocation(long loc_id, VOCriteria BuVO)
        {
            var baseObj = ADO.WCSDB.DataADO.GetInstant()
                .SelectBy<act_BaseObject>(
                new SQLConditionCriteria[] {
                    new SQLConditionCriteria("Location_ID", loc_id, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS)
                }, BuVO).FirstOrDefault();
            return baseObj;
        }
        public act_BaseObject GetByMcObject(long mc_id, VOCriteria BuVO)
        {
            var baseObj = ADO.WCSDB.DataADO.GetInstant()
                .SelectBy<act_BaseObject>(
                new SQLConditionCriteria[] {
                    new SQLConditionCriteria("McObject_ID", mc_id, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS)
                }, BuVO).FirstOrDefault();
            return baseObj;
        }
    }
}
