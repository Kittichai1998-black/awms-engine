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
        private string _LogRefID;
        public string LogRefID { get { return this._LogRefID; } }
        public bool IsLogging { get; set; }
        public string SubServiceName { get; set; }
        private string _ServiceName { get; set; }
        private string _FileFullName { get; set; }
        private string _FileName { get; set; }
        private static List<KeyValuePair<string, object>> _LockFiles = new List<KeyValuePair<string, object>>();
        private static int _LockDay;

        public static bool ClearLockFiles()
        {
            if (AMWLogger._LockFiles == null)
                AMWLogger._LockFiles = new List<KeyValuePair<string, object>>();
            if (AMWLogger._LockDay != DateTime.Now.Day)
            {
                AMWLogger._LockDay = DateTime.Now.Day;
                string lockDay = AMWLogger._LockDay.ToString() + ",";
                AMWLogger._LockFiles.RemoveAll(x => x.Key.StartsWith(lockDay));
                return true;
            }
            return false;
        }


        public AMWLogger(string fileName, string serviceName, bool isLogging = true)
        {
            this._LogRefID = AMWUtil.Common.ObjectUtil.GenUniqID();  //Guid.NewGuid().ToString("N");
            this._ServiceName = serviceName;
            this._FileFullName = fileName;
            this.IsLogging = isLogging;
            this._FileName = fileName.Split(new char[] { '\\', '/' }).Last();
        }


        public void LogWrite(string logLV, string message, string sourceFile, int lineNumber)
        {
            if (!this.IsLogging)
                return;
            string _key = DateTime.Now.Day + "," + this._FileName;
            if (!AMWLogger._LockFiles.Any(x => x.Key == _key))
                AMWLogger._LockFiles.Add(new KeyValuePair<string, object>(_key, new object()));

            object _lock = AMWLogger._LockFiles.First(x => x.Key == _key).Value;
            lock (_lock)
            {
                using (var fw = new StreamWriter(this._FileFullName, true))
                {
                    message = string.Format("{0:HH:mm:ss.fff} [{1}] [{2}] {3}/{4}({5}) > {6}",
                                            DateTime.Now,
                                            this.LogRefID,
                                            logLV,
                                            this._ServiceName,
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
