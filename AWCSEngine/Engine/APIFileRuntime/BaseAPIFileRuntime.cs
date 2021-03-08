using AMWUtil.Logger;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine.APIFileRuntime
{
    public abstract class BaseAPIFileRuntime : BaseEngine<dynamic, dynamic>
    {
        protected override string BaseLogName()
        {
            return "APIFile";
        }
        public BaseAPIFileRuntime(string logref) : base(logref) { }


    }
}
