using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace ADO.WCSPLC
{
    public class PlcKepwareADO : IPlcADO
    {
        private static Dictionary<int, PlcKepwareADO> instants;
        public IPlcADO GetInstant(int logicalNum)
        {
            if (PlcKepwareADO.instants == null)
            {
                PlcKepwareADO.instants = new Dictionary<int, PlcKepwareADO>();
            }
            if (!PlcKepwareADO.instants.ContainsKey(logicalNum))
                PlcKepwareADO.instants.Add(logicalNum, new PlcKepwareADO());
            return instants[logicalNum];
        }

        public double GetDevicelDouble(string key)
        {
            throw new NotImplementedException();
        }

        public float GetDevicelFloat(string key)
        {
            throw new NotImplementedException();
        }

        public int GetDevicelInt(string key)
        {
            throw new NotImplementedException();
        }

        public long GetDevicelLong(string key)
        {
            throw new NotImplementedException();
        }

        public short GetDevicelShot(string key)
        {
            throw new NotImplementedException();
        }

        public string GetDevicelString(string key, int length)
        {
            throw new NotImplementedException();
        }

        public void SetDevicelString(string key, string value)
        {
            throw new NotImplementedException();
        }

        public void SetDevicelShot(string key, short value)
        {
            throw new NotImplementedException();
        }

        public void SetDevicelInt(string key, int value)
        {
            throw new NotImplementedException();
        }

        public void SetDevicelLong(string key, long value)
        {
            throw new NotImplementedException();
        }

        public void SetDevicelFloat(string key, float value)
        {
            throw new NotImplementedException();
        }

        public void SetDevicelDouble(string key, double value)
        {
            throw new NotImplementedException();
        }
    }
}
