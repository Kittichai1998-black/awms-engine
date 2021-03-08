using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine.McRuntime
{
    public class McShuCommon : BaseMcRuntime
    {
        public McShuCommon(acs_McMaster mcMst) : base(mcMst)
        {
        }

        protected override void OnRun()
        {
            if(this.McObj.DV_Pre_Zone == 1)
            {
                var oldLoc = StaticValue.GetLocation(this.Cur_Location.ID.Value);
                this.McObj.Cur_Location_ID = 0;
            }
        }

        protected override bool OnRun_COMMAND()
        {
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

        protected override bool OnRun_IDLE()
        {
            return false;
        }

        protected override bool OnRun_WORKING()
        {
            return false;
        }
    }
}
