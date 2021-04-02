using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine.McRuntime
{
    public class McCommon : BaseMcRuntime
    {
        protected override McTypeEnum McType => McTypeEnum.NONE;

        public McCommon(acs_McMaster mcMst) : base(mcMst)
        {
        }
        
        protected override void OnRun()
        {
        }
        protected override void OnStart()
        {
        }
        protected override void OnEnd()
        {
        }

    }
}
