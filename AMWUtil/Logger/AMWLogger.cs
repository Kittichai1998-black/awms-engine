using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
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
        private string ServiceName { get; set; }
        private string FileName { get; set; }
        private StackTrace STrace;
        private object lockthis = new object();

        
        public AMWLogger(string fileName, string refID, string serviceName)
        {
            this._LogRefID = AMWUtil.Common.ObjectUtil.GenUniqID();  //Guid.NewGuid().ToString("N");
            this._RefID = refID;
            this.ServiceName = serviceName;
            this.FileName = fileName;
            //this.FileLogger = File.Open(fileName, FileMode.Append, FileAccess.Write, FileShare.Read);
            //this.UpdateLastUse();
            //this.LogBeginTransaction();
        }
        

        public void LogBeginTransaction()
        {
            this.LogWrite("[TRANSACTION BEGIN] #############################################", 0);
        }
        public void LogEndTransaction()
        {
            this.LogWrite("[TRANSACTION END] #############################################", 0);
        }
        public void LogWrite(string message, [CallerLineNumber]int lineNumber = 0, string className = "", string methodName = "")
        {
            this.STrace = new StackTrace();
            message = string.Format("{0:yyyy-MM-dd HH:mm:ss.fff} [{4}] {1}.{2}({3}) {6}",
            DateTime.Now,
            string.IsNullOrWhiteSpace(className) ? STrace.GetFrame(2).GetMethod().DeclaringType.FullName : className,
            string.IsNullOrWhiteSpace(methodName) ? STrace.GetFrame(2).GetMethod().Name : methodName,
            lineNumber,
            this.LogRefID,
            this._RefID,
            message);
            lock (AMWLoggerManager.LogMessagesTMPLock)
            {
                AMWLoggerManager.LogMessagesTMP.Add(new KeyValuePair<string, string>(this.FileName, message));
            }

            
        }
        public void LogInfo(string message, [CallerLineNumber]int lineNumber = 0)
        {
            this.LogWrite("[INFO] " + message, lineNumber);
        }
        public void LogDebug(string message, [CallerLineNumber]int lineNumber = 0)
        {
            this.LogWrite("[DEBUG] " + message, lineNumber);
        }
        public void LogError(string message, [CallerLineNumber]int lineNumber = 0)
        {
            this.LogWrite("[ERROR] " + message, lineNumber);
        }
        public void LogSuccess(string message, [CallerLineNumber]int lineNumber = 0)
        {
            this.LogWrite("[SUCCESS] " + message, lineNumber);
        }
        public void LogWarning(string message, [CallerLineNumber]int lineNumber = 0)
        {
            this.LogWrite("[WARNING] " + message, lineNumber);
        }
        public void LogExecBegin(string message, [CallerLineNumber]int lineNumber = 0)
        {
            this.LogWrite("[EXEC BEGIN] " + message, lineNumber);
        }
        public void LogExecEnd(string message, [CallerLineNumber]int lineNumber = 0)
        {
            this.LogWrite("[EXEC END] " + message, lineNumber);
        }
        public void LogBegin([CallerLineNumber]int lineNumber = 0)
        {
            this.LogWrite("[BEGIN] -------------------------------------------", lineNumber);
        }
        public void LogEnd([CallerLineNumber]int lineNumber = 0)
        {
            this.LogWrite("[END] -------------------------------------------", lineNumber);
        }

        private void Close()
        {
            /*lock (this.FileLogger)
            {
                if (this.FileLogger != null && this.FileLogger.CanWrite)
                {
                    this.FileLogger.Close();
                    this.FileLogger.Dispose();
                }
            }*/
            this.LogEndTransaction();
        }


        public void Dispose()
        {
            this.Close();
        }
    }
}
