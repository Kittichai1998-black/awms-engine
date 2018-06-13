using System;
using System.Collections.Generic;
using System.Text;

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
            if (this.VO.ContainsKey(key))
                this.VO[key] = val;
            this.VO.Add(key, val);
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
        public T? Get<T>(string key) where T : struct
        {
            if (this.VO.ContainsKey(key))
                return this.VO[key];
            return null;
        }
        public string GetString(string key)
        {
            if (this.VO.ContainsKey(key))
                return this.VO[key];
            return null;
        }
        public dynamic GetDynamic(string key)
        {
            if (this.VO.ContainsKey(key))
                return this.VO[key];
            return null;
        }
        public override string ToString()
        {
            /*StringBuilder strb = new StringBuilder();
            foreach(var k in this.vo.Keys)
            {
                strb.AppendFormat("{0} = {1} |", k,   this.vo[k]);
            }*/
            return Newtonsoft.Json.JsonConvert.SerializeObject(this.VO);
        }
    }
}
