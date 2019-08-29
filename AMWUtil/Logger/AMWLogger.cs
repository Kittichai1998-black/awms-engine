using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace AMWUtil.Logger
{
    public class AMWLogger : IDisposable, ILogger
    {
        //public FileStream FileLogger { get; set; }
        private string _LogRefID;
        public string LogRefID { get { return this._LogRefID; } }
        private string _LogName;
        public string ServiceRefID { get { return _LogName; } }
        public string SubServiceName { get; set; }
        private string _ServiceName { get; set; }
        private string _FileName { get; set; }
        private StackTrace _StackTrace;

        
        public AMWLogger(string fileName, string logName, string serviceName)
        {
            this._LogRefID = AMWUtil.Common.ObjectUtil.GenUniqID();  //Guid.NewGuid().ToString("N");
            this._LogName = logName;
            this._ServiceName = serviceName;
            this._FileName = fileName;
            //this.FileLogger = File.Open(fileName, FileMode.Append, FileAccess.Write, FileShare.Read);
            //this.UpdateLastUse();
            //this.LogBeginTransaction();
        }
        



        public void LogWrite(string logLV, string message, [CallerFilePath]string sourceFile = "", [CallerLineNumber]int lineNumber = 0)
        {
            this._StackTrace = new StackTrace();
            message = string.Format("{0:HH:mm:ss.fff} [{1}] [{2}] {3}/{4}({5}) >> {6}",
                                        DateTime.Now,
                                        this.LogRefID,
                                        logLV,
                                        string.IsNullOrWhiteSpace(this.SubServiceName) ? this._ServiceName : this.SubServiceName,
                                        sourceFile.Split('\\').Last(),
                                        lineNumber,
                                        message.Replace("\r", string.Empty).Replace("\n", @"\n"));
            lock (AMWLoggerManager.LogMessagesTMPLock)
            {
                AMWLoggerManager.LogMessagesTMP.Add(new KeyValuePair<string, string>(this._FileName, message));
            }

            
        }

        public void LogAll(string message, [CallerFilePath]string sourceFile = "", [CallerLineNumber]int lineNumber = 0)
        {
            this.LogWrite("ALL" , message, sourceFile, lineNumber);
        }
        public void LogInfo(string message, [CallerFilePath]string sourceFile = "", [CallerLineNumber]int lineNumber = 0)
        {
            this.LogWrite("INFO" ,message, sourceFile, lineNumber);
        }
        public void LogDebug(string message, [CallerFilePath]string sourceFile = "", [CallerLineNumber]int lineNumber = 0)
        {
            this.LogWrite("DEBUG", message, sourceFile, lineNumber);
        }
        public void LogError(string message, [CallerFilePath]string sourceFile = "", [CallerLineNumber]int lineNumber = 0)
        {
            this.LogWrite("ERROR", message, sourceFile, lineNumber);
        }
        public void LogWarning(string message, [CallerFilePath]string sourceFile = "", [CallerLineNumber]int lineNumber = 0)
        {
            this.LogWrite("WARNING", message, sourceFile, lineNumber);
        }
        public void LogFatal(string message, [CallerFilePath]string sourceFile = "", [CallerLineNumber]int lineNumber = 0)
        {
            this.LogWrite("FATAL", message, sourceFile, lineNumber);
        }
        public void LogTrace(string message, [CallerFilePath]string sourceFile = "", [CallerLineNumber]int lineNumber = 0)
        {
            this.LogWrite("TRACE", message, sourceFile, lineNumber);
        }
        public void LogOff(string message, [CallerFilePath]string sourceFile = "", [CallerLineNumber]int lineNumber = 0)
        {
            this.LogWrite("OFF", message, sourceFile, lineNumber);
        }

        public void Dispose()
        {
        }
    }
}
