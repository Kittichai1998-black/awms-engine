using AMSModel.Constant.StringConst;
using AMWUtil.Common;
using AMWUtil.PropertyFile;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;

namespace AWCSEngine.Worker
{
    public class ThreadWakeUp : IThreadWorker
    {
        private int DELAY_MS = PropertyFileManager.GetInstant().Get(PropertyConst.APP_KEY)[PropertyConst.APP_KEY_wk_wakeup_delay].Get2<int>();
        private int THREAD_COUNT = PropertyFileManager.GetInstant().Get(PropertyConst.APP_KEY)[PropertyConst.APP_KEY_wk_wakeup_count].Get2<int>();
        
        private static object lockWait=new object();
        private static ThreadWakeUp instant;
        public static ThreadWakeUp GetInitial()
        {
            if(ThreadWakeUp.instant == null)
            {
                instant = new ThreadWakeUp();
            }
            return instant;
        }
        private ThreadWakeUp()
        {
            this.Threads = new List<Thread>();
        }

        private List<Thread> Threads { get; set; }
        public void Initial()
        {
            if (this.Threads.Count > 0) return;
            for(int i = 0; i < this.THREAD_COUNT; i++)
            {
                var t = new Thread(Run);
                this.Threads.Add(t);
                t.Start(null);
            }
        }

        public void WakeUpAll()
        {
            for (int i = 0; i < this.Threads.Count; i++)
            {
                if (this.Threads[i] == null || !this.Threads[i].IsAlive)
                {
                    this.Threads[i] = new Thread(Run);
                    this.Threads[i].Start(null);
                }
            }
        }

        public void Run(object _arg)
        {
            while (true)
            {
                lock (lockWait)
                {
                    ThreadMcRuntime.GetInstant().WakeUpAll();
                    ThreadWorkRuntime.GetInstant().WakeUpAll();
                    ThreadAPIFileRuntime.GetInstant().WakeUpAll();
                    this.WakeUpAll();
                    Thread.Sleep(this.DELAY_MS);
                }
            }
        }
    }
}
