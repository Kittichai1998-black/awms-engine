using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AWCSEngine.Engine.McRuntime
{
    public class McSRM12 : BaseMcRuntime
    {
        protected override McTypeEnum McType => McTypeEnum.SRM;

        public McSRM12(acs_McMaster mcMst) : base(mcMst)
        {
        }

        protected override void OnStart()
        {

        }

        protected override void OnRun()
        {
        }

        protected override void OnEnd()
        {
        }
    }
}
