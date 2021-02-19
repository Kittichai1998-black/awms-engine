using ADO.WCSStaticValue;
using AMSModel.Constant.StringConst;
using AMWUtil.Common;
using AMWUtil.Logger;
using AMWUtil.PropertyFile;
using AWCSEngine.Controller;
using AWCSEngine.Engine.McAPIEngine;
using AWCSEngine.Engine.McWorkEngine;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;

namespace AWCSEngine.Worker
{
    public class ThreadMcWorkService : IThreadWorker
    {
        private readonly int DELAY_MS = PropertyFileManager.GetInstant().Get(PropertyConst.APP_KEY)[PropertyConst.APP_KEY_wk_bot_dalay].Get<int>();
        private readonly int THREAD_COUNT = PropertyFileManager.GetInstant().Get(PropertyConst.APP_KEY)[PropertyConst.APP_KEY_wk_bot_count].Get<int>();

        private List<Thread> Threads { get; set; }
        private static ThreadMcWorkService instant;
        public static ThreadMcWorkService GetInstant()
        {
            if (ThreadMcWorkService.instant == null)
            {
                instant = new ThreadMcWorkService();
            }
            return instant;
        }
        private ThreadMcWorkService()
        {
            this.Threads = new List<Thread>();
        }


        public void Initial()
        {
            this.Threads = new List<Thread>();
            for (int i = 0; i < this.THREAD_COUNT; i++)
            {
                var thread = new Thread(Run);
                thread.Start(null);
                this.Threads.Add(thread);
            }
        }

        private static object _lock_run = new object();
        public void Run(object _arg)
        {
            var works = StaticValueManager.GetInstant().BotService;
            List<BaseMcWorkEngine> mcWorkEngines = new List<BaseMcWorkEngine>();
            foreach(var work in works)
            {
                var ctype = ClassType.GetClassType(work.FullClassName);
                var exec = (BaseMcWorkEngine)Activator.CreateInstance(ctype);
                mcWorkEngines.Add(exec);
            }
            while (true)
            {
                lock (_lock_run)
                {
                    foreach (var mcWork in mcWorkEngines)
                    {
                        mcWork.Execute();
                    }
                    Thread.Sleep(this.DELAY_MS);
                }
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
    }
}
