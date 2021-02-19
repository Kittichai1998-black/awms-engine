using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine.McObjectEngine
{
    public class McCommon : BaseMcObjectEngine
    {
        public McCommon(acs_McMaster mcMst) : base(mcMst)
        {
        }

        protected override void Read_Plc2McWork_OnRun()
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
            this.McObject.Location_ID = this.McObject.Des_Location_ID;
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
