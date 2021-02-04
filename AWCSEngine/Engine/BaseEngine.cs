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

namespace AWCSEngine.Engine
{
    public abstract class BaseEngine
    {
        protected abstract void Execute(acs_McMaster mcMst, act_McObject mcObj);
        protected int LogDay { get; set; }

        private Task TaskRun { get; set; }
        private VOCriteria BuVO { get; set; }
        private AMWLogger Logger { get => this.BuVO.Logger; set => this.BuVO.Logger = value; }

        public int McObjectID { get; private set; }
        //public McObjectStatus McEngineStatus { get; private set; }

        public BaseEngine(int mcObjectID)
        {
            this.McObjectID = mcObjectID;
            this.BuVO = new VOCriteria();
        }

        public void Start()
        {
            var mcObj = ADO.WCSDB.DataADO.GetInstant().SelectBy<act_McObject>("ID", this.McObjectID, null).First();
            var mcMst = ADO.WCSDB.DataADO.GetInstant().SelectBy<acs_McMaster>("ID", mcObj.McMaster_ID, null).First();

            this.Logger = AMWLoggerManager.GetLogger("Machine", mcObj.Code);
            this.LogDay = DateTime.Now.Day;
            this.Logger.LogInfo("########### START ###########");
            string mcObjStr = mcObj.Json();
            string mcMstStr = mcMst.Json();
            this.Logger.LogInfo("McMaster > " + mcMstStr);
            this.Logger.LogInfo("McObject > " + mcObjStr);
            this.Run(mcMst,mcObj);
        }

        private void Run(acs_McMaster mcMst, act_McObject mcObj)
        {
            this.TaskRun = Task.Run(() =>
            {
                if (this.LogDay != DateTime.Now.Day)
                {
                    this.Logger = AMWLoggerManager.GetLogger("Machine", mcObj.Code);
                }
                this.Execute(mcMst, mcObj);
                Thread.Sleep(500);
            });
        }

        public bool Stop()
        {
            if(this.TaskRun != null && this.TaskRun.IsCompleted)
            {
                this.TaskRun.Dispose();
                this.TaskRun = null;
                return true;
            }
            return false;
        }
    }
}
