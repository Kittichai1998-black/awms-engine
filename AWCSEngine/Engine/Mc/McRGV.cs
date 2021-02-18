using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine.Mc
{
    public class McRGV : BaseMcEngine
    {
        public McRGV(acs_McMaster mcMst) : base(mcMst)
        {
        }

        protected override bool OnCommand()
        {
            return false;
        }

        protected override bool OnDone()
        {
            return false;
        }

        protected override bool OnError()
        {
            return false;
        }

        protected override bool OnIdle()
        {
            return false;
        }

        protected override bool OnWorking()
        {
            return false;
        }
    }
}
