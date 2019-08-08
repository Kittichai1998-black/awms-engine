using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Common
{
    public class RefVO<T>
    {
        private VOCriteria DicObject { get; }
        private string Key { get; }
        public RefVO(VOCriteria dicObject, string key)
        {
            this.DicObject = dicObject;
            this.Key = key;
        }
        public Type ValueType()
        {
            return (Type)this.Value.GetType();
        }
        public T Value
        {
            get => this.DicObject.Get<T>(this.Key);
            set => this.DicObject.Set(this.Key, value);
        }
    }
}
