using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine.WorkRuntime.PlcCheckConnectionRuntime
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
            int icheck = ADO.WCSPLC.PlcKepwareV6ADO.GetInstant("WH08.PLC#45").GetDevice<int>("CONN_READ");
            ADO.WCSPLC.PlcKepwareV6ADO.GetInstant("WH08.PLC#45").GetDevice<int>("CONN_WRITE");
        }

        protected override void OnStop()
        {
        }
    }
}
