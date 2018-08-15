﻿using AMWUtil.Common;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria.Attribute;
using System;
using System.Collections.Generic;
using System.Linq;
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
        public SQLConditionCriteria(string field, object value, string operatorType, string conditionLeft = null)
        {
            this.field = field;
            this.value = value;

            this.operatorType = AMWUtil.Common.EnumUtil.List<SQLOperatorType>()
                .FirstOrDefault(x => AttributeUtil.Attribute<ValueAttribute>(x).Value == operatorType);
                
            this.conditionLeft = AMWUtil.Common.EnumUtil.List<SQLConditionType>()
                .FirstOrDefault(x => AttributeUtil.Attribute<ValueAttribute>(x).Value == conditionLeft);
        }
    }
}