using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
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
