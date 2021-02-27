using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AWCSEngine.Controller;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine.McWorkEngine
{
    public class WorkTest : BaseMcWorkEngine
    {
        public WorkTest(string logref) : base(logref)
        {
        }

        protected override NullCriteria ExecuteChild(NullCriteria request)
        {
            return null;
        }
    }
}
