using AMWUtil.IUtil;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace AMWUtil.Common
{
    public static class ObjectUtil
    {
        public static T Get<T>(this string s)
        {
            if (typeof(T) == typeof(string)) return (T)(object)s;
            if (typeof(T) == typeof(int)) return (T)(object)int.Parse(s);
            if (typeof(T) == typeof(decimal)) return (T)(object)decimal.Parse(s);
            if (typeof(T) == typeof(double)) return (T)(object)double.Parse(s);
            if (typeof(T) == typeof(float)) return (T)(object)float.Parse(s);
            if (typeof(T) == typeof(long)) return (T)(object)long.Parse(s);
            throw new System.Exception("Type " + typeof(T) + " Not Support.");
        }
        public static T? GetTry<T>(this string s)
            where T : struct
        {
            try
            {
                return s.Get<T>();
            }
            catch
            {
                return null;
            }
        }
        public static T[] Get<T>(this string[] s)
            where T : struct
        {
            return s.Select(x => x.Get<T>()).ToArray();
        }
        public static T?[] GetTry<T>(this string[] s)
            where T : struct
        {
            return s.Select(x => x.GetTry<T>()).ToArray();
        }
        
        public static T Json<T>(this string s)
        {
            return Newtonsoft.Json.JsonConvert.DeserializeObject<T>(s);
        }
        public static string Json<T>(this T s)
        {
            return Newtonsoft.Json.JsonConvert.SerializeObject(s);
        }

        public static bool IsEmptyNull(object obj)
        {
            if (obj == null) return true;
            if (obj is JValue)
            {
                string v = ((JValue)obj).ToString();
                float d = 0;
                if (float.TryParse(v, out d))
                {
                    if (d == 0) return true;
                }
                else if (string.IsNullOrWhiteSpace(v))
                {
                    return true;
                }
            }

            if (obj is string && string.IsNullOrWhiteSpace(obj.ToString())) return true;
            return false;
        }
        public static bool IsZeroEmptyNull(object obj)
        {
            if (obj == null) return true;
            if (obj is JValue)
            {
                string v = ((JValue)obj).ToString();
                float d = 0;
                if (float.TryParse(v, out d))
                {
                    if (d == 0) return true;
                }
                else if (string.IsNullOrWhiteSpace(v))
                {
                    return true;
                }
            }

            if (obj is string && string.IsNullOrWhiteSpace(obj.ToString())) return true;
            if (obj is int && (int)obj == 0) return true;
            if (obj is float && (float)obj == 0) return true;
            if (obj is long && (long)obj == 0) return true;
            if (obj is double && (double)obj == 0) return true;
            if (obj is decimal && (decimal)obj == 0) return true;
            return false;
        }

        public static bool EqualsOrZeroEmptyNull<T>(this T item, T obj)
        {
            if (IsZeroEmptyNull(obj)) return true;
            return item.Equals(obj);
        }

        public static bool IsBetween<T>(this T item, System.Nullable<T> start, System.Nullable<T> end) where T : struct
        {
            return (!start.HasValue || Comparer<T>.Default.Compare(item, start.Value) >= 0)
                && (!end.HasValue || Comparer<T>.Default.Compare(item, end.Value) <= 0);
        }
        public static string TrimNull(this string item)
        {
            if (string.IsNullOrWhiteSpace(item)) return string.Empty;
            return item.Trim();
        }
        public static bool IsBetween<T>(this T item, T start, T end)
        {
            return Comparer<T>.Default.Compare(item, start) >= 0
                && Comparer<T>.Default.Compare(item, end) <= 0;
        }




        public static char AsciiToChar(string s)
        {
            if (string.IsNullOrWhiteSpace(s)) return (char)0;
            int ascii = 0;
            if (!int.TryParse(s, out ascii)) return (char)0;
            return ((char)ascii);
        }
        public static string ListKeyToQueryString(params KeyValuePair<string, string>[] param)
        {
            return ListKeyToQueryString(param.ToList());

        }
        public static string ListKeyToQueryString(List<KeyValuePair<string, string>> param)
        {
            StringBuilder res = new StringBuilder();
            foreach (KeyValuePair<string, string> p in param)
            {
                if (res.Length > 0) res.Append("&");
                res.Append(HttpUtility.UrlEncode(p.Key));
                res.Append("=");
                res.Append(HttpUtility.UrlEncode(p.Value));
            }
            return res.ToString();
        }
        public static Dictionary<string,string> QueryStringToDictionary(string param)
        {
            Dictionary<string, string> res = new Dictionary<string, string>();
            var values = QueryStringToListKey(param);

            foreach (KeyValuePair<string,string> v in values)
            {
                res.Add(v.Key, v.Value);
            }
            
            return res;
        }

        public static List<KeyValuePair<string, string>> QueryStringToListKey(string param)
        {
            List<KeyValuePair<string, string>> res = new List<KeyValuePair<string, string>>();
            try
            {
                string[] pArr = param.Split('&');
                foreach (string p in pArr)
                {
                    string[] ps = p.Split(new char[] { '=' }, 2);
                    string k = HttpUtility.UrlDecode(ps[0]);
                    string v = HttpUtility.UrlDecode(ps[1]);
                    res.Add(new KeyValuePair<string, string>(k, v));
                }
            }
            catch (System.Exception ex)
            {
                res = new List<KeyValuePair<string, string>>();
                Console.Error.WriteLine(ex.StackTrace);
            }
            return res;
        }
        public static List<string> QueryStringToKeys(string param)
        {
            List<string> res = new List<string>();
            QueryStringToListKey(param).ForEach(x => res.Add(x.Key));
            return res;
        }




        public static dynamic QueryStringToObject(QueryString querystring)
        {
            return QueryStringToObject(querystring.Value);
        }
        public static dynamic QueryStringToObject(string querystring)
        {
            var dict = HttpUtility.ParseQueryString(querystring);
            var qrtstrDict = dict.AllKeys.Where(x => {
                try
                {
                    if (x == null || x == "null")
                        return false;
                    var v = dict[x];
                    return !string.IsNullOrEmpty(dict.Get(x));
                }
                catch
                {
                    return false;
                }
            }
            ).ToDictionary(key => key, key => dict[key]);
            var jsons = JsonConvert.SerializeObject(qrtstrDict);
            var jsond = JsonConvert.DeserializeObject(jsons);

            return jsond;
        }
        public static T CloneModel<T>(object obj)
            where T : new()
        {
            return DynamicToModel<T>(obj);
        }
        public static T DynamicToModel<T>(dynamic obj)
            where T : new()
        {
            if (obj == null) return new T();
            string jsonX = Newtonsoft.Json.JsonConvert.SerializeObject(obj);
            return Newtonsoft.Json.JsonConvert.DeserializeObject<T>(jsonX);
        }

        public static List<KeyValuePair<string, object>> FieldKeyValuePairs<T>(this T obj)
            where T : class
        {
            List<KeyValuePair<string, object>> res = new List<KeyValuePair<string, object>>();
            var fs = typeof(T).GetFields();
            foreach (var f in fs)
            {
                var k = f.Name;
                var v = f.GetValue(obj);
                res.Add(new KeyValuePair<string, object>(k, v));
            }
            return res;
        }
        public static List<KeyValuePair<string, object>> PropertieKeyValuePairs<T>(this T obj)
            where T : class
        {
            List<KeyValuePair<string, object>> res = new List<KeyValuePair<string, object>>();
            var fs = typeof(T).GetProperties();
            foreach (var f in fs)
            {
                var k = f.Name;
                var v = f.GetValue(obj);
                res.Add(new KeyValuePair<string, object>(k, v));
            }
            return res;
        }
        public static bool Equals(this object obj, params object[] comps)
        {
            foreach(var comp in comps)
            {
                if (obj.Equals(comp))
                    return true;
            }
            return false;
        }
    }
}
