using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine.Mc
{
    public class McCommon : BaseMcEngine
    {
        public McCommon(acs_McMaster mcMst) : base(mcMst)
        {
        }

        protected override bool OnIdle()
        {
            return false;
        }

        protected override bool OnCommand()
        {
            return true;
        }

        protected override bool OnWorking()
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
    }
}
