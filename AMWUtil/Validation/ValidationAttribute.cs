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
        /// Default : "{0} is '{1}' not valid!"
        /// </summary>
        public string ErrorMessage = "{0} is '{1}' not valid!";


        public ValidationAttribute() { }
    }
}
