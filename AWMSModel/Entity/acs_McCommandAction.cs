using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class acs_McCommandAction : BaseEntityCreateModify
    {
        public long McCommand_ID;
        public int Seq;
        public string DKV_Condition;
        public string DKV_Set;
    }
}
