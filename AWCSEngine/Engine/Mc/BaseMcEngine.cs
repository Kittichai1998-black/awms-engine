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

namespace AWCSEngine.Engine.Mc
{
    public abstract class BaseMcEngine : IDisposable
    {
        protected abstract bool OnIdle();
        protected abstract bool OnCommand();
        protected abstract bool OnWorking();
        protected abstract bool OnDone();
        protected abstract bool OnError();
        //protected abstract void OnRun(act_McWork mcObj);
        protected int LogDay { get; set; }
        protected acs_McMaster McMst { get; private set; }
        protected act_McWork McWork { get; private set; }
        private act_McWork McWorkTmp { get; set; }
        private ADO.WCSPLC.IPlcADO PlcADO;

        private VOCriteria BuVO { get; set; }
        private AMWLogger Logger { get => this.BuVO.Logger; set => this.BuVO.Logger = value; }

        //public McObjectStatus McEngineStatus { get; private set; }
        public long ID { get => this.McMst.ID.Value; }
        public string Code { get => this.McMst.Code; }
        public string MessageLog { get; set; }
        public BaseMcEngine(acs_McMaster mcMst)
        {
            this.McMst = mcMst;
        }

        public void Initial()
        {
            this.BuVO = new VOCriteria();
            this.Logger = AMWLoggerManager.GetLogger("Machine", this.McMst.Code);
            this.Logger.LogInfo("########### BEGIN MACHINE ###########");
            this.McWork = McWorkADO.GetInstant().GetByMstID(this.McMst.ID.Value, this.BuVO);
            this.McWorkTmp = this.McWork.Clone();
            this.McWork.EventStatus = McObjectEventStatus.IDEL;
            this.LogDay = DateTime.Now.Day;
            string mcMstStr = this.McMst.Json();
            this.Logger.LogInfo("McMst > " + mcMstStr);
            string mcWorkStr = this.McWork.Json();
            this.Logger.LogInfo("McWork > " + mcWorkStr);
            this.Logger.LogInfo("McController.AddMC()");
            McController.GetInstant().AddMC(this);
        }

        private void UpdateMcWork_OnRun()
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


        public bool Command(McCommand comm, string souLocCode, string desLocCode)
        {
            if(this.McWork.EventStatus == McObjectEventStatus.IDEL)
            {
                McWork.EventStatus = McObjectEventStatus.COMMAND;
                McWork.Command = comm;
                var souLoc = StaticValueManager.GetInstant().Locations.FirstOrDefault(x => x.Code == souLocCode);
                var desLoc = StaticValueManager.GetInstant().Locations.FirstOrDefault(x => x.Code == souLocCode);
                this.McWork.Sou_Location_ID = (souLoc != null ? souLoc.ID : null);
                this.McWork.Des_Location_ID = (desLoc != null ? desLoc.ID : null);

                return true;
            }
            return false;
        }

        public void Runtime()
        {
            try
            {
                if (this.McWork == null || this.McWork.Status != EntityStatus.ACTIVE) { this.MessageLog = "Offline"; return; }

                this.MessageLog = "Status.PLC=" +
                this.McWork.PlcStatus.ToString() +
                " | Status.Evt=" +
                this.McWork.EventStatus.ToString() +
                " | Pos.This=" +
                (this.McWork.Location_ID.HasValue ?
                    StaticValueManager.GetInstant().GetLocation(this.McWork.Location_ID.Value).Code : "") +
                " | Pos.Sou=" +
                (this.McWork.Sou_Location_ID.HasValue ?
                    StaticValueManager.GetInstant().GetLocation(this.McWork.Sou_Location_ID.Value).Code : "") +
                " | Pos.Des=" +
                (this.McWork.Des_Location_ID.HasValue ?
                    StaticValueManager.GetInstant().GetLocation(this.McWork.Des_Location_ID.Value).Code : "");

                if (this.LogDay != DateTime.Now.Day)
                {
                    this.Logger = AMWLoggerManager.GetLogger("Machine", McMst.Code);
                }


                this.UpdateEventStatus_OnRun();
                //this.OnRun(this.McWork);
                this.UpdateMcWork_OnRun();

            }
            catch (AMWException ex)
            {
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex.Message);
            }
            finally
            {

            }
            

        }

        private void UpdateEventStatus_OnRun()
        {
            switch (this.McWork.EventStatus)
            {
                case McObjectEventStatus.IDEL:
                    if (this.OnIdle()) this.McWork.EventStatus = McObjectEventStatus.COMMAND; break;
                case McObjectEventStatus.COMMAND:
                    if (this.OnCommand()) this.McWork.EventStatus = McObjectEventStatus.WORKING; break;
                case McObjectEventStatus.WORKING:
                    if (this.OnWorking()) this.McWork.EventStatus = McObjectEventStatus.DONE; break;
                case McObjectEventStatus.DONE:
                    if (this.OnDone()) this.McWork.EventStatus = McObjectEventStatus.ERROR; break;
                case McObjectEventStatus.ERROR:
                    if (this.OnError()) this.McWork.EventStatus = McObjectEventStatus.COMMAND; break;
            }
        }

        public void Dispose()
        {
            string mcMstStr = this.McMst.Json();
            this.Logger.LogInfo("McMst > " + mcMstStr);
            string mcWorkStr = this.McWork.Json();
            this.Logger.LogInfo("McWork > " + mcWorkStr);
            this.UpdateMcWork_OnRun();
            this.Logger.LogInfo("########### END MACHINE ###########");
        }
    }
}
