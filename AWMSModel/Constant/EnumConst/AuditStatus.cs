using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Constant.EnumConst
{
    public enum AuditStatus
    {
        QUARANTINE = 0,
        PASSED = 1,
        REJECTED = 2,
        NOTPASS = 3,
        QI = 4, //GCL, DOH
        ACC = 5, //GCL
        ACD = 6,//GCL
        ACN = 7,//GCL
        ACM = 8,//GCL
        HOLD = 9,
        BLOCK = 10,//DOH
        UR = 11//DOH
    }
}
