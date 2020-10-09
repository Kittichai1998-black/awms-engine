using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace AMWUtil.PropertyFile
{
    public class PropertyFileManager
    {
        private Dictionary<string,Dictionary<string,string>> PropertyFiles { get; set; }

        private static PropertyFileManager instant;
        public static PropertyFileManager GetInstant()
        {
            if (instant == null)
                instant = new PropertyFileManager();
            return instant;
        }

        private PropertyFileManager()
        {
            this.PropertyFiles = new Dictionary<string, Dictionary<string, string>>();
        }

        public void AddPropertyFile(string key, string path)
        {
            this.AddPropertyFile(new KeyValuePair<string, string>(key, path));
        }
        public void AddPropertyFile(params KeyValuePair<string,string>[] paths)
        {
            foreach(var p in paths)
            {
                using (var sr = new StreamReader(p.Value))
                {
                    var property = new Dictionary<string, string>();
                    this.PropertyFiles.Add(p.Key, property);
                    while (!sr.EndOfStream)
                    {
                        string line = sr.ReadLine().Trim();
                        if (!line.StartsWith("#") &&        //First Character # is Line Comment
                            !string.IsNullOrEmpty(line))
                        {
                            string[] kv = line.Split('=', 2);
                            property.Add(
                                kv.Length > 0 ? kv[0].Trim() : string.Empty,    //KEY
                                kv.Length > 1 ? kv[1].Trim() : string.Empty);   //VALUE
                        }
                    }
                }
            }
        }

        public Dictionary<string, string> GetProperty(string group)
        {
            if (this.PropertyFiles.ContainsKey(group))
                return this.PropertyFiles[group];
            return null;
        }
        public string GetProperty(string group, string key)
        {
            if (this.PropertyFiles.ContainsKey(key))
                return !this.PropertyFiles.ContainsKey(key) ? null : 
                            !this.PropertyFiles[group].ContainsKey(key) ? null :
                                this.PropertyFiles[group][key];
            return null;
        }
    }
}
