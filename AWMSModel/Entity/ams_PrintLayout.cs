using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class ams_PrintLayout : BaseEntityCreateModify
    {
        public long? PrintForm_ID;
        public PrintLayoutType PrintLayoutType;
        public string LayoutClass;
        public int? PageSeq;
        public decimal? PageTopCM;
        public decimal? PageLeftCM;
        public decimal? PageHeightCM;
    }
}
