using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Criteria
{
   public class STOCountDocLockCriteria
    {
        public int lockedPackQty;
        public int lockingPackQty;
        public int freePackQty;
        public int totalPackQty;
        public int targetPackQty;

        public int lockedUnitQty;
        public int lockingUnitQty;
        public int freeUnitQty;
        public int totalUnitQty;
        public int targetUnitQty;
    }
}
