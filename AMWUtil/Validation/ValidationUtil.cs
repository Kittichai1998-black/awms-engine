using AMWUtil.Common;
using AMWUtil.Exception;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;

namespace AMWUtil.Validation
{
    public static class ValidationUtil
    {
        public static AMWExceptionModel ValidateModel(object model)
        {
            if (model == null) return new AMWExceptionModel(AMWExceptionCode.V0_MODEL_IS_NULL);
            foreach(var t in model.GetType().GetFields())
            {
                if (!typeof(String).IsAssignableFrom(t.FieldType) &&
                    typeof(IEnumerable).IsAssignableFrom(t.FieldType))
                {
                    var v = t.GetValue(model);
                    var v2 = (IEnumerable)v;
                    if (v2 != null)
                    {
                        foreach (var v3 in v2)
                        {
                            ValidateModel(v3);
                        }
                    }
                       
                }
                else
                {
                    foreach(var a in t.GetCustomAttributes<ValidationAttribute>())
                    {
                        var v = t.GetValue(model);
                        string v2 = v == null ? string.Empty : v.ToString();
                        ///////////////////Verify by IsRequest
                        if (a.IsRequire && string.IsNullOrWhiteSpace(v2))
                        {
                            return new AMWExceptionModel(a.ExceptionCode, a.IsRequire.ToString(), t.Name, v2);
                        }

                        //////////////////Verify RegexPatterm
                        if (!string.IsNullOrEmpty(a.RegexPattern) && !Regex.IsMatch(v2, a.RegexPattern))
                        {
                            return new AMWExceptionModel(a.ExceptionCode, a.RegexPattern, t.Name, v2);
                        }

                        //////////////////Verify by Method
                        if (!string.IsNullOrEmpty(a.MethodValidate))
                        {
                            bool isVerify = false;
                            string cClass = a.MethodValidate.Substring(0, a.MethodValidate.LastIndexOf('.'));
                            string cMethod = Regex.Replace(a.MethodValidate.Substring(a.MethodValidate.LastIndexOf('.')+1), "^([^ (]+).*$", "$1");

                            var tClass = ClassType.GetClassType(cClass);
                            var tMethod = tClass.GetMethod(cMethod);
                            if (tMethod.IsStatic)
                            {
                                if(tMethod.GetParameters().Length != 1)
                                    return new AMWExceptionModel(a.ExceptionCode ?? AMWExceptionCode.V0_METHOD_PARAMETER_1ARG_ONLY, a.MethodValidate);
                                else if (!tMethod.GetParameters()[0].ParameterType.IsAssignableFrom(t.FieldType))
                                    return new AMWExceptionModel(a.ExceptionCode ?? AMWExceptionCode.V0_METHOD_PARAMETER_TYPE_NOT_EQ, a.MethodValidate);
                                
                                isVerify = (bool)tMethod.Invoke(null, new object[] { v2 });
                            }
                            else
                            {
                                return new AMWExceptionModel(a.ExceptionCode ?? AMWExceptionCode.V0_METHOD_NOT_STATIC, a.MethodValidate);
                            }

                            if (!isVerify)
                            {
                                return new AMWExceptionModel(a.ExceptionCode ?? AMWExceptionCode.V0_VALIDATE_METHOD_FAIL, a.MethodValidate, t.Name, v2);
                            }
                        }
                    }
                }
            }

            return null;
        }
    }
}
