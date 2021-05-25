using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace ADO.WCSPLC
{
    public interface IPlcADO
    {
        public long PlcLostTicks { get; set; }
        public string PlcDeviceName { get;  }
        public void Open();
        public void Close();

        public bool IsConnect { get; set; }
        public T GetDevice<T>(string key);
        public string GetDeviceString(string key, int length);
        public void SetDevice<T>(string key,T val);
        public void SetDeviceString(string key,string val, int length);

    }
}
