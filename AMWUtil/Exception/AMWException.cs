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
            string[] paramters = null,
            Dictionary<string,string> messages = null,
            [CallerFilePath]string sourceFile = "",
            [CallerLineNumber]int lineNumber = 0)
            : base(
                string.Format(
                    code.Attribute<AMWExceptionDescription>().Code + ":" +
                    (messages != null && messages.ContainsKey(code.Attribute<AMWExceptionDescription>().Code) ?
                        messages[code.Attribute<AMWExceptionDescription>().Code] : code.Attribute<AMWExceptionDescription>().DefaultMessage),
                    paramters ?? new string[] { })
                  )
        {
            this.AWMCode = code;
            this.LineNumber = lineNumber;
            this.SourceFile = sourceFile;
            //StackTrace stackTrace = new StackTrace();
            //this.ClassName = stackTrace.GetFrame(extendLv).GetMethod().DeclaringType.FullName;
            //this.MethodName = stackTrace.GetFrame(extendLv).GetMethod().Name;
            if (logger != null)
                logger.LogError(this.Message, sourceFile, lineNumber);
            else
                Console.Error.WriteLine("[ERR] " + this.Message);
        }
        public AMWException(
            ILogger logger,
            AMWExceptionCode code,
            string paramters,
            Dictionary<string, string> messages = null,
            [CallerFilePath]string sourceFile = "",
            [CallerLineNumber]int lineNumber = 0) :
            this(logger, code, new string[] { paramters }, messages, sourceFile, lineNumber)
        { }

        public AMWException(
            ILogger logger,
            AMWExceptionCode code,
            string paramters,
            AMWExceptionSourceChild source,
            Dictionary<string, string> messages = null) :
            this(logger, code, new string[] { paramters }, messages, source.SourceFile,source.LineNumber)
        { }


    }
}
