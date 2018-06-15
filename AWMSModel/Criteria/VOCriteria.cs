using System;
using System.Collections.Generic;
using System.Text;
using Z.Expressions;

namespace AWMSModel.Criteria
{
    public class VOCriteria
    {
        private Dictionary<string, dynamic> VO { get; set; }
        public VOCriteria()
        {
            this.VO = new Dictionary<string, dynamic>();
        }
        public void Set(string key, dynamic val)
        {
            if (key.StartsWith("*"))
                key = key.Substring(1);
            if (!this.VO.ContainsKey(key))
                this.VO.Add(key, val);
            else
                this.VO[key] = val;
        }
        public void SetRang(VOCriteria vo)
        {
            foreach(var kv in vo.List())
            {
                this.Set(kv.Key, kv.Value);
            }
        }
        public List<KeyValuePair<string,dynamic>> List()
        {
            List<KeyValuePair<string, dynamic>> res = new List<KeyValuePair<string, dynamic>>();
            foreach(string k in this.VO.Keys)
            {
                res.Add(new KeyValuePair<string, dynamic>(k, this.VO[k]));
            }
            return res;
        }
        public T Get<T>(string key)
        {
            string[] k = key.Split('.', 2);
            if (this.VO.ContainsKey(k[0]))
            {
                if(k.Length == 1)
                    return this.VO[k[0]];
                else
                    return Eval.Execute<T>("return obj." + k[1], new { obj = this.VO[k[0]] });
            }
            throw new Exception("VO Key " + key + " not found");
        }
        public T Get<T>(string key, T defualt)
        {
            try
            {
                return this.Get<T>(key);
            }
            catch
            {
                return defualt;
            }
        }
        public string GetString(string key)
        {
            try
            {
                var res = this.Get<string>(key);
                return res.ToString();
            }
            catch
            {
                return null;
            }
        }
        public dynamic GetDynamic(string key)
        {
            try
            {
                var res = this.Get<dynamic>(key);
                return res;
            }
            catch(Exception ex)
            {
                return null;
            }
        }
        public override string ToString()
        {
            return Newtonsoft.Json.JsonConvert.SerializeObject(this.VO);
        }
    }
}
