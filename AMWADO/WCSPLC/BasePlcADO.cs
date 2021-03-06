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
        public long PlcLostTicks { get; set; }

        protected BasePlcADO()
        {
        }

        public static object _lock = new object();
        public static T GetInstant(string plcDeviceName)
        {
            lock (_lock)
            {

                if (instants == null)
                {
                    instants = new Dictionary<string, T>();
                }
                string dirKey = typeof(T).Name + "_" + plcDeviceName;
                if (!instants.ContainsKey(dirKey))
                {
                    T newInst = (T)Activator.CreateInstance(typeof(T), new object[] { });
                    newInst.PlcDeviceName = plcDeviceName;
                    //newInst.IsConnect = false;
                    newInst.Open();
                    instants.Add(dirKey, newInst);
                }
                return instants[dirKey];
            }
        }
        public static List<T> ListInstant()
        {
            List<T> res = new List<T>();
            foreach (var r in instants)
            {
                res.Add(r.Value);
            }
            return res;
        }

        public string PlcDeviceName { get; private set; }
        public abstract bool IsConnect { get; set; }
        public abstract bool IsCheckCCONN { get; protected set; }

        public abstract void Open();
        public abstract void Close();
        public abstract T1 GetDevice<T1>(string key);
        public abstract string GetDeviceString(string key, int length);
        public abstract void SetDevice<T1>(string key, T1 val);
        public abstract void SetDeviceString(string key, string val, int length);

    }
}
