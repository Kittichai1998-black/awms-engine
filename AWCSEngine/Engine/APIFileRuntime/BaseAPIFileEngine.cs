using AMWUtil.Logger;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine.APIFileRuntime
{
    public abstract class BaseAPIFileEngine<TReq, TRes> : BaseEngine<TReq, TRes>
        where TRes : class, new()
    {

        protected override string BaseLogName()
        {
            return "APIFile";
        }
        public BaseAPIFileEngine(string logref) : base(logref) { }


    }
}
