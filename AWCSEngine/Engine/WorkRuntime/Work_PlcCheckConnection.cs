using System;
using System.Collections.Generic;
using System.Linq;
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

        private class CheckConnect
        {
            public string PLCName;
            public int CCONN_READ;
            public DateTime LastChange;
        }
        private List<CheckConnect> CheckConnects = new List<CheckConnect>();
        protected override void OnRun()
        {
             foreach(var plc in ADO.WCSPLC.PlcKepwareV6ADO.ListInstant())
             {
                 if (plc.IsCheckCCONN)
                {
                    var checkConn = CheckConnects.FirstOrDefault(x => x.PLCName == plc.PlcDeviceName);
                    if(checkConn == null)
                    {
                        checkConn = new CheckConnect() { PLCName = plc.PlcDeviceName, CCONN_READ = 0, LastChange = DateTime.Now };
                        this.CheckConnects.Add(checkConn);
                    }
                    int icheck = plc.GetDevice<int>("CCONN_READ");
                    if(checkConn.CCONN_READ != icheck)
                    {
                        plc.SetDevice<int>("CCONN_WRITE", icheck);
                        checkConn.CCONN_READ = icheck;
                        checkConn.LastChange = DateTime.Now;
                        plc.IsConnect = true;
                    }
                    else if((DateTime.Now - checkConn.LastChange).Seconds > 5)
                    {
                        plc.IsConnect = false;
                    }
                 }
             }

            //var i = ADO.WCSPLC.PlcKepwareV6ADO.GetInstant("WH08.PLC#45").GetDevice<int>("CCONN_READ");
            //ADO.WCSPLC.PlcKepwareV6ADO.GetInstant("WH08.PLC#45").SetDevice<int>("CCONN_WRITE", i);
        }

        protected override void OnStop()
        {
        }
    }
}
