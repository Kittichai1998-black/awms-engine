using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;

namespace AMWUtil.Common
{
    public static class ClassType
    {
        public static Type GetClassType(string FullClassName)
        {
            var a1 = Assembly.GetCallingAssembly();
            var a2 = Assembly.GetEntryAssembly();
            var a3 = Assembly.GetExecutingAssembly();

            if (FullClassName.StartsWith(a1.GetName().Name))
                return a1.GetType(FullClassName);
            else if (FullClassName.StartsWith(a2.GetName().Name))
                return a2.GetType(FullClassName);
            else if (FullClassName.StartsWith(a3.GetName().Name))
                return a3.GetType(FullClassName);
            return null;
        }
    }
}
