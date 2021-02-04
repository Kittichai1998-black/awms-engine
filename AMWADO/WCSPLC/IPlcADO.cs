using System;
using System.Collections.Generic;
using System.Text;

namespace ADO.WCSPLC
{
    public interface IPlcADO
    {
        public IPlcADO GetInstant(int logicalNum);
        public string GetDevicelString(string key, int length);
        public short GetDevicelShot(string key);
        public int GetDevicelInt(string key);
        public long GetDevicelLong(string key);
        public float GetDevicelFloat(string key);
        public double GetDevicelDouble(string key);
    }
}
