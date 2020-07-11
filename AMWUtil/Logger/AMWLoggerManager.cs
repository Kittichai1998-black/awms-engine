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
        private List<KeyValuePair<string, AMWLogger>> AMWLoggers { get; set; }
        private string LogUriFormat { get; set; }
        private string LogFileFormat { get; set; }
        private string LogUri { get; set; }
        private string LogFile { get; set; }


        private static AMWLoggerManager instant;
        public static AMWLoggerManager InitInstant(string rootName, string fileName)
        {
            if (instant == null)
            {
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
            this.LogUriFormat = logUriFormat;
            this.LogFileFormat = logFileFormat;
            this.AMWLoggers = new List<KeyValuePair<string, AMWLogger>>();
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
        public static AMWLogger GetLogger(string serviceName)
        {
            return GetLogger(Guid.NewGuid().ToString(), serviceName);
        }
        public static AMWLogger GetLogger(string logName, dynamic serviceName)
        {
            return GetLogger(logName, serviceName.ToString());
        }
        public static AMWLogger GetLogger(string logName, string serviceName, bool isLogging = true)
        {
            AMWLoggerManager logManager = AMWLoggerManager.GetInstant();
            lock (logManager)
            {
                string logUriFormat = logManager.LogUriFormat;
                string logFileFormat = logManager.LogFileFormat;
                Dictionary<string, string> dicMapKey = new Dictionary<string, string>();
                dicMapKey.Add("{MachineName}", System.Environment.MachineName);
                dicMapKey.Add("{Date}", DateTime.Now.ToString("yyyyMMdd"));
                dicMapKey.Add("{LogName}", logName);
                dicMapKey.Add("{ServiceName}", serviceName);

                logManager.LogUri = logManager.LogUriFormat.EndsWith("/") || logUriFormat.EndsWith("\\") ? logUriFormat : logUriFormat + "/";
                foreach (Match m in Regex.Matches(logUriFormat, "{[^}]+}"))
                {
                    if (dicMapKey.ContainsKey(m.Value))
                        logManager.LogUri = logManager.LogUri.Replace(m.Value, dicMapKey[m.Value]);
                }
                logManager.LogFile = logFileFormat;
                foreach (Match m in Regex.Matches(logFileFormat, "{[^}]+}"))
                {
                    if (dicMapKey.ContainsKey(m.Value))
                        logManager.LogFile = logManager.LogFile.Replace(m.Value, dicMapKey[m.Value]);
                }

                if (!Directory.Exists(logManager.LogUri))
                    Directory.CreateDirectory(logManager.LogUri);


                string fileName = logManager.LogUri + logManager.LogFile;
                string key = DateTime.Now.Day + "," + fileName;
                if (logManager.AMWLoggers.Any(x => x.Key == key))
                {
                    return logManager.AMWLoggers.First(x => x.Key == key).Value;
                }
                else
                {
                    AMWLogger logger = new AMWLogger(fileName, serviceName, isLogging);
                    logManager.AMWLoggers.Add(new KeyValuePair<string, AMWLogger>(key, logger));
                    logManager.AMWLoggers.RemoveAll(x => !x.Key.StartsWith(DateTime.Now.Day + ","));
                    return logger;
                }

            }
        
        }

    }
}
