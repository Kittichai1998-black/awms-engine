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

namespace AWCSEngine.Engine
{
    public abstract class BaseMcEngine
    {
        protected abstract void ExecuteChild(act_McWork mcObj);
        protected int LogDay { get; set; }
        protected acs_McMaster McMst { get; private set; }
        protected act_McWork McWork { get; private set; }

        private VOCriteria BuVO { get; set; }
        private AMWLogger Logger { get => this.BuVO.Logger; set => this.BuVO.Logger = value; }

        //public McObjectStatus McEngineStatus { get; private set; }
        public long ID { get => this.McMst.ID.Value; }
        public string Code { get => this.McMst.Code; }
        public string MessageLog { get; set; }
        public BaseMcEngine(acs_McMaster mcMst)
        {
            this.McMst = mcMst;
            McController.GetInstant().AddMC(this);
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
            this.McWork = McWorkADO.GetInstant().GetByMstID(this.McMst.ID.Value, this.BuVO);

            if (this.McWork == null || this.McWork.Status != EntityStatus.ACTIVE) { this.MessageLog = "Offline"; return; }

            this.MessageLog = "Status.PLC=" +
            this.McWork.PlcStatus.ToString() +
            " | Status.Evt=" +
            this.McWork.EventStatus.ToString() +
            " | Pos.This=" +
            (this.McWork.Des_Location_ID.HasValue ?
                StaticValueManager.GetInstant().GetLocation(this.McWork.Location_ID.Value).Code : "") +
            " | Pos.Sou=" +
            (this.McWork.Des_Location_ID.HasValue ?
                StaticValueManager.GetInstant().GetLocation(this.McWork.Sou_Location_ID.Value).Code : "") +
            " | Pos.Des=" +
            (this.McWork.Des_Location_ID.HasValue ?
                StaticValueManager.GetInstant().GetLocation(this.McWork.Des_Location_ID.Value).Code : "");

            if (this.LogDay != DateTime.Now.Day)
            {
                this.Logger = AMWLoggerManager.GetLogger("Machine", McMst.Code);
            }
            this.ExecuteChild(this.McWork);

        }

    }
}
