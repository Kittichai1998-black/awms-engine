using AMWUtil.Exception;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AMWUtil.Common
{
    public static class EnumUtil
    {

        public static string GetDisplayName<T>(this T enumVal)
             where T : struct, IComparable, IFormattable, IConvertible
        {
            if (!typeof(T).IsEnum) throw new System.Exception("Not Enum Type.");
            return AttributeUtil.Attribute<DisplayAttribute>(enumVal).Name;
        }
        public static string GetDisplayName<T>(string strVal)
             where T : struct, IComparable, IFormattable, IConvertible
        {
            int val = (int)strVal[0];
            object e = Enum.ToObject(typeof(T), val);
            return AttributeUtil.Attribute<DisplayAttribute>((T)e).Name;
        }

        public static List<KeyValuePair<string, char>> ListKeyValuesChar<T>() where T : struct, IComparable, IFormattable, IConvertible
        {
            List<KeyValuePair<string, char>> res = new List<KeyValuePair<string,char>>();
            ListKeyValuesInt<T>().ForEach(x => res.Add(new KeyValuePair<string, char>(x.Key, (char)x.Value)));
            return res;
        }

        // create by SoMRuk 26/12/2017
        public static List<KeyValuePair<string, string>> ListKeyValuesString<T>() where T : struct, IComparable, IFormattable, IConvertible
        {
            List<KeyValuePair<string, string>> res = new List<KeyValuePair<string, string>>();
            ListKeyValuesInt<T>().ForEach(x => res.Add(new KeyValuePair<string, string>(x.Key, ((char)x.Value).ToString())));
            return res;
        }

        public static List<T> List<T>()
            where T : struct, IComparable, IFormattable, IConvertible
        {
            if (!typeof(T).IsEnum) throw new System.Exception("Not Type Enum.");
            List<T> list = Enum.GetValues(typeof(T)).Cast<T>().ToList<T>();
            return list;
        }
        public static List<KeyValuePair<string, int>> ListKeyValuesInt<T>()
            where T : struct, IComparable, IFormattable, IConvertible
        {
            if (!typeof(T).IsEnum) throw new System.Exception("Not Type Enum.");
            List<T> list = Enum.GetValues(typeof(T)).Cast<T>().ToList<T>();
            List<KeyValuePair<int, KeyValuePair<string, int>>> displayAttr = new List<KeyValuePair<int, KeyValuePair<string, int>>>();
            List<KeyValuePair<string, int>> res = new List<KeyValuePair<string, int>>();
            foreach (T e in list)
            {
                DisplayAttribute attr = AttributeUtil.Attribute<DisplayAttribute>(e);
                string key = EnumUtil.GetDisplayName<T>(e);
                if (string.IsNullOrWhiteSpace(key)) continue;
                int val = (int)Enum.Parse(typeof(T), e.ToString());
                displayAttr.Add(new KeyValuePair<int, KeyValuePair<string, int>>(attr.Order,
                    new KeyValuePair<string, int>(key, val)));
            }
            res = displayAttr.OrderBy(x => x.Key).Select(x => x.Value).ToList();
            return res;
        }
        public static string GetValueString<T>(this T enumVal)
             where T : struct, IComparable, IFormattable, IConvertible
        {
            return enumVal.GetValueChar().ToString();
        }
        public static char GetValueChar<T>(this T enumVal)
             where T : struct, IComparable, IFormattable, IConvertible
        {
            return (char)enumVal.GetValueInt();
        }
        public static int GetValueInt<T>(this T enumVal)
             where T : struct, IComparable, IFormattable, IConvertible
        {
            return (int)Enum.Parse(typeof(T), enumVal.ToString());
        }
        public static T GetValueEnum<T>(char val)
             where T : struct, IComparable, IFormattable, IConvertible
        {
            int v = (int)val;
            object e = Enum.ToObject(typeof(T), v);
            return (T)e;
        }

        public static List<string> ListValueString<T>()
             where T : struct, IComparable, IFormattable, IConvertible
        {
            List<string> res = ListKeyValuesChar<T>().Select(x => x.Value.ToString()).ToList();
            return res;
        }
        public static List<string> ListValueString<T>(params T[] param)
             where T : struct, IComparable, IFormattable, IConvertible
        {
            List<string> res = new List<string>();
            foreach (T p in param)
            {
                res.Add(GetValueString<T>(p));
            }
            return res;
        }

        public static List<KeyValuePair<string, char>> SortAndConvertKeyValueList<TEnum>(List<TEnum> lis)
             where TEnum : struct, IComparable, IFormattable, IConvertible
        {
            List<KeyValuePair<string, char>> res = new List<KeyValuePair<string, char>>();
            foreach (KeyValuePair<string, char> e in ListKeyValuesChar<TEnum>())
            {
                if (lis.Any(x => x.GetValueString().Equals(e.Value.ToString())))
                    res.Add(e);
            }
            return res;
        }
    }
}
