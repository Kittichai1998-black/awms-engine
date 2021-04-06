using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.DataAccess.Http;
using AWCSEngine.Engine.McRuntime;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AWCSEngine.Engine.WorkRuntime
{
    public class OutboundWorkEngine : BaseWorkRuntime
    {
        public OutboundWorkEngine(string logref) : base(logref)
        {
        }

        protected override void OnRun()
        {
            this.OnRun_Outbound_Process();
        }

        private void OnRun_Outbound_Process()
        {
            CallStoreOutbound.GetInstant().SP_PROCESSOUTBOUND();


        }  
             
        protected override void OnStart()
        {
            
        }

        protected override void OnStop()
        {
             
        }
    }
}
