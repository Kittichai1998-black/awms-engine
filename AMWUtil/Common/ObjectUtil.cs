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
        public static int? ParseInt(string s)
        {
            double? res = ParseDouble(s);
            if (res.HasValue)
                return (int)res.Value;
            return null;
        }
        public static int[] ParseInt(string[] s)
        {
            List<int> res = new List<int>();
            foreach (string i in s)
            {
                int? v = ParseInt(i);
                if (v.HasValue)
                    res.Add(v.Value);
            }
            return res.ToArray();
        }
        public static decimal? ParseDecimal(string s)
        {
            decimal res = 0;
            if (decimal.TryParse(s, out res))
                return res;
            return null;
        }
        public static decimal[] ParseDecimal(string[] s)
        {
            List<decimal> res = new List<decimal>();
            foreach (string i in s)
            {
                decimal? v = ParseDecimal(i);
                if (v.HasValue)
                    res.Add(v.Value);
            }
            return res.ToArray();
        }
        public static double? ParseDouble(string s)
        {
            double res = 0;
            if (double.TryParse(s, out res))
                return res;
            return null;
        }
        public static double[] ParseDouble(string[] s)
        {
            List<double> res = new List<double>();
            foreach (string i in s)
            {
                double? v = ParseDouble(i);
                if (v.HasValue)
                    res.Add(v.Value);
            }
            return res.ToArray();
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

        public static List<T> CloneModel<T>(this List<T> input, List<T> output = null)
            where T : class
        {
            if (output == null)
                output = new List<T>();
            input.ForEach(x => output.Add(x.CloneModel()));
            return output;
        }
        public static T CloneModel<T>(this T input, T output = null)
            where T : class
        {
            if (output == null)
                output = (T)Activator.CreateInstance(typeof(T), null);

            PropertyInfo[] pis = typeof(T).GetProperties();
            foreach (PropertyInfo pi in pis)
            {
                var val = pi.GetValue(input);
                if (val is string || val is int || val is DateTime || val is decimal || val is float || val is double || val is long)
                {
                    pi.SetValue(output, val);
                }
            }
            return output;
        }
        public static void CopyModelShiftID<T>(this T main, T copy)
        {
            PropertyInfo[] pis = typeof(T).GetProperties();
            foreach (PropertyInfo pi in pis)
            {
                if (pi.Name.ToLower().Equals("id")) continue;
                Type t = pi.PropertyType;
                if (t == typeof(Nullable))
                    if (t.GenericTypeArguments.Length == 1)
                        t = t.GenericTypeArguments[0];
                    else
                        continue;

                if (t == typeof(string) || t == typeof(int) || t == typeof(DateTime) ||
                    t == typeof(decimal) || t == typeof(float) || t == typeof(double) ||
                    t == typeof(long) ||
                    t == typeof(Nullable<int>) || t == typeof(Nullable<DateTime>) ||
                    t == typeof(Nullable<decimal>) || t == typeof(Nullable<float>) || t == typeof(Nullable<double>) ||
                    t == typeof(Nullable<long>))
                {
                    var val = pi.GetValue(copy);
                    pi.SetValue(main, val);
                }
            }
        }

        public static object QueryStringToObject(string querystring)
        {
            var dict = HttpUtility.ParseQueryString(querystring);
            var qrtstrDict = dict.AllKeys.ToDictionary(key => key, key => dict[key]);
            var jsons = JsonConvert.SerializeObject(qrtstrDict);
            var jsond = JsonConvert.DeserializeObject(jsons);

            return jsond;
        }
        public static T DynamicToModel<T>(dynamic obj)
        {
            string jsonX = Newtonsoft.Json.JsonConvert.SerializeObject(obj);
            return Newtonsoft.Json.JsonConvert.DeserializeObject<T>(jsonX);
        }
    }
}
