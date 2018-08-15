using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria
{
   public class STOCountDocLockCriteria
    {
        public int lockedPackQty;
        public int lockingPackQty;
        public int targetPackQty;
        public int invPackQty;
        public int freePackQty;

        public int lockedUnitQty;
        public int lockingUnitQty;
        public int targetUnitQty;
        public int invUnitQty;
        public int freeUnitQty;
    }
}
