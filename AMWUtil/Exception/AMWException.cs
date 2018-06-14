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
        private string ClassName;
        private string MethodName;
        private AMWExceptionCode KKFCode;
        public string GetKKFCode() { return this.KKFCode.ToString(); }
        public string GetKKFMessage() { return this.KKFCode.ToString(); }
        public string GetKKFUserMessage() { return this.KKFCode.ToString() + ":" + this.Message; }

        public AMWException(
            ILogger logger,
            AMWExceptionCode code,
            string[] paramters,
            ENLanguage Language = ENLanguage.TH,
            int extendLv = 1,
            [CallerLineNumber]int lineNumber = 0)
            : base(
                string.Format(code + ":" 
                    + (Language == ENLanguage.EN ? AMWUtil.Common.AttributeUtil.FirstAttributeOfType<AMWExceptionDescription>(code).EN :
                    Language == ENLanguage.CN ? AMWUtil.Common.AttributeUtil.FirstAttributeOfType<AMWExceptionDescription>(code).CN :
                        AMWUtil.Common.AttributeUtil.FirstAttributeOfType<AMWExceptionDescription>(code).TH)
                    + " #REFID : " + (logger==null ? "NULL" : logger.RefID),
                    paramters)
                  )
        {
            this.KKFCode = code;
            StackTrace stackTrace = new StackTrace();
            this.LineNumber = lineNumber;
            this.ClassName = stackTrace.GetFrame(extendLv).GetMethod().DeclaringType.FullName;
            this.MethodName = stackTrace.GetFrame(extendLv).GetMethod().Name;
            if (logger != null)
                logger.LogWrite("[ERROR] " + this.Message, lineNumber, this.ClassName, this.MethodName);
            else
                Console.Error.WriteLine("[ERROR] " + this.Message);
        }

        public AMWException(ILogger logger, AMWExceptionCode code, string parameter = null, ENLanguage Language = ENLanguage.TH, [CallerLineNumber]int lineNumber = 0)
            : this(logger, code, new string[] { parameter }, Language, 2, lineNumber) { }

        public AMWException(ILogger logger, AMWExceptionCode code, ENLanguage Language = ENLanguage.TH, [CallerLineNumber]int lineNumber = 0)
            : this(logger, code, new string[] { }, Language, 2, lineNumber) { }

        public AMWException(ILogger logger, string message, ENLanguage Language = ENLanguage.TH, [CallerLineNumber]int lineNumber = 0)
            : this(logger, AMWExceptionCode.U0000, new string[] { message }, Language, 2, lineNumber) { }




    }
}
