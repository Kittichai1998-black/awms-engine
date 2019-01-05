using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace AMWUtil.Logger
{
    public class AMWLoggerManager
    {
        public static List<KeyValuePair<string, string>> LogMessages = new List<KeyValuePair<string, string>>();
        public static List<KeyValuePair<string, string>> LogMessagesTMP = new List<KeyValuePair<string, string>>();
        public static object LogMessagesTMPLock = new object();

        private static Task LogTask = null;

        private string LogUriFormat { get; set; }
        private string LogFileFormat { get; set; }
        private string LogUri { get; set; }
        private string LogFileName { get; set; }

        //private Dictionary<string, FileStream> FileStreamMap { get; set; }
        //private List<AMWLogger> Loggers { get; set; }

        private static AMWLoggerManager instant;

        public static AMWLoggerManager InitInstant(string rootName, string fileName)
        {
            if (instant == null)
            {
                //rootName = "D:/logs/{MachineName}/{Date}/";
                //fileName = "{RefID}.{ServiceName}.{Date}.log";
                instant = new AMWLoggerManager(rootName, fileName);
                return instant;
            }
            throw new System.Exception("Double LoggerManager.InitInstant");
        }

        private static AMWLoggerManager GetInstant()
        {
            if (instant == null) throw new System.Exception("Not LoggerManager.InitInstant");
            return instant;
        }
        private AMWLoggerManager(string logUriFormat, string logFileFormat)
        {
            //this.FileStreamMap = new Dictionary<string, FileStream>();
            //this.Loggers = new List<AMWLogger>();
            this.LogUriFormat = logUriFormat;
            this.LogFileFormat = logFileFormat;
            this.RunWriteLog();
        }



        ///<summary>
        ///Format Name
        ///logUriFormat and logFileFormat Dynamic Values is
        ///{MachineName}, 
        ///{Date}, 
        ///{RefID}, 
        ///{ServiceName}
        ///</summary>
        ///
        private static object lockGetLogger = new object();
        public static AMWLogger GetLogger(string serviceName)
        {
            return GetLogger(Guid.NewGuid().ToString(), serviceName);
        }
        public static AMWLogger GetLogger(dynamic refID, dynamic serviceName)
        {
            return GetLogger(refID.ToString(), serviceName.ToString());
        }
        public static AMWLogger GetLogger(string refID, string serviceName)
        {
            AMWLoggerManager logManager = AMWLoggerManager.GetInstant();
            string logUriFormat = logManager.LogUriFormat;
            string logFileFormat = logManager.LogFileFormat;
            Dictionary<string, string> dicMapKey = new Dictionary<string, string>();
            dicMapKey.Add("{MachineName}", System.Environment.MachineName);
            dicMapKey.Add("{Date}", DateTime.Now.ToString("yyyyMMdd"));
            dicMapKey.Add("{RefID}", refID);
            dicMapKey.Add("{ServiceName}", serviceName);

            logManager.LogUri = logManager.LogUriFormat.EndsWith("/") || logUriFormat.EndsWith("\\") ? logUriFormat : logUriFormat + "/";
            foreach (Match m in Regex.Matches(logUriFormat, "{[^}]+}"))
            {
                if (dicMapKey.ContainsKey(m.Value))
                    logManager.LogUri = logManager.LogUri.Replace(m.Value, dicMapKey[m.Value]);
            }
            logManager.LogFileName = logFileFormat;
            foreach (Match m in Regex.Matches(logFileFormat, "{[^}]+}"))
            {
                if (dicMapKey.ContainsKey(m.Value))
                    logManager.LogFileName = logManager.LogFileName.Replace(m.Value, dicMapKey[m.Value]);
            }

            if (!Directory.Exists(logManager.LogUri))
                Directory.CreateDirectory(logManager.LogUri);

            //logManager.ClearLogUnWrite();
            string keyFile = logManager.LogUri + logManager.LogFileName;
            AMWLogger logger = new AMWLogger(keyFile, refID, serviceName);
            return logger;

        }

        private void RunWriteLog()
        {
            if (LogTask == null || LogTask.IsCompleted)
            {
                LogTask = Task.Run(() =>
                {
                    while (true)
                    {
                        for (KeyValuePair<string, string>? msg = LogMessages.FirstOrDefault();
                                msg.HasValue && msg.Value.Key != null;)
                        {
                            using (var fw = new StreamWriter(msg.Value.Key, true))
                            {
                                fw.WriteLine(msg.Value.Value);
                                fw.Flush();
                            }
                            LogMessages.RemoveAt(0);
                            msg = LogMessages.FirstOrDefault();
                        }
                        Thread.Sleep(200);
                        lock (LogMessagesTMPLock)
                        {
                            if (LogMessagesTMP.Count() > 0)
                            {
                                LogMessages = LogMessagesTMP;
                                //LogMessages.AddRange(LogMessagesTMP);
                                LogMessagesTMP = new List<KeyValuePair<string, string>>();
                            }
                        }
                    }

                });
            }
        }

    }
}
