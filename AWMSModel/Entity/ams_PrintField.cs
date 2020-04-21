using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class ams_PrintField : BaseEntitySTD
    {
        public long? PrintLayout_ID;
        public FieldType FieldType;
        public string FieldStyle;
        public string Value;
        public decimal? PageAreaTopCM;
        public decimal? PageAreaLeftCM;
    }
}
