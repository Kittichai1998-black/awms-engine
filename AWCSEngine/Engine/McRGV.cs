using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine
{
    public class McRGV : BaseMcEngine
    {
        public McRGV(acs_McMaster mcMst) : base(mcMst)
        {
        }

        protected override void ExecuteChild(act_McObject mcObj)
        {
            throw new NotImplementedException();
        }
    }
}
