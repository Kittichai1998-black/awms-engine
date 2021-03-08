using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine.McRuntime
{
    public class McSrmCommon : BaseMcRuntime
    {
        public McSrmCommon(acs_McMaster mcMst) : base(mcMst)
        {
        }

        protected override void OnRun()
        {
            if(this.McObj.DV_Pre_Status == 90)
            {
                if(this.McWork4Work != null)
                {
                   // this.McWork4Work.Des_
                }
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
