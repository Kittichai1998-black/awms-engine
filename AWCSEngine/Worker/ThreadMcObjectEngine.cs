using ADO.WCSStaticValue;
using AMSModel.Constant.StringConst;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.PropertyFile;
using AWCSEngine.Worker.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;

namespace AWCSEngine.Worker
{
    public class ThreadMcObjectEngine : IThreadWorker
    {
        private int DELAY_MS = PropertyFileManager.GetInstant().Get(PropertyConst.APP_KEY)[PropertyConst.APP_KEY_wk_engine_dalay].Get2<int>();

        private List<McThread> McThreads { get; set; }
        private static ThreadMcObjectEngine instant;
        public static ThreadMcObjectEngine GetInstant()
        {
            if (ThreadMcObjectEngine.instant == null)
            {
                instant = new ThreadMcObjectEngine();
            }
            return instant;
        }
        private ThreadMcObjectEngine()
        {
            this.McThreads = new List<McThread>();
        }

        public void Initial()
        {
            ADO.WCSStaticValue.StaticValueManager.GetInstant().McMasters.ForEach(x=>
            {
                this.AddMcMst2McThread(x.ThreadIndex, x);
            });
        }

        public void WakeUpAll()
        {
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
                mcCore = new McThread(index);
                this.McThreads.Add(mcCore);
            }

            mcCore.AddMc(mcMst);
        }

        public void Run(object _mcCore)
        {
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

    }
}
