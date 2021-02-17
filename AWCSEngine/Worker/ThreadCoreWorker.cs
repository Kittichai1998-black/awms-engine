using ADO.WCSStaticValue;
using AMSModel.Entity;
using AMWUtil.Common;
using AWCSEngine.Worker.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;

namespace AWCSEngine.Worker
{
    public class ThreadCoreWorker
    {

        private List<McThread> McThreads { get; set; }
        private static ThreadCoreWorker instant;
        public static ThreadCoreWorker GetInstant()
        {
            if (ThreadCoreWorker.instant == null)
            {
                instant = new ThreadCoreWorker();
            }
            return instant;
        }
        private ThreadCoreWorker()
        {;
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

        private void Run(object _mcCore)
        {
            McThread mcCore = (McThread)_mcCore;
            while (true)
            {
                mcCore.McEngines.ForEach(mcEng =>
                {
                    mcEng.Runtime();
                });
                Thread.Sleep(200);
            }
        }

    }
}
