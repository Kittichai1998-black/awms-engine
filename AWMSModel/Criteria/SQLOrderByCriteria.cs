using AMWUtil.Common;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria.Attribute;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Criteria
{
    public class SQLOrderByCriteria
    {
        public string field;
        public SQLOrderByType orderBy;
        public SQLOrderByCriteria(string field, SQLOrderByType orderBy)
        {
            this.field = field;
            this.orderBy = orderBy;
        }
        public SQLOrderByCriteria(string field, string orderBy)
        {
            this.field = field;
            this.orderBy = SQLOrderByType.DESC.Attribute<ValueAttribute>().Value == orderBy.ToUpper() ? SQLOrderByType.DESC : SQLOrderByType.ASC;
        }
    }
}
