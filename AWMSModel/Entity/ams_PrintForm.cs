using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class ams_PrintForm : BaseEntitySTD
    {
        public string MainStyle;
        public decimal? PaperWidthCM;
        public decimal? PaperHeightCM;
        public decimal? PageWidthCM;
        public decimal? PageHeightCM;
        public decimal? PageMarginCM;
        public decimal? PagePaddingCM;
    }
}
