using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine.McRuntime
{
    public class McCommon : BaseMcRuntime
    {
        public McCommon(acs_McMaster mcMst) : base(mcMst)
        {
        }
        
        protected override void OnRun()
        {
        }

        protected override bool OnRun_IDLE()
        {
            return false;
        }

        protected override bool OnRun_COMMAND()
        {
            return false;
        }

        protected override bool OnRun_WORKING()
        {
            //this.McObj.Location_ID = this.McObj.Des_Location_ID;
            return false;
        }

        protected override bool OnRun_DONE()
        {
            return false;
        }

        protected override bool OnRun_ERROR()
        {
            return false;
        }

    }
}
