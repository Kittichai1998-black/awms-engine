using AMWUtil.Common;
using AMWUtil.Logger;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace AMWUtil.Exception
{
    public class AMWException : System.Exception
    {

        private int LineNumber;
        private string SourceFile;
        //private string ClassName;
        //private string MethodName;
        private AMWExceptionCode AWMCode;
        public string GetAMWCode() { return this.AWMCode.ToString(); }
        public string GetAMWMessage() { return this.Message; }
        public string GetAMWUserMessage() { return this.AWMCode.ToString() + ":" + this.Message; }

        public AMWException(
            ILogger logger,
            AMWExceptionCode code,
            string[] args = null,
            Dictionary<string,string> messages = null,
            [CallerFilePath]string sourceFile = "",
            [CallerLineNumber]int lineNumber = 0)
            : base(
                string.Format(
                    code.Attribute<AMWExceptionCodeAttribute>().Code + ":" +
                    (messages != null && messages.ContainsKey(code.Attribute<AMWExceptionCodeAttribute>().Code) ?
                        messages[code.Attribute<AMWExceptionCodeAttribute>().Code] : code.Attribute<AMWExceptionCodeAttribute>().DefaultMessage),
                    args ?? new string[] { })
                  )
        {
            this.AWMCode = code;
            this.LineNumber = lineNumber;
            this.SourceFile = sourceFile;

            if (logger != null)
                logger.LogError(this.Message, sourceFile, lineNumber);
            else
                Console.Error.WriteLine("[ERR] " + this.Message);
        }
        public AMWException(
            ILogger logger,
            AMWExceptionCode code,
            string arg1,
            Dictionary<string, string> messages = null,
            [CallerFilePath] string sourceFile = "",
            [CallerLineNumber] int lineNumber = 0) :
            this(logger, code, new string[] { arg1 }, messages, sourceFile, lineNumber)
        { }
        public AMWException(
            ILogger logger,
            AMWExceptionCode code,
            string arg1,
            string arg2,
            Dictionary<string, string> messages = null,
            [CallerFilePath] string sourceFile = "",
            [CallerLineNumber] int lineNumber = 0) :
            this(logger, code, new string[] { arg1, arg2 }, messages, sourceFile, lineNumber)
        { }
        public AMWException(
            ILogger logger,
            AMWExceptionCode code,
            string arg1,
            string arg2,
            string arg3,
            Dictionary<string, string> messages = null,
            [CallerFilePath] string sourceFile = "",
            [CallerLineNumber] int lineNumber = 0) :
            this(logger, code, new string[] { arg1, arg2, arg3 }, messages, sourceFile, lineNumber)
        { }

        public AMWException(
            ILogger logger,
            AMWExceptionCode code,
            string arg1,
            AMWExceptionSourceChild source,
            Dictionary<string, string> messages = null) :
            this(logger, code, new string[] { arg1 }, messages, source.SourceFile,source.LineNumber)
        { }


    }
}
