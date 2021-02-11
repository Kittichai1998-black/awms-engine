using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine
{
    public class McCommon : BaseMcEngine
    {
        public McCommon(acs_McMaster mcMst) : base(mcMst)
        {
        }

        protected override void ExecuteChild(act_McWork mcObj)
        {


        }
    }
}
