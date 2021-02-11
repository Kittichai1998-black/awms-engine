using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;

namespace AWCSEngine.Worker
{
    public class ThreadWakeUpWorker
    {
        private static object lockWait;
        private static ThreadWakeUpWorker instant;
        public static ThreadWakeUpWorker GetInitial()
        {
            if(ThreadWakeUpWorker.instant == null)
            {
                instant = new ThreadWakeUpWorker();
            }
            return instant;
        }
        private ThreadWakeUpWorker()
        {
            this.ThreadWakeUps = new List<Thread>();
        }

        private List<Thread> ThreadWakeUps { get; set; }
        public void Initial(int count = 2)
        {
            if (this.ThreadWakeUps.Count > 0) return;
            for(int i = 0; i < count; i++)
            {
                var t = new Thread(Run);
                this.ThreadWakeUps.Add(t);
                t.Start();
            }
        }
        private void Run()
        {
            lock (lockWait)
            {
                int removeCount = this.ThreadWakeUps.RemoveAll(x => !x.IsAlive);
                for (int i = 0; i < removeCount; i++)
                {
                    var t = new Thread(Run);
                    this.ThreadWakeUps.Add(t);
                    t.Start();
                }

                ThreadCoreWorker.GetInstant().WakeUp();

                Thread.Sleep(5000);
            }
        }
    }
}
