using AMWUtil.Common;
using Microsoft.CodeAnalysis;
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

        public static void ValidateModel(object model)
        {
            if (model == null) return;
            foreach(var t in model.GetType().GetFields())
            {
                if (!typeof(String).IsAssignableFrom(t.FieldType) &&
                    typeof(IEnumerable).IsAssignableFrom(t.FieldType))
                {
                    var v = t.GetValue(model);
                    var v2 = (IEnumerable)v;
                    foreach(var v3 in v2)
                    {
                        ValidateModel(v3);
                    }
                }
                else
                {
                    foreach(var a in t.GetCustomAttributes<ValidationAttribute>())
                    {
                        var v = t.GetValue(model);
                        string v2 = v == null ? string.Empty : v.ToString();
                        if(
                            (a.IsRequire && string.IsNullOrWhiteSpace(v2)) ||
                            (!string.IsNullOrEmpty(a.RegexPattern) && !Regex.IsMatch(v2, a.RegexPattern))
                          )
                        {
                            throw new System.Exception(string.Format(a.ErrorMessage, t.Name, v2));
                        }
                    }
                }
            }


        }
    }
}
