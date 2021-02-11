using AMSModel.Constant.EnumConst;
using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace ADO.WCSPLC
{
    public class PlcTestADO : IPlcADO
    {
        private Dictionary<string, object> datas;
        private static Dictionary<int, PlcTestADO> instants;
        public IPlcADO GetInstant(int logicalNum)
        {
            if (PlcTestADO.instants == null)
            {
                PlcTestADO.instants = new Dictionary<int, PlcTestADO>();
            }
            if (!PlcTestADO.instants.ContainsKey(logicalNum))
                PlcTestADO.instants.Add(logicalNum, new PlcTestADO());
            return instants[logicalNum];
        }
        private void IPlcADO()
        {
            this.datas = new Dictionary<string, object>();
        }

        public double GetDevicelDouble(string key)
        {
            return datas.ContainsKey(key) ? datas[key].Get<double>() : 0;
        }

        public float GetDevicelFloat(string key)
        {
            return datas.ContainsKey(key) ? datas[key].Get<float>() : 0;
        }

        public int GetDevicelInt(string key)
        {
            return datas.ContainsKey(key) ? datas[key].Get<int>() : 0;
        }

        public long GetDevicelLong(string key)
        {
            return datas.ContainsKey(key) ? datas[key].Get<long>() : 0;
        }

        public short GetDevicelShot(string key)
        {
            if (datas.ContainsKey(key))
                return datas[key].Get<short>();
            return 0;
        }

        public string GetDevicelString(string key, int length)
        {
            return datas.ContainsKey(key) ? datas[key].Get<string>() : "";
        }

        public void SetDevicelString(string key, string value)
        {
            datas.Add(key, value);
        }

        public void SetDevicelShot(string key, short value)
        {
            datas.Add(key, value);
        }

        public void SetDevicelInt(string key, int value)
        {
            datas.Add(key, value);
        }

        public void SetDevicelLong(string key, long value)
        {
            datas.Add(key, value);
        }

        public void SetDevicelFloat(string key, float value)
        {
            datas.Add(key, value);
        }

        public void SetDevicelDouble(string key, double value)
        {
            datas.Add(key, value);
        }
    }
}
