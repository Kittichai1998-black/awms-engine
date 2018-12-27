﻿using System;
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
        void LogWrite(string logLV, string message, [CallerLineNumber]int lineNumber = 0, string className = "", string methodName = "");

        void LogAll(string message, [CallerLineNumber]int lineNumber = 0);
        void LogInfo(string message, [CallerLineNumber]int lineNumber = 0);
        void LogDebug(string message, [CallerLineNumber]int lineNumber = 0);
        void LogError(string message, [CallerLineNumber]int lineNumber = 0);
        void LogWarning(string message, [CallerLineNumber]int lineNumber = 0);
        void LogFatal(string message, [CallerLineNumber]int lineNumber = 0);
        void LogTrace(string message, [CallerLineNumber]int lineNumber = 0);
        void LogOff(string message, [CallerLineNumber]int lineNumber = 0);
    }
}
