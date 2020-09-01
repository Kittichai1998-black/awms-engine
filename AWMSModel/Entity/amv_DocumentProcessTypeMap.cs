
using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class amv_DocumentProcessTypeMap : ams_DocumentProcessType
    {
        public DocumentProcessTypeID DocumentProcessType_ID;
        public DocumentTypeID DocumentType_ID;
        public string ReProcessType_Name;
    }
}
