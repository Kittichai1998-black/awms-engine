using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Criteria
{
    public class KeyGetSetCriteria
    {
        public string KeyLocalVar;
        public string KeyGlobalVar;
        public KeyGetSetCriteria(string keyLocalVar, string keyGlobalVar)
        {
            this.KeyLocalVar = keyLocalVar;
            this.KeyGlobalVar = keyGlobalVar;
        }
    }
}
