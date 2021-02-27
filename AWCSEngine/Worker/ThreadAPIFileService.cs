using ADO.WCSStaticValue;
using AMSModel.Constant.StringConst;
using AMWUtil.Common;
using AMWUtil.Logger;
using AMWUtil.PropertyFile;
using AWCSEngine.Controller;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;

namespace AWCSEngine.Worker
{
    public class ThreadAPIFileService : IThreadWorker
    {
        private readonly int DELAY_MS = PropertyFileManager.GetInstant().Get(PropertyConst.APP_KEY)[PropertyConst.APP_KEY_wk_api_dalay].Get2<int>();
        private readonly int THREAD_COUNT = PropertyFileManager.GetInstant().Get(PropertyConst.APP_KEY)[PropertyConst.APP_KEY_wk_bot_count].Get2<int>();
        
      
        //private AMWLogger Logger { get; set; }
        private List<Thread> Threads { get; set; }
        private static ThreadAPIFileService instant;
        public static ThreadAPIFileService GetInstant()
        {
            if (ThreadAPIFileService.instant == null)
            {
                instant = new ThreadAPIFileService();
            }
            return instant;
        }
        public void Initial()
        {

            var apis = StaticValueManager.GetInstant().APIFiles;
            apis.ForEach(x => {
                if (!Directory.Exists(x.DirIn))
                    Directory.CreateDirectory(x.DirIn);
                if (!Directory.Exists(x.DirOut))
                    Directory.CreateDirectory(x.DirOut);
            });
            this.Threads = new List<Thread>();
            for(int i = 0; i < this.THREAD_COUNT; i++)
            {
                var thread = new Thread(Run);
                thread.Start(null);
                this.Threads.Add(thread);
            }
        }

        private static object _lock_run = new object();
        public void Run(object _arg)
        {
            var apis = StaticValueManager.GetInstant().APIFiles;
            while (true)
            {
                lock (_lock_run)
                {
                    foreach(var api in apis)
                    {
                        var fileNames = Directory.GetFiles(api.DirIn, "*.json");
                        foreach (var fileName in fileNames)
                        {
                            AMWLogger logger = AMWLoggerManager.GetLogger("Threads", this.GetType().Name);

                            ///READ
                            string f = fileName.Split(new char[] { '\\', '/' }).Last();
                            string in_txt = File.ReadAllText(fileName, Encoding.UTF8);
                            string in_dir_archive = string.Format("{0}\\archive\\{1:ddMMyyyy}\\", api.DirIn, DateTime.Now);
                            if (!Directory.Exists(in_dir_archive))
                                Directory.CreateDirectory(in_dir_archive);
                            File.Move(fileName, in_dir_archive + f);
                            logger.LogInfo(string.Format("[READ] {0} | {1}", fileName, in_txt));

                            ///EXEC
                            dynamic in_json = in_txt.Json<dynamic>();
                            var out_json = CommonController.GetInstant().Execute(api.ID.Value, in_json, logger.LogRefID);

                            ///WRITE
                            string out_txt = ObjectUtil.Json(out_json);
                            File.WriteAllText(api.DirOut + "/" + f, out_txt, Encoding.UTF8);
                            logger.LogInfo(string.Format("[WRITE] {0} | {1}", fileName, in_txt));
                        }
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
