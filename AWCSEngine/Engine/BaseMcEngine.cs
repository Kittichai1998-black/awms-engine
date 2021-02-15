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

namespace AWCSEngine.Engine
{
    public abstract class BaseMcEngine : IDisposable
    {
        protected abstract void ExecuteChild(act_McWork mcObj);
        protected int LogDay { get; set; }
        protected acs_McMaster McMst { get; private set; }
        protected act_McWork McWork { get; private set; }
        private act_McWork McWorkTmp { get; set; }

        private VOCriteria BuVO { get; set; }
        private AMWLogger Logger { get => this.BuVO.Logger; set => this.BuVO.Logger = value; }

        //public McObjectStatus McEngineStatus { get; private set; }
        public long ID { get => this.McMst.ID.Value; }
        public string Code { get => this.McMst.Code; }
        public string MessageLog { get; set; }
        public BaseMcEngine(acs_McMaster mcMst)
        {
            this.McMst = mcMst;
            this.McWork = McWorkADO.GetInstant().GetByMstID(this.McMst.ID.Value, this.BuVO);
            McController.GetInstant().AddMC(this);
            this.BuVO = new VOCriteria();
        }

        public void Initial()
        {
            this.Logger = AMWLoggerManager.GetLogger("Machine", this.McMst.Code);
            this.LogDay = DateTime.Now.Day;
            this.Logger.LogInfo("########### BEGIN MACHINE ###########");
            string mcMstStr = this.McMst.Json();
            this.Logger.LogInfo("McMst > " + mcMstStr);
            string mcWorkStr = this.McWork.Json();
            this.Logger.LogInfo("McWork > " + mcWorkStr);
        }

        private void UpdateMcWork_OnChange()
        {
            try
            {
                if (this.McWork.CompareFields(McWorkTmp))
                {
                    DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork, this.BuVO);
                    this.McWork = DataADO.GetInstant().SelectByID<act_McWork>(this.McWork.ID.Value, this.BuVO);
                    this.McWorkTmp = this.McWork.Clone();
                }
            }
            catch(Exception ex)
            {
                new AMWException(this.Logger, AMWExceptionCode.S0005, ex.Message);
            }
        }


        public void Command(McCommand comm,string locCode)
        {
            if(this.McWork.EventStatus == McObjectEventStatus.IDEL)
            {
                McWork.EventStatus = McObjectEventStatus.WORK;
                McWork.Command = comm;
                if (string.IsNullOrWhiteSpace(locCode))
                {
                    var loc = StaticValueManager.GetInstant().Location.FirstOrDefault(x => x.Code == locCode);
                    if (loc == null)
                        throw new AMWUtil.Exception.AMWException(this.Logger, AMWUtil.Exception.AMWExceptionCode.V0_LOCATION_NOT_FOUND);
                    this.McWork.Des_Location_ID = loc.ID.Value;
                }
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V0_MC_NOT_IDEL);
            }
        }

        public void Execute()
        {

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
            this.UpdateMcWork_OnChange();

        }

        public void Dispose()
        {
            string mcMstStr = this.McMst.Json();
            this.Logger.LogInfo("McMst > " + mcMstStr);
            string mcWorkStr = this.McWork.Json();
            this.Logger.LogInfo("McWork > " + mcWorkStr);
            this.UpdateMcWork_OnChange();
            this.Logger.LogInfo("########### END MACHINE ###########");
        }
    }
}
