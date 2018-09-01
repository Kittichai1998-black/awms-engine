using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace AMWUtil.Logger
{
    public class AMWLogger : IDisposable, ILogger
    {
        private long lastUse;

        public FileStream FileLogger { get; set; }
        private string _LogRefID;
        public string LogRefID { get { return this._LogRefID; } }
        private string _RefID;
        public string ServiceRefID { get { return _RefID; } }
        private string ServiceName { get; set; }
        private string FileName { get; set; }
        private StackTrace STrace;
        private object lockthis = new object();

        public long LastUse { get { return this.lastUse; } }

        AMWLogger() {  }

        internal AMWLogger(string fileName, string refID, string serviceName)
        {
            this._LogRefID = Guid.NewGuid().ToString("N");
            this._RefID = refID;
            this.ServiceName = serviceName;
            //this.FileLogger = new StreamWriter(fileFullName, true);
            this.FileName = fileName;
            this.FileLogger = File.Open(fileName, FileMode.Append, FileAccess.Write, FileShare.Read);
            this.UpdateLastUse();
            this.LogBeginTransaction();
        }
        internal AMWLogger(FileStream fileLogger, string refID, string serviceName)
        {
            this._LogRefID = Guid.NewGuid().ToString("N");
            this.FileName = fileLogger.Name;
            this.STrace = new StackTrace();
            this._RefID = refID;
            this.ServiceName = serviceName;
            //this.FileLogger = new StreamWriter(fileFullName, true);
            this.FileLogger = fileLogger;
            this.UpdateLastUse();
            this.LogBeginTransaction();
        }
        

        public void UpdateLastUse(){
            this.lastUse = DateTime.Now.Ticks;
        }

        private void LogBeginTransaction()
        {
            this.LogWrite("[TRANSACTION BEGIN] #############################################", 0);
        }
        private void LogEndTransaction()
        {
            this.LogWrite("[TRANSACTION END] #############################################", 0);
        }

        public void LogWrite(string message, [CallerLineNumber]int lineNumber = 0, string className = "", string methodName = "")
        {
            return;
            lock (this.FileLogger)
            {
                this.STrace = new StackTrace();
                message = string.Format("{0:yyyy-MM-dd HH:mm:ss.fff} {1}.{2}({3}) [{5}] {6}",
                DateTime.Now,
                string.IsNullOrWhiteSpace(className) ? STrace.GetFrame(2).GetMethod().DeclaringType.FullName : className,
                string.IsNullOrWhiteSpace(methodName) ? STrace.GetFrame(2).GetMethod().Name : methodName,
                lineNumber,
                this.ServiceName,
                this._RefID,
                message);
                if (message.Length > 2000)
                    Console.Out.WriteLine(message.Substring(0, 2000));
                else
                    Console.Out.WriteLine(message);

                byte[] b = Encoding.UTF8.GetBytes(message + "\r\n");
                
                this.FileLogger.Write(b, 0, b.Length);
                this.FileLogger.Flush();
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
