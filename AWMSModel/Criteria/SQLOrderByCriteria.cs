using AMWUtil.Common;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria.Attribute;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria
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
            this.orderBy = SQLOrderByType.DESC.Attribute<ValueAttribute>().Value == orderBy ? SQLOrderByType.DESC : SQLOrderByType.ASC;
        }
    }
}
