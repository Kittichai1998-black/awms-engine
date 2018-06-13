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
        private string LogUriFormat { get; set; }
        private string LogFileFormat { get; set; }
        private string LogUri { get; set; }
        private string LogFileName { get; set; }
        
        private Dictionary<string, FileStream> FileStreamMap { get; set; }
        private List<AMWLogger> Loggers { get; set; }

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
            this.FileStreamMap = new Dictionary<string, FileStream>();
            this.Loggers = new List<AMWLogger>();
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
        public static AMWLogger GetLogger(string serviceName)
        {
            return GetLogger(Guid.NewGuid().ToString(), serviceName);
        }
        public static AMWLogger GetLogger(string refID, string serviceName)
        {
            lock (lockGetLogger)
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
                AMWLogger logger = null;
                if (logManager.FileStreamMap.ContainsKey(keyFile) && logManager.FileStreamMap[keyFile] != null && logManager.FileStreamMap[keyFile].CanWrite)
                {
                    var fileLogger = logManager.FileStreamMap[keyFile];
                    logger = new AMWLogger(fileLogger, refID, serviceName);
                }
                else
                {
                    logger = new AMWLogger(logManager.LogUri + logManager.LogFileName, refID, serviceName);
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
