using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;

namespace AWCSEngine.Engine.WorkRuntime
{
    public class PlcCheckConnectionRuntime : BaseWorkRuntime
    {
        public PlcCheckConnectionRuntime(string logref) : base(logref)
        {
        }

        protected override void OnStart()
        {
        }

        protected override void OnRun()
        {
            int icheck = ADO.WCSPLC.PlcKepwareV6ADO.GetInstant("WH08.PLC#45").GetDevice<int>("CCONN_READ");
            ADO.WCSPLC.PlcKepwareV6ADO.GetInstant("WH08.PLC#45").SetDevice<int>("CCONN_WRITE",icheck);
        }

        protected override void OnStop()
        {
        }
    }
}
