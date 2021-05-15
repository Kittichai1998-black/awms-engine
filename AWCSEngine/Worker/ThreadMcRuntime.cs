using ADO.WCSStaticValue;
using AMSModel.Constant.StringConst;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.PropertyFile;
using AWCSEngine.Controller;
using AWCSEngine.Worker.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;

namespace AWCSEngine.Worker
{
    public class ThreadMcRuntime : IThreadWorker
    {
        private int DELAY_MS = PropertyFileManager.GetInstant().Get(PropertyConst.APP_KEY)[PropertyConst.APP_KEY_wk_engine_dalay].Get2<int>();

        private List<McThread> McThreads { get; set; }
        private static ThreadMcRuntime instant;
        public static ThreadMcRuntime GetInstant()
        {
            if (ThreadMcRuntime.instant == null)
            {
                instant = new ThreadMcRuntime();
            }
            return instant;
        }
        private ThreadMcRuntime()
        {
            this.McThreads = new List<McThread>();
        }

        public void Initial()
        {
            //DisplayController.Events_Write("ThreadMcRuntime Initial");
            string pattle_codes = PropertyFileManager.GetInstant().Get(PropertyConst.APP_KEY)[PropertyConst.APP_KEY_machine_code_pattle];
            string[] fix_codes = PropertyFileManager.GetInstant().Get(PropertyConst.APP_KEY)[PropertyConst.APP_KEY_machine_code_fixed].Split(new char[] { ','});
            ADO.WCSStaticValue.StaticValueManager.GetInstant().McMasters.ForEach(x=>
            {
                //DisplayController.Events_Write("ThreadMcRuntime Initial" + x.Code);
                if ((!string.IsNullOrEmpty(pattle_codes) && Regex.IsMatch(x.Code, pattle_codes) ) || fix_codes.Contains(x.Code))
                    this.AddMcMst2McThread(x.ThreadIndex, x);
            });
        }

        public void WakeUpAll()
        {
           // DisplayController.Events_Write("System","McThread WakeUpAll");
            List<string> wakeUpNames = new List<string>();
            foreach (var tCore in this.McThreads)
            {
                tCore.WeekUpMcThread(Run);
            }
        }

        private void AddMcMst2McThread(int index, acs_McMaster mcMst)
        {
            McThread mcCore = this.McThreads.FirstOrDefault(x => x.Index == index);
            if (mcCore == null)
            {
                //DisplayController.Events_Write("ThreadMcRuntime AddMcMst2McThread");
                mcCore = new McThread(index);
                DisplayController.Events_Write("System","ThreadMcRuntime new McThread");
                this.McThreads.Add(mcCore);
                //DisplayController.Events_Write("ThreadMcRuntime AddMcMst2McThread McThreads add");
            }

            mcCore.AddMc(mcMst);
        }

        public void Run(object _mcCore)
        {
            //DisplayController.Events_Write("System","McThread Run");
            McThread mcCore = (McThread)_mcCore;
            while (true)
            {
                mcCore.McEngines.ForEach(mcEng =>
                {
                    mcEng.Execute(null);
                });
                Thread.Sleep(this.DELAY_MS);
            }
        }

        public void Abort()
        {
            DisplayController.Events_Write("System", "ThreadMcRuntime failed");
            if (this.McThreads != null)
            {
                this.McThreads.ForEach(x => { x.Abort(); });
            }
            
        }

    }
}
