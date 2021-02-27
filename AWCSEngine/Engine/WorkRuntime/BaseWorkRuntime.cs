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

namespace AWCSEngine.Engine.WorkRuntime
{
    public abstract class BaseWorkRuntime : BaseEngine<NullCriteria, NullCriteria>, IDisposable
    {
        protected abstract void OnStart();
        protected abstract void OnRun();
        protected abstract void OnStop();
        protected McRuntimeController McController;
        public BaseWorkRuntime(string logref) : base(logref)
        {
            this.McController = McRuntimeController.GetInstant();
            this.OnStart();
        }

        protected override string BaseLogName()
        {
            return "McWork";
        }

        public void Execute()
        {
            base.Execute(null);
        }
        protected override NullCriteria ExecuteChild(NullCriteria req)
        {
            this.OnRun();
            return null;
        }

        public void Dispose()
        {
            this.OnStop();
        }
    }
}
