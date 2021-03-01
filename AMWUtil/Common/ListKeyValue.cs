using System;
using System.Collections.Generic;
using System.Text;

namespace AMWUtil.Common
{
    public class ListKeyValue<TKey,TVal>
    {
        public List<KeyValuePair<TKey, TVal>> Items { get; set; }
        public ListKeyValue()
        {
            this.Items = new List<KeyValuePair<TKey, TVal>>();
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
