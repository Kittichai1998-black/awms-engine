using AMWUtil.Common;
using AMWUtil.Logger;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using ADO.WCSDB;
using ADO.WCSStaticValue;
using AWCSEngine.Controller;
using AMWUtil.Exception;

namespace AWCSEngine.Engine.McWorkEngine
{
    public abstract class BaseMcWorkEngine : IDisposable
    {
        public abstract void Execute();

        public void Dispose()
        {
            throw new NotImplementedException();
        }
    }
}
