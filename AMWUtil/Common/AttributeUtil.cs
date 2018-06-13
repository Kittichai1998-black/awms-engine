using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AMWUtil.Common
{
    public static class AttributeUtil
    {
        public static T FirstAttributeOfType<T>(object property) where T : System.Attribute
        {
            var type = property.GetType();
            var memInfo = type.GetMember(property.ToString());
            var attributes = memInfo[0].GetCustomAttributes(typeof(T), false);
            return (attributes.Length > 0) ? (T)attributes[0] : null;
        }
        public static T[] ListAttributeOfType<T>(object property) where T : System.Attribute
        {
            var type = property.GetType();
            var memInfo = type.GetMember(property.ToString());
            var attributes = memInfo[0].GetCustomAttributes(typeof(T), false);
            return (T[])attributes;
        }
    }
}
