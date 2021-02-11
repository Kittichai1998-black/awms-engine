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

namespace AWCSEngine.Engine
{
    public abstract class BaseMcEngine
    {
        protected abstract void ExecuteChild(act_McObject mcObj);
        protected int LogDay { get; set; }
        protected acs_McMaster McMst { get; private set; }

        private VOCriteria BuVO { get; set; }
        private AMWLogger Logger { get => this.BuVO.Logger; set => this.BuVO.Logger = value; }

        //public McObjectStatus McEngineStatus { get; private set; }

        public BaseMcEngine(acs_McMaster mcMst)
        {
            this.McMst = mcMst;
            this.BuVO = new VOCriteria();
        }

        public void Initial()
        {
            this.Logger = AMWLoggerManager.GetLogger("Machine", this.McMst.Code);
            this.LogDay = DateTime.Now.Day;
            this.Logger.LogInfo("########### START ###########");
            string mcMstStr = this.McMst.Json();
            this.Logger.LogInfo("McMaster > " + mcMstStr);
        }

        public void Execute()
        {
            var mcObj = McObjectADO.GetInstant().GetByMstID(this.McMst.ID.Value, this.BuVO);
            if (this.LogDay != DateTime.Now.Day)
            {
                this.Logger = AMWLoggerManager.GetLogger("Machine", mcObj.Code);
            }
            this.ExecuteChild(mcObj);
        }

    }
}
