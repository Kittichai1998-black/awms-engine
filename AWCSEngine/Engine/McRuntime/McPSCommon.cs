using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine.McRuntime
{
    public class McPSCommon : BaseMcRuntime
    {
        public McPSCommon(acs_McMaster mcMst) : base(mcMst)
        {
        }
        
        protected override void OnRun()
        {
            if(this.McObj.DV_Pre_Status == 88)
            {
                this.PostCommand(McCommandType.CM_88);
            }
        }
        protected override void OnStart()
        {
        }
        protected override void OnEnd()
        {
        }

    }
}
