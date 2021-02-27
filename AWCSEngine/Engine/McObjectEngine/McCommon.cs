using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine.McObjectEngine
{
    public class McCommon : BaseMcEngine
    {
        public McCommon(acs_McMaster mcMst, string logref) : base(mcMst, logref)
        {
        }
        
        protected override void ExecuteChild_OnRuntime()
        {
        }

        protected override bool ExecuteChild_OnIdle()
        {
            return false;
        }

        protected override bool ExecuteChild_OnCommand()
        {
            return false;
        }

        protected override bool ExecuteChild_OnWorking()
        {
            //this.McObj.Location_ID = this.McObj.Des_Location_ID;
            return false;
        }

        protected override bool ExecuteChild_OnDone()
        {
            return false;
        }

        protected override bool ExecuteChild_OnError()
        {
            return false;
        }

    }
}
