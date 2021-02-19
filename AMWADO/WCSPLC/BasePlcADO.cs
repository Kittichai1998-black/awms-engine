using ADO.WCSPLC;
using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace ADO.WCSPLC
{
    public abstract class BasePlcADO<T> : IPlcADO
        where T : BasePlcADO<T>
    {
        private static Dictionary<string,T> instants;

        protected BasePlcADO()
        {
        }

        public static T GetInstant(string logicalNum)
        {
            if (instants == null)
            {
                instants = new Dictionary<string, T>();
            }
            string dirKey = typeof(T).Name + "_" + logicalNum;
            if (!instants.ContainsKey(dirKey))
            {
                T newInst = (T)Activator.CreateInstance(typeof(T), new object[] { });
                newInst.LogicalNum = logicalNum;
                newInst.Open();
                instants.Add(dirKey, newInst);
            }
            return instants[dirKey];
        }

        public string LogicalNum { get; private set; }
        public abstract void Open();
        public abstract void Close();
        public abstract string GetDevicelString(string key, int length);
        public abstract short GetDevicelShot(string key);
        public abstract int GetDevicelInt(string key);
        public abstract long GetDevicelLong(string key);
        public abstract float GetDevicelFloat(string key);
        public abstract double GetDevicelDouble(string key);

        public abstract void SetDevicelString(string key, string value);
        public abstract void SetDevicelShot(string key, short value);
        public abstract void SetDevicelInt(string key, int value);
        public abstract void SetDevicelLong(string key, long value);
        public abstract void SetDevicelFloat(string key, float value);
        public abstract void SetDevicelDouble(string key, double value);

    }
}
