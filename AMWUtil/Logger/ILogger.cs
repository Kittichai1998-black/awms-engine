using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace AMWUtil.Logger
{
    public interface ILogger
    {
        string LogRefID { get; }
        string ServiceRefID { get; }
        
        void LogWrite(string message, [CallerLineNumber]int lineNumber = 0, string className = "", string methodName = "");
        void LogInfo(string message, [CallerLineNumber]int lineNumber = 0);
        void LogDebug(string message, [CallerLineNumber]int lineNumber = 0);
        void LogError(string message, [CallerLineNumber]int lineNumber = 0);
        void LogSuccess(string message, [CallerLineNumber]int lineNumber = 0);
        void LogWarning(string message, [CallerLineNumber]int lineNumber = 0);
        void LogBegin([CallerLineNumber]int lineNumber = 0);
        void LogEnd([CallerLineNumber]int lineNumber = 0);
    }
}
