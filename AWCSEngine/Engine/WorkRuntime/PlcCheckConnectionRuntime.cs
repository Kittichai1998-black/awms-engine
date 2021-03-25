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
            foreach(var plc in ADO.WCSPLC.PlcKepwareV6ADO.ListInstant())
            {
                if (plc.IsCheckCCONN)
                {
                    int icheck = plc.GetDevice<int>("CCONN_READ");
                    plc.SetDevice<int>("CCONN_WRITE", icheck);
                }
            }
        }

        protected override void OnStop()
        {
        }
    }
}
