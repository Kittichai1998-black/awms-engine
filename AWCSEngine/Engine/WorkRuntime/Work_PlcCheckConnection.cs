using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;

namespace AWCSEngine.Engine.WorkRuntime
{
    public class Work_PlcCheckConnection : BaseWorkRuntime
    {
        public Work_PlcCheckConnection(string logref) : base(logref)
        {
        }

        protected override void OnStart()
        {
        }

        protected override void OnRun()
        {
            /* foreach(var plc in ADO.WCSPLC.PlcKepwareV6ADO.ListInstant())
             {
                 if (plc.IsCheckCCONN)
                 {
                     int icheck = plc.GetDevice<int>("CCONN_READ");
                     plc.SetDevice<int>("CCONN_WRITE", icheck);
                 }
             }*/

            var i = ADO.WCSPLC.PlcKepwareV6ADO.GetInstant("WH08.PLC#45").GetDevice<int>("CCONN_READ");
            ADO.WCSPLC.PlcKepwareV6ADO.GetInstant("WH08.PLC#45").SetDevice<int>("CCONN_WRITE", i);
        }

        protected override void OnStop()
        {
        }
    }
}
