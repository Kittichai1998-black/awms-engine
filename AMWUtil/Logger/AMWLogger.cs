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
        private string _RefID;
        public string ServiceRefID { get { return _RefID; } }
        public string SubServiceName { get; set; }
        private string _ServiceName { get; set; }
        private string _FileName { get; set; }
        private StackTrace _StackTrace;

        
        public AMWLogger(string fileName, string refID, string serviceName)
        {
            this._LogRefID = AMWUtil.Common.ObjectUtil.GenUniqID();  //Guid.NewGuid().ToString("N");
            this._RefID = refID;
            this._ServiceName = serviceName;
            this._FileName = fileName;
            this._StackTrace = new StackTrace();
            //this.FileLogger = File.Open(fileName, FileMode.Append, FileAccess.Write, FileShare.Read);
            //this.UpdateLastUse();
            //this.LogBeginTransaction();
        }
        



        public void LogWrite(string logLV, string message, [CallerLineNumber]int lineNumber = 0, string className = "", string methodName = "")
        {
            return;
            className = string.IsNullOrWhiteSpace(className) ? _StackTrace.GetFrame(2).GetMethod().DeclaringType.FullName : className;
            methodName = string.IsNullOrWhiteSpace(methodName) ? _StackTrace.GetFrame(2).GetMethod().Name : methodName;

            message = string.Format("{0:yyyy-MM-dd HH:mm:ss.fff} [{4}] [{8}] {5}({3}) {9}",
                                        DateTime.Now,
                                        className,
                                        methodName,
                                        lineNumber,
                                        this.LogRefID,
                                        this._ServiceName + (string.IsNullOrWhiteSpace(this.SubServiceName) ? string.Empty : "/" + this.SubServiceName),
                                        this.ServiceRefID,
                                        this._RefID,
                                        logLV,
                                        message.Replace("\r", string.Empty).Replace("\n", "_$$$_"));
            lock (AMWLoggerManager.LogMessagesTMPLock)
            {
                AMWLoggerManager.LogMessagesTMP.Add(new KeyValuePair<string, string>(this._FileName, message));
            }

            
        }

        public void LogAll(string message, [CallerLineNumber]int lineNumber = 0)
        {
            this.LogWrite("ALL" , message, lineNumber);
        }
        public void LogInfo(string message, [CallerLineNumber]int lineNumber = 0)
        {
            this.LogWrite("INF" ,message, lineNumber);
        }
        public void LogDebug(string message, [CallerLineNumber]int lineNumber = 0)
        {
            this.LogWrite("DEB", message, lineNumber);
        }
        public void LogError(string message, [CallerLineNumber]int lineNumber = 0)
        {
            this.LogWrite("ERR", message, lineNumber);
        }
        public void LogWarning(string message, [CallerLineNumber]int lineNumber = 0)
        {
            this.LogWrite("WAR", message, lineNumber);
        }
        public void LogFatal(string message, [CallerLineNumber]int lineNumber = 0)
        {
            this.LogWrite("FAT", message, lineNumber);
        }
        public void LogTrace(string message, [CallerLineNumber]int lineNumber = 0)
        {
            this.LogWrite("TRA", message, lineNumber);
        }
        public void LogOff(string message, [CallerLineNumber]int lineNumber = 0)
        {
            this.LogWrite("OFF", message, lineNumber);
        }

        public void Dispose()
        {
        }
    }
}
