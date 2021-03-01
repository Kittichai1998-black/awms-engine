using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;

namespace AMWUtil.Common
{
    public static class ObjectUtil
    {
        private static object GenUniqID_Lock = new object();
        private static int GenUniqID_Run = 0;
        public static string GenUniqID()
        {
            lock (GenUniqID_Lock)
            {
                var d = DateTime.UtcNow;
                long t = d.Second +
                    (d.Minute * 60) +
                    (d.Hour * 60 * 60) +
                    (d.DayOfYear * 60 * 60 * 24) +
                    (d.Year % 100 * 60 * 60 * 24 * 366);
                GenUniqID_Run = GenUniqID_Run >= 1296 ? 0 : GenUniqID_Run + 1;
                string id = NumZ(t, 0) + NumZ(GenUniqID_Run, 2);
                return id;
            }
        }

        public static string NumZ(long num, int space = 10)
        {
            string res = string.Empty;
            while (num > 0)
            {
                long val = num % 36;
                if (val < 10)
                {
                    res = val + res;
                }
                else
                {
                    res = (char)(65 + (val - 10)) + res;
                }
                num = num / 36;
            }
            return res + (new String('0', space - res.Length > 0 ? space - res.Length : 0));
        }

        public static bool CompareFields<T>(this T model1,T model2)
        {
            foreach (var f1 in model1.GetType().GetFields())
            {
                if (f1.GetValue(model1) != f1.GetValue(model2))
                    return false;
            }
            foreach (var f1 in model1.GetType().GetProperties())
            {
                if (f1.GetValue(model1) != f1.GetValue(model2))
                    return false;
            }
            return true;
        }

        public static T ConvertTextFormatToModel<T>(string txt,string format)
            where T : class, new()
        {
            T t = new T();
            txt = txt.Replace("|", "&pi;");
            format = format.Replace("|", "&pi;");
            var fKeys = Regex.Matches(format, "{[^}]*}");
            string f2 = format;// Regex.Replace(format, "{[^}]*}", "(.*)");
            for (int i = 0; i < fKeys.Count(); i++)
            {
                var k = fKeys[i].Value.Substring(1, fKeys[i].Value.Length - 2).Split(":",2);
                if (k.Length == 1)
                    f2 = Regex.Replace(f2, fKeys[i].Value, "(.*)");
                else
                    f2 = Regex.Replace(f2, fKeys[i].Value, "(.{" + k[1].Trim() + "})");
            }

            if (!Regex.IsMatch(txt, "^" + f2 + "$"))
                return null;

            string fValsReplate = string.Empty;
            for (int i = 1; i <= fKeys.Count(); i++)
            {
                if (!string.IsNullOrEmpty(fValsReplate))
                    fValsReplate += "&Split;";
                fValsReplate += "$"+i;
            }
            var fVals = Regex.Replace(txt, f2, fValsReplate).Split("&Split;");

            for (int i = 0; i < fKeys.Count(); i++)
            {
                var k = fKeys[i].Value.Substring(1, fKeys[i].Value.Length - 2).Split(":",2)[0].Trim();
                var v = fVals[i];
                var field1 = t.GetType().GetField(k);
                var prop1 = t.GetType().GetProperty(k);
                if (field1 != null)
                    field1.SetValue(t, v);
                else if (prop1 != null)
                    prop1.SetValue(t, v);
            }

            return t;
        }

        public static void Set2(this object o, string field_name, object value)
        {
            o.GetType().GetField(field_name).SetValue(o, value);
        }
        public static object Get2(this object o, string field_name)
        {
            return o.GetType().GetField(field_name).GetValue(o);
        }
        public static T Get2<T>(this object o, string name)
        {
            return o.GetType().GetField(name).GetValue(o).Get2<T>();
        }
        public static T Get2<T>(this object o)
        {
            if (o == null) return default(T);
            return o.ToString().Get2<T>();
        }
        public static T? Get2Try<T>(this object o)
            where T : struct
        {
            return o.ToString().Get2Try<T>();
        }
        public static T Get2<T>(this string s)
        {
            if (typeof(T) == typeof(string)) return (T)(object)s;
            if (typeof(T) == typeof(bool)) return (T)(object)bool.Parse(s);
            if (typeof(T) == typeof(int)) return (T)(object)int.Parse(s);
            if (typeof(T) == typeof(decimal)) return (T)(object)decimal.Parse(s);
            if (typeof(T) == typeof(double)) return (T)(object)double.Parse(s);
            if (typeof(T) == typeof(float)) return (T)(object)float.Parse(s);
            if (typeof(T) == typeof(long)) return (T)(object)long.Parse(s);
            if (typeof(T) == typeof(short)) return (T)(object)short.Parse(s);
            if (typeof(T) == typeof(DateTime))
            {
                if(s.Contains("\\") || s.Contains("-"))
                {
                    return (T)(object)s.Cast2<DateTime>();
                }
                else
                {
                    var strDatetime = DateTime.ParseExact(s, "yyyyMMdd", CultureInfo.InvariantCulture).ToString("yyyy-MM-dd");
                    return (T)(object)DateTime.Parse(strDatetime);
                }
            }

            throw new System.Exception("Type " + typeof(T) + " Not Support.");
        }
        public static T? Get2Try<T>(this string s)
            where T : struct
        {
            try
            {
                return s.Get2<T>();
            }
            catch
            {
                return null;
            }
        }
        public static T[] Get2<T>(this string[] s)
            where T : struct
        {
            return s.Select(x => x.Get2<T>()).ToArray();
        }
        public static T?[] Get2Try<T>(this string[] s)
            where T : struct
        {
            return s.Select(x => x.Get2Try<T>()).ToArray();
        }

        public static string RegexReplate(this string input, string pattern, string replacement)
        {
            return Regex.Replace(input, pattern, replacement);
        }


        public static TDes Cast2<TDes>(this object data)
        {
            return data.Json().Json<TDes>();
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
        public static object EmptyToNull(object obj)
        {
            return IsEmptyNull(obj) ? null : obj;
        }
        public static string TrimNull(this string item)
        {
            if (string.IsNullOrWhiteSpace(item)) return string.Empty;
            return item.Trim();
        }
        public static bool IsBetween<T>(this T item, System.Nullable<T> start, System.Nullable<T> end) where T : struct
        {
            return (!start.HasValue || Comparer<T>.Default.Compare(item, start.Value) >= 0)
                && (!end.HasValue || Comparer<T>.Default.Compare(item, end.Value) <= 0);
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
        public static string ListKeyToQryStr(params KeyValuePair<string, string>[] param)
        {
            if (param == null) return string.Empty;
            return ListKeyToQryStr(Enumerable.ToList(param));
        }
        public static string ListKeyToQryStr(params KeyValuePair<string, object>[] param)
        {
            if (param == null) return string.Empty;
            return ListKeyToQryStr(Enumerable.ToList(param.Select((KeyValuePair<string, object> x) => new KeyValuePair<string, string>(x.Key, (string)x.Value))));
        }
        public static string ListKeyToQryStr(List<KeyValuePair<string, object>> param)
        {
            if (param == null) return string.Empty;
            return ListKeyToQryStr(Enumerable.ToList(param.Select((KeyValuePair<string, object> x) => new KeyValuePair<string, string>(x.Key, (string)x.Value))));
        }
        public static string ListKeyToQryStr(List<KeyValuePair<string, string>> param)
        {
            if (param == null) return string.Empty;
            StringBuilder res = new StringBuilder();
            foreach (KeyValuePair<string, string> p in param)
            {
                if (res.Length > 0) res.Append("&");
                res.Append(p.Key);
                res.Append("=");
                res.Append(p.Value.Replace("&", "%26").Replace("=", "%3D"));
            }
            return res.ToString();
        }
        public static Dictionary<string, string> QryStrToDictionary(string param)
        {
            Dictionary<string, string> res = new Dictionary<string, string>();
            var values = QryStrToKeyValues(param);

            foreach (KeyValuePair<string, string> v in values)
            {
                res.Add(v.Key, v.Value);
            }

            return res;
        }

        public static List<KeyValuePair<string, string>> QryStrToKeyValues(this string param)
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
        public static List<string> QryStrToListKeys(this string param)
        {
            List<string> res = new List<string>();
            QryStrToKeyValues(param).ForEach(x => res.Add(x.Key));
            return res;
        }
        public static string QryStrGetValue(this string param, string key)
        {
            var match = Regex.Match("?" + param + "&", "[&?]" + key + "=([^&]*)");
            string res = Regex.Replace(match.Value, "^[?&]*" + key + "=|[&]*$", "");
            return res;
        }
        public static string QryStrSetValue(this string param, params KeyValuePair<string, object>[] values)
        {
            var kv = QryStrToKeyValues(param);
            foreach (var v in values)
            {
                kv.RemoveAll(x => x.Key == v.Key);
                kv.Add(new KeyValuePair<string, string>(v.Key, string.Format("{0}", v.Value)));
            }
            var res = ListKeyToQryStr(kv);
            return res;
        }
        public static string QryStrSetValue(this string param, string key, object value)
        {
            var kv = QryStrToKeyValues(param);
            kv.RemoveAll(x => x.Key == key);
            kv.Add(new KeyValuePair<string, string>(key, string.Format("{0}", value)));

            var res = ListKeyToQryStr(kv);
            return res;
        }
        public static bool QryStrContainsKey(this string param, string key)
        {
            var val = QryStrGetValue(param, key);
            //string res = Regex.Replace(match.Value, "^[?&]*|[&]*$", "");
            return !string.IsNullOrWhiteSpace(val);
        }
        public static bool QryStrContainsKeyValue(this string param, string param_contains)
        {
            return param_contains.Split('&').ToList().TrueForAll(y => param.Contains(y));
        }


        public static T KeyValueToObject<T>(List<KeyValuePair<string, object>> values)
            where T : new()
        {
            T res = new T();
            foreach (var v in values)
            {
                FieldInfo fi = res.GetType().GetField(v.Key);
                if (fi != null)
                {
                    fi.SetValue(res, v.Value);
                }
            }

            return res;
        }
        public static List<KeyValuePair<string, object>> ObjectToKeyValue<T>(T obj)
        {
            List<KeyValuePair<string, object>> res = new List<KeyValuePair<string, object>>();
            FieldInfo[] fis = obj.GetType().GetFields();
            foreach (var fi in fis)
            {
                res.Add(new KeyValuePair<string, object>(fi.Name, fi.GetValue(obj)));
            }

            return res;
        }




        public static dynamic QryStrToDynamic(this string querystring)
        {
            querystring = Regex.Replace(querystring, "^[?]+", "");
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
        public static string DynamicObjectToString(dynamic values, string field)
        {
            string newVal = values[field];
            return newVal;
        }
        public static T ObjectToModel<T>(object obj)
            where T : class
        {
            return DynamicToModel<T>(obj);
        }
        public static T DynamicToModel<T>(dynamic obj)
            where T : class
        {
            if (obj == null) return null;
            string jsonX = Newtonsoft.Json.JsonConvert.SerializeObject(obj);
            return Newtonsoft.Json.JsonConvert.DeserializeObject<T>(jsonX);
        }

        public static List<KeyValuePair<string, object>> PropertieFieldKeyValuePairs<T>(this T obj)
            where T : class
        {
            var res = obj.PropertieKeyValuePairs();
            res.AddRange(obj.FieldKeyValuePairs());
            return res;
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
        public static Dictionary<string,object> FieldDictionary<T>(this T obj)
            where T : class
        {
            Dictionary<string, object> res = new Dictionary<string, object>();
            obj.FieldKeyValuePairs().ForEach(x=> { res.Add(x.Key, x.Value); });
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
        public static T Clone<T>(this T obj)
        {
            return (T)Newtonsoft.Json.JsonConvert.DeserializeObject<T>(Newtonsoft.Json.JsonConvert.SerializeObject(obj));
        }
        public static bool In(this object val, params object[] comps)
        {
            return comps.ToList().Any(x => x == val);
        }
        public static bool In(this string val, params string[] comps)
        {
            return comps.ToList().Any(x => x == val);
        }
        public static string JoinString<T>(this IEnumerable<T> d, char separator = ',')
        {
            return string.Join(separator, d.ToArray());
        }
        public static List<T> RandomList<T>(this IEnumerable<T> d, int percentCount)
        {
            Random rand = new Random();
            List<T> data = d.ToList();
            List<T> res = new List<T>();
            percentCount = percentCount > 100 ? 100 : percentCount;
            int maxCount = (int)Math.Ceiling((float)data.Count() * (percentCount / 100.0f));
            while(res.Count() < maxCount)
            {
                var i = rand.Next(data.Count());
                for (; res.Any(x => x.Equals(data[i])); i = (i + 1 == data.Count() ? 0 : i + 1)) ;
                res.Add(data[i]);
            }
            return res;
        }

        public static string ObjectToQryStr<T>(T obj , string separeator)
        {
            var props = obj.GetType().GetProperties();
            var fields = obj.GetType().GetFields();
            var lst = new List<string>();
            foreach (var field in fields)
            {
                var name = field.Name;
                var value = field.GetValue(obj);
                lst.Add($"{name}={value}");
            }
            foreach (var prop in props)
            {
                var name = prop.Name;
                var value = prop.GetValue(obj);
                lst.Add($"{name}={value}");
            }

            return string.Join(separeator, lst);
        }
        public static string ObjectToQryStr<T>(T obj)
        {
            return ObjectToQryStr(obj, "&");
        }

        public static T QryStringToObject<T>(string qryStr)
        {
            T obj = (T)ObjectUtil.QryStrToDynamic(qryStr);
            return obj;
        }
    }
}
