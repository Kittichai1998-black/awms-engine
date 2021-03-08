using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AMWUtil.Common
{
    public class ListKeyValue<TKey,TVal>
    {
        public static ListKeyValue<TKey, TVal> New(TKey key, TVal val)
        {
            var res = new ListKeyValue<TKey,TVal>(key, val);
            return res;
        }
        public List<KeyValuePair<TKey, TVal>> Items { get; set; }
        public ListKeyValue()
        {
            this.Items = new List<KeyValuePair<TKey, TVal>>();
        }
        public KeyValuePair<TKey, TVal>[] ToArray()
        {
            return this.Items.ToArray();
        }
        public string ToQryStr()
        {
            var vals = this.Items.Select(x => new KeyValuePair<string, string>(
                     x.Key.Get2<string>(), x.Value.Get2<string>())).ToArray();
            return ObjectUtil.ListKeyToQryStr(vals);
        }
        public ListKeyValue(TKey key, TVal val) : this()
        {
            this.Items.Add(new KeyValuePair<TKey, TVal>(key, val));
        }
        public ListKeyValue<TKey,TVal> Add(TKey key,TVal val)
        {
            this.Items.Add(new KeyValuePair<TKey, TVal>(key, val));
            return this;
        }
        public TVal Get(TKey key)
        {
            return this.Items.Find(x => x.Key.Equals(key)).Value;
        }
    }
}
