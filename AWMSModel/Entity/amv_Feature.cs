using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class amv_Feature : ams_Feature
    {
        public DocumentProcessTypeID? DocumentProcessType_ID;
        public DocumentTypeID? DocumentType_ID;
    }
}
