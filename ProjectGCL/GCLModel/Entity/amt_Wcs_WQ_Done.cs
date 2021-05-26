using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.GCLModel.Entity
{
    public class amt_Wcs_WQ_Done : AMSModel.Entity.BaseEntityCreateModify
    {
        public string ApiRef;
        public long WmsRefID;
        public DocumentTypeID DocumentType_ID;
        public long Warehouse_ID;
        public string LocCode;
        public string BaseCode;
    }
}
