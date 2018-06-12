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
    public class LoggerManager
    {
        private string LogUriFormat { get; set; }
        private string LogFileFormat { get; set; }
        private string LogUri { get; set; }
        private string LogFileName { get; set; }
        
        private Dictionary<string, FileStream> FileStreamMap { get; set; }
        private List<Logger> Loggers { get; set; }

        private static LoggerManager instant;

        public static LoggerManager InitInstant(string rootName= "D:/logs/unittest/", string fileName = "{RefID}.{ServiceName}.{Date}.log")
        {
            if (instant == null)
            {
                //rootName = "D:/logs/{MachineName}/{Date}/";
                //fileName = "{RefID}.{ServiceName}.{Date}.log";
                instant = new LoggerManager(rootName, fileName);
                return instant;
            }
            throw new System.Exception("Double LoggerManager.InitInstant");
        }

        private static LoggerManager GetInstant()
        {
            if (instant == null) throw new System.Exception("Not LoggerManager.InitInstant");
            return instant;
        }
        private LoggerManager(string logUriFormat, string logFileFormat)
        {
            this.FileStreamMap = new Dictionary<string, FileStream>();
            this.Loggers = new List<Logger>();
            this.LogUriFormat = logUriFormat;
            this.LogFileFormat = logFileFormat;
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
        public static Logger GetLogger(string serviceName)
        {
            return GetLogger(Guid.NewGuid().ToString(), serviceName);
        }
        public static Logger GetLogger(string refID, string serviceName)
        {
            lock (lockGetLogger)
            {
                LoggerManager logManager = LoggerManager.GetInstant();
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
                Logger logger = null;
                if (logManager.FileStreamMap.ContainsKey(keyFile) && logManager.FileStreamMap[keyFile] != null && logManager.FileStreamMap[keyFile].CanWrite)
                {
                    var fileLogger = logManager.FileStreamMap[keyFile];
                    logger = new Logger(fileLogger, refID, serviceName);
                }
                else
                {
                    logger = new Logger(logManager.LogUri + logManager.LogFileName, refID, serviceName);
                    if (logManager.FileStreamMap.ContainsKey(keyFile)) logManager.FileStreamMap.Remove(keyFile);
                    logManager.FileStreamMap.Add(keyFile, logger.FileLogger);
                }
                logManager.Loggers.Add(logger);
                return logger;
            }
        }
        private void ClearLogUnWrite()
        {
            this.Loggers.RemoveAll(x => x == null);

            string[] keyMaps = this.FileStreamMap.Keys.ToArray();
            foreach (string keyMap in keyMaps)
            {
                if (this.FileStreamMap[keyMap] == null || 
                    !this.FileStreamMap[keyMap].CanWrite ||
                    !this.Loggers.Any(x => x.FileLogger.Name == this.FileStreamMap[keyMap].Name))
                {
                    if(this.FileStreamMap[keyMap] != null)
                        this.FileStreamMap[keyMap].Dispose();
                    this.FileStreamMap.Remove(keyMap);
                }
            }
        }


    }
}
