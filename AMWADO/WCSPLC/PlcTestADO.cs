using AMSModel.Constant.EnumConst;
using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace ADO.WCSPLC
{
    public class PlcTestADO : BasePlcADO<PlcTestADO>
    {
        private Dictionary<string, object> datas = new Dictionary<string, object>();
        private void IPlcADO()
        {
        }


        public override void Open()
        {
        }

        public override void Close()
        {

        }

        public override T1 GetDevice<T1>(string key)
        {
            return this.datas.ContainsKey(key) ? (T1)this.datas[key] : default(T1);
        }

        public override string GetDeviceString(string key, int length)
        {
            return this.datas.ContainsKey(key) ? (string)this.datas[key] : default(string);
        }

        public override void SetDevice<T1>(string key, T1 val)
        {
            if (this.datas.ContainsKey(key))
                this.datas[key] = val;
            else
                this.datas.Add(key, val);
        }

        public override void SetDeviceString(string key, string val, int length)
        {
            if (this.datas.ContainsKey(key))
                this.datas[key] = val;
            else
                this.datas.Add(key, val);
        }
    }
}
