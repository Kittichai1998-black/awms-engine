using AMSModel.Criteria;
using AMWUtil.Logger;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine.CommonEngine
{
    public abstract class BaseCommonEngine<TReq, TRes> : BaseEngine<TReq, TRes>
        where TRes : class, new()
    {

        protected override string BaseLogName()
        {
            return "Common";
        }
        public BaseCommonEngine(string logref, VOCriteria buVO) : base(logref,buVO) { }
    }
}
