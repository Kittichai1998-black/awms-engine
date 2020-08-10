
using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class ams_DocumentProcessMap : BaseEntityCreateModify
    {
        public DocumentProcessTypeID DocumentProcessType_ID;
        public DocumentTypeID DocumentType_ID;
    }
}
