using AMWUtil.Common;
using OfficeOpenXml.FormulaParsing.Excel.Functions.DateTime;
using System;
using System.Collections.Generic;
using System.Data;
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
        public string LogRefID { get; private set; }
        public DateTime LogDateTime { get; private set; }
        public bool IsLogging { get; private set; }
        public string ServiceName { get; private set; }
        public string SubServiceName { get; set; }
        public string FileFullName { get; private set; }

        private static Dictionary<string, object> _LockFiles { get; set; }
        private static int _LockDay;

        public static void ClearLockFiles()
        {
            if (AMWLogger._LockFiles == null)
                return;
            if (AMWLogger._LockDay != DateTime.Now.Day)
            {
                AMWLogger._LockDay = DateTime.Now.Day;
                var remove_keys = _LockFiles.Keys.ToList().FindAll(x => !x.StartsWith(AMWLogger._LockDay + ","));
                remove_keys.ForEach(x =>
                {
                    _LockFiles.Remove(x);
                });
            }
        }


        public AMWLogger(string fileName, string serviceName, bool isLogging = true)
        {
            this.LogRefID = AMWUtil.Common.ObjectUtil.GenUniqID();  //Guid.NewGuid().ToString("N");
            this.ServiceName = serviceName;
            this.FileFullName = fileName;
            this.IsLogging = isLogging;
            this.LogDateTime = DateTime.Now;
            
        }


        public void LogWrite(string logLV, string message, string sourceFile, int lineNumber)
        {
            if (!this.IsLogging)
                return;
            string _fileFullName = this.FileFullName.Replace("{Date}", DateTime.Now.ToString("yyyyMMdd"));
            string _fileName = _fileFullName.Split(new char[] { '\\', '/' }).Last();

            string _key = DateTime.Now.Day + "," + _fileName;
            if (!AMWLogger._LockFiles.Any(x => x.Key == _key))
                AMWLogger._LockFiles.Add(_key, new object());

            object _lock = AMWLogger._LockFiles.First(x => x.Key == _key).Value;
            lock (_lock)
            {
                using (var fw = new StreamWriter(this.FileFullName, true))
                {
                    message = string.Format("{0:HH:mm:ss.fff} [{1}] [{2}] {3}/{4}({5}) > {6}",
                                            DateTime.Now,
                                            this.LogRefID,
                                            logLV,
                                            this.ServiceName,
                                            sourceFile.Split('\\').Last(),
                                            lineNumber,
                                            message.Replace("\r", string.Empty).Replace("\n", @"\n"));
                    fw.WriteLine(message);
                    fw.Flush();
                }
            }


        }


        public void LogAll(string message, [CallerFilePath] string sourceFile = "", [CallerLineNumber] int lineNumber = 0)
        {
            this.LogWrite("ALL", message, sourceFile, lineNumber);
        }
        public void LogInfo(string message, [CallerFilePath] string sourceFile = "", [CallerLineNumber] int lineNumber = 0)
        {
            this.LogWrite("INF", message, sourceFile, lineNumber);
        }
        public void LogDebug(string message, [CallerFilePath] string sourceFile = "", [CallerLineNumber] int lineNumber = 0)
        {
            this.LogWrite("DEB", message, sourceFile, lineNumber);
        }
        public void LogError(string message, [CallerFilePath] string sourceFile = "", [CallerLineNumber] int lineNumber = 0)
        {
            this.LogWrite("ERR", message, sourceFile, lineNumber);
        }
        public void LogWarning(string message, [CallerFilePath] string sourceFile = "", [CallerLineNumber] int lineNumber = 0)
        {
            this.LogWrite("WAR", message, sourceFile, lineNumber);
        }
        public void LogFatal(string message, [CallerFilePath] string sourceFile = "", [CallerLineNumber] int lineNumber = 0)
        {
            this.LogWrite("FAT", message, sourceFile, lineNumber);
        }
        public void LogTrace(string message, [CallerFilePath] string sourceFile = "", [CallerLineNumber] int lineNumber = 0)
        {
            this.LogWrite("TRA", message, sourceFile, lineNumber);
        }
        public void LogOff(string message, [CallerFilePath] string sourceFile = "", [CallerLineNumber] int lineNumber = 0)
        {
            this.LogWrite("OFF", message, sourceFile, lineNumber);
        }

        public void Dispose()
        {
        }
    }
}
