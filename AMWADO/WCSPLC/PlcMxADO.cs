using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace ADO.WCSPLC
{
    public class PlcMxADO : BasePlcADO<PlcMxADO>
    {
        public override void Close()
        {
            throw new NotImplementedException();
        }

        public override T1 GetDevice<T1>(string key)
        {
            throw new NotImplementedException();
        }

        public override string GetDeviceString(string key, int length)
        {
            throw new NotImplementedException();
        }

        public override void Open()
        {
            throw new NotImplementedException();
        }

        public override void SetDevice<T1>(string key, T1 val)
        {
            throw new NotImplementedException();
        }

        public override void SetDeviceString(string key, string val, int length)
        {
            throw new NotImplementedException();
        }
    }
}
