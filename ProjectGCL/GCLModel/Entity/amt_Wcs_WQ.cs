using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.GCLModel.Entity
{
    public class amt_Wcs_WQ : AMSModel.Entity.BaseEntityCreateModify
    {
        public string ApiRef;
        public long WmsRefID;
        public IOType IOType;
        public string LocCode;
        public string BaseCode;
        public string ActionResult;
        public EntityStatus ActionStatus;
    }
}
