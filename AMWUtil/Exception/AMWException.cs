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
        public enum ENLanguage
        {
            TH,EN,CN
        }

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
            ENLanguage Language = ENLanguage.TH,
            [CallerFilePath]string sourceFile = "",
            [CallerLineNumber]int lineNumber = 0)
            : base(
                string.Format(code + ":" 
                    + (Language == ENLanguage.EN ? AMWUtil.Common.AttributeUtil.Attribute<AMWExceptionDescription>(code).EN :
                    Language == ENLanguage.CN ? AMWUtil.Common.AttributeUtil.Attribute<AMWExceptionDescription>(code).CN :
                        AMWUtil.Common.AttributeUtil.Attribute<AMWExceptionDescription>(code).TH),
                    paramters??new string[] { })
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
            ENLanguage language = ENLanguage.TH,
            [CallerFilePath]string sourceFile = "",
            [CallerLineNumber]int lineNumber = 0) :
            this(logger, code, new string[] { paramters }, language, sourceFile, lineNumber)
        { }

        public AMWException(
            ILogger logger,
            AMWExceptionCode code,
            string paramters,
            AMWExceptionSourceChild source,
            ENLanguage language = ENLanguage.TH) :
            this(logger, code, new string[] { paramters }, language, source.SourceFile,source.LineNumber)
        { }


    }
}
