using AMWUtil.Common;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria.Attribute;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria
{
    public class SQLConditionCriteria
    {
        public string field;
        public object value;
        public SQLOperatorType operatorType;
        public SQLConditionType conditionLeft;
        public SQLConditionCriteria(string field, object value, SQLOperatorType operatorType, SQLConditionType conditionRight = SQLConditionType.NONE)
        {
            this.field = field;
            this.value = value;
            this.operatorType = operatorType;
            this.conditionLeft = conditionRight;
        }
        public SQLConditionCriteria(string field, object value, string operatorType, string conditionRight = null)
        {
            this.field = field;
            this.value = value;

            this.operatorType = SQLOperatorType.EQUALS.Attribute<ValueAttribute>().Value == operatorType.ToUpper() ? SQLOperatorType.EQUALS :
                SQLOperatorType.LESS.Attribute<ValueAttribute>().Value == operatorType.ToUpper() ? SQLOperatorType.LESS :
                SQLOperatorType.LESS_EQUALS.Attribute<ValueAttribute>().Value == operatorType.ToUpper() ? SQLOperatorType.LESS_EQUALS :
                SQLOperatorType.LIKE.Attribute<ValueAttribute>().Value == operatorType.ToUpper() ? SQLOperatorType.LIKE :
                SQLOperatorType.MORE.Attribute<ValueAttribute>().Value == operatorType.ToUpper() ? SQLOperatorType.MORE :
                SQLOperatorType.MORE_EQUALS.Attribute<ValueAttribute>().Value == operatorType.ToUpper() ? SQLOperatorType.MORE_EQUALS :
                0;
            this.conditionLeft = SQLConditionType.AND.Attribute<ValueAttribute>().Value == conditionRight ? SQLConditionType.AND :
                SQLConditionType.AND.Attribute<ValueAttribute>().Value == conditionRight ? SQLConditionType.OR :
                SQLConditionType.NONE;
        }
    }
}
