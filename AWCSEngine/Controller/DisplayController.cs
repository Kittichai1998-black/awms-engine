using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace AWCSEngine.Controller
{
    public static class DisplayController
    {
        private static object _Lock_McLists = new object();
        private static List<string> _McLists = new List<string>();
        public static void McLists_Write(string mcCode, string msg)
        {
            lock (_Lock_McLists)
            {
                var index = _McLists.FindIndex(x => x.StartsWith(mcCode + ","));
                if (index >= 0)
                {
                    _McLists[index] = $"{mcCode},1,{msg}";
                }
                else
                {
                    _McLists.Add($"{mcCode},1,{msg}");
                    _McLists.Sort();
                }
            }
        }
        public static List<KeyValuePair<int, string>> McLists_Reading()
        {
            lock (_Lock_McLists)
            {
                List<KeyValuePair<int, string>> res = new List<KeyValuePair<int, string>>();
                for (int i = 0; i < _McLists.Count; i++)
                {
                    if (Regex.IsMatch(_McLists[i], "^[^,]+,1,"))
                    {
                        var msg = _McLists[i].Split(',', 3);
                        res.Add(new KeyValuePair<int, string>(i, msg.Last()));
                        _McLists[i] = $"{msg.First()},0,{msg.Last()}";
                    }
                }
                return res;
            }
        }
        public static string McLists_Message(string mcCode)
        {
            lock (_Lock_McLists)
            {
                var mcMsg = _McLists.FirstOrDefault(x=>x.StartsWith(mcCode+","));
                if (mcMsg == null) return string.Empty;
                var mcMsg2 = mcMsg.Split(",");
                return mcMsg2[2];
            }
        }


        private static object _Lock_Events = new object();
        private static List<string> _Events = new List<string>();
        public static void Events_Write(string msg)
        {
            lock (_Lock_Events)
            {
                _Events.Add(msg);
            }
        }

        public static List<string> Events_Reading()
        {
            lock (_Lock_Events)
            {
                var res = _Events.ToList();
                _Events.Clear();
                return res;
            }
        }
    }
}
