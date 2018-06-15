using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace AMWUtil.Common
{
    public static class AttributeUtil
    {
        public static T FirstAttributeOfType<T>(object obj) where T : System.Attribute
        {
            var type = obj.GetType();
            var memInfo = type.GetMember(obj.ToString());
            var attributes = memInfo[0].GetCustomAttributes(typeof(T), false);
            return (attributes.Length > 0) ? (T)attributes[0] : null;
        }
        public static T[] ListAttributeOfType<T>(object obj) where T : System.Attribute
        {
            var type = obj.GetType();
            var memInfo = type.GetMember(obj.ToString());
            var attributes = memInfo[0].GetCustomAttributes(typeof(T), false);
            return (T[])attributes;
        }

        public static T FirstAttributeOfType<T>(MemberInfo memInfo) where T : System.Attribute
        {
            var attributes = memInfo.GetCustomAttributes(typeof(T), false);
            return (attributes.Length > 0) ? (T)attributes[0] : null;
        }
        public static T[] ListAttributeOfType<T>(MemberInfo memInfo) where T : System.Attribute
        {
            var attributes = memInfo.GetCustomAttributes(typeof(T), false);
            return (T[])attributes;
        }
    }
}
