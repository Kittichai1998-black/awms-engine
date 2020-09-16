using AMWUtil.Exception;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMWUtil.Validation
{
    public class ValidationAttribute : Attribute
    {
        /// <summary>
        /// Default : False
        /// </summary>
        public bool IsRequire = false;
        /// <summary>
        /// Default : Empty
        /// </summary>
        public string RegexPattern = null;
        /// <summary>
        /// Default : Empty
        /// </summary>
        public string MethodValidate = null;
        /// <summary>
        /// Default : null
        /// </summary>
        public AMWExceptionCode ExceptionCode = AMWExceptionCode.U0000;

        public ValidationAttribute() { }
    }
}
