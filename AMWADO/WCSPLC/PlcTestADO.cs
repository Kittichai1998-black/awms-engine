using AMSModel.Constant.EnumConst;
using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace ADO.WCSPLC
{
    public class PlcTestADO : BasePlcADO<PlcTestADO>
    {
        private Dictionary<string, object> datas;
        private void IPlcADO()
        {
            this.datas = new Dictionary<string, object>();
        }

        public override double GetDevicelDouble(string key)
        {
            return datas.ContainsKey(key) ? datas[key].Get<double>() : 0;
        }

        public override float GetDevicelFloat(string key)
        {
            return datas.ContainsKey(key) ? datas[key].Get<float>() : 0;
        }

        public override int GetDevicelInt(string key)
        {
            return datas.ContainsKey(key) ? datas[key].Get<int>() : 0;
        }

        public override long GetDevicelLong(string key)
        {
            return datas.ContainsKey(key) ? datas[key].Get<long>() : 0;
        }

        public override short GetDevicelShot(string key)
        {
            if (datas.ContainsKey(key))
                return datas[key].Get<short>();
            return 0;
        }

        public override string GetDevicelString(string key, int length)
        {
            return datas.ContainsKey(key) ? datas[key].Get<string>() : "";
        }

        public override void SetDevicelString(string key, string value)
        {
            datas.Add(key, value);
        }

        public override void SetDevicelShot(string key, short value)
        {
            datas.Add(key, value);
        }

        public override void SetDevicelInt(string key, int value)
        {
            datas.Add(key, value);
        }

        public override void SetDevicelLong(string key, long value)
        {
            datas.Add(key, value);
        }

        public override void SetDevicelFloat(string key, float value)
        {
            datas.Add(key, value);
        }

        public override void SetDevicelDouble(string key, double value)
        {
            datas.Add(key, value);
        }

        public override void Open()
        {
        }

        public override void Close()
        {

        }
    }
}
