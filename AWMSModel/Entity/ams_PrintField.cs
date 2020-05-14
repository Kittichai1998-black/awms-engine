using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class ams_PrintField : BaseEntityCreateModify
    {
        public long? PrintLayout_ID;
        public FieldType FieldType;
        public string FieldStyle;
        public string FieldClass;
        public int? FieldSeq;
        public string Value;
        public decimal? PageAreaTopCM;
        public decimal? PageAreaLeftCM;
    }
}
