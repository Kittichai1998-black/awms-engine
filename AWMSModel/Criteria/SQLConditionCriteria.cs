using AMWUtil.Common;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria.Attribute;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AMSModel.Criteria
{
    public class SQLConditionCriteria
    {
        public List<SQLConditionCriteria> whereGroups;
        public string field;
        public object value;
        public SQLOperatorType operatorType;
        public SQLConditionType conditionLeft;
        public SQLConditionCriteria(string field, object[] values, SQLOperatorType operatorType, SQLConditionType conditionLeft = SQLConditionType.NONE)
        {
            this.field = field;
            this.value = string.Join(',', values);
            this.operatorType = operatorType;
            this.conditionLeft = conditionLeft;
        }

        public SQLConditionCriteria(string field, object value, SQLOperatorType operatorType, SQLConditionType conditionLeft = SQLConditionType.NONE)
        {
            this.field = field;
            this.value = value;
            this.operatorType = operatorType;
            this.conditionLeft = conditionLeft;
        }
        public SQLConditionCriteria(string field, object value, string operatorType, string conditionLeft = null)
        {
            this.field = field;
            this.value = value;
            operatorType = operatorType == null ? string.Empty : operatorType.ToLower();
            conditionLeft = conditionLeft == null ? string.Empty : conditionLeft.ToLower();
            this.operatorType = AMWUtil.Common.EnumUtil.List<SQLOperatorType>()
                .FirstOrDefault(x => AttributeUtil.Attribute<ValueAttribute>(x).Value.ToLower() == operatorType);
                
            this.conditionLeft = AMWUtil.Common.EnumUtil.List<SQLConditionType>()
                .FirstOrDefault(x => AttributeUtil.Attribute<ValueAttribute>(x).Value.ToLower() == conditionLeft);
        }
        public SQLConditionCriteria(List<SQLConditionCriteria> whereGroups = null, string conditionLeft = null)
        {
            this.whereGroups = whereGroups;
            conditionLeft = conditionLeft == null ? string.Empty : conditionLeft.ToLower();

            this.conditionLeft = AMWUtil.Common.EnumUtil.List<SQLConditionType>()
                .FirstOrDefault(x => AttributeUtil.Attribute<ValueAttribute>(x).Value.ToLower() == conditionLeft);
        }
    }
}
