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

namespace AWCSEngine.Engine.McObjectEngine
{
    public abstract class BaseMcObjectEngine : IDisposable
    {
        protected abstract bool OnIdle();
        protected abstract bool OnCommand();
        protected abstract bool OnWorking();
        protected abstract bool OnDone();
        protected abstract bool OnError();
        protected abstract void Read_Plc2McWork_OnRun();
        protected int LogDay { get; set; }
        protected acs_McMaster McMst { get; private set; }
        protected act_McObject McObject { get; private set; }
        protected List<acs_McRegistry> McRegistry { get; private set; }
        private act_McObject McWorkTmp { get; set; }
        private ADO.WCSPLC.IPlcADO PlcADO { get; set; }

        private VOCriteria BuVO { get; set; }
        private AMWLogger Logger { get => this.BuVO.Logger; set => this.BuVO.Logger = value; }

        //public McObjectStatus McEngineStatus { get; private set; }
        public long ID { get => this.McMst.ID.Value; }
        public string Code { get => this.McMst.Code; }
        public string MessageLog { get; set; }
        public BaseMcObjectEngine(acs_McMaster mcMst)
        {
            this.McMst = mcMst;
        }

        public void Initial()
        {
            this.BuVO = new VOCriteria();
            this.Logger = AMWLoggerManager.GetLogger("Machine", this.McMst.Code);
            this.Logger.LogInfo("########### BEGIN MACHINE ###########");
            if (this.McMst.PlcCommuType == PlcCommunicationType.TEST)
            {
                this.PlcADO = ADO.WCSPLC.PlcTestADO.GetInstant(this.McMst.LogicalNumber);
                this.Logger.LogInfo("Open PlcTestADO.PlcMxADO");
            }
            else if (this.McMst.PlcCommuType == PlcCommunicationType.MX)
            {
                this.PlcADO = ADO.WCSPLC.PlcMxADO.GetInstant(this.McMst.LogicalNumber);
                this.Logger.LogInfo("Open PlcADO.PlcMxADO");
            }
            else if (this.McMst.PlcCommuType == PlcCommunicationType.KEPWARE)
            {
                this.PlcADO = ADO.WCSPLC.PlcKepwareADO.GetInstant(this.McMst.LogicalNumber);
                this.Logger.LogInfo("Open PlcKepwareADO.PlcMxADO");
            }

            this.McRegistry = StaticValueManager.GetInstant().McRegistrys.FindAll(x=>x.McMasterID == this.McMst.ID);
            this.McObject = McWorkADO.GetInstant().GetByMstID(this.McMst.ID.Value, this.BuVO);
            this.McWorkTmp = this.McObject.Clone();
            this.McObject.EventStatus = McObjectEventStatus.IDEL;
            this.LogDay = DateTime.Now.Day;
            string mcMstStr = this.McMst.Json();
            this.Logger.LogInfo("McMst > " + mcMstStr);
            string mcWorkStr = this.McObject.Json();
            this.Logger.LogInfo("McWork > " + mcWorkStr);
            this.Logger.LogInfo("McController.AddMC()");
            McController.GetInstant().AddMC(this);
        }

        protected T GetDevice<T>(string code)
            where T : struct
        {
            var reg = this.McRegistry.FirstOrDefault(x => x.Code == code);
            if (reg == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V0_MCREGISTRY_NOT_FOUND, code);
            if (typeof(T) == typeof(short))
                return (T)(object)this.PlcADO.GetDevicelShot(reg.DriverKey);
            if (typeof(T) == typeof(int))
                return (T)(object)this.PlcADO.GetDevicelInt(reg.DriverKey);
            if (typeof(T) == typeof(long))
                return (T)(object)this.PlcADO.GetDevicelLong(reg.DriverKey);
            if (typeof(T) == typeof(float))
                return (T)(object)this.PlcADO.GetDevicelFloat(reg.DriverKey);
            if (typeof(T) == typeof(double))
                return (T)(object)this.PlcADO.GetDevicelDouble(reg.DriverKey);
            if (typeof(T) == typeof(string))
                return (T)(object)this.PlcADO.GetDevicelString(reg.DriverKey, reg.DriverStringLength);
            throw new AMWException(this.Logger, AMWExceptionCode.V0_DATATYPE_NOT_SUPPORT, typeof(T).Name);
        }

        protected T SetDevice<T>(string code, T value)
            where T : struct
        {
            var reg = this.McRegistry.FirstOrDefault(x => x.Code == code);
            if (reg == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V0_MCREGISTRY_NOT_FOUND, code);
            if (typeof(T) == typeof(short))
                this.PlcADO.SetDevicelShot(reg.DriverKey, (short)(object)value);
            if (typeof(T) == typeof(int))
                this.PlcADO.SetDevicelInt(reg.DriverKey, (int)(object)value);
            if (typeof(T) == typeof(long))
                this.PlcADO.SetDevicelLong(reg.DriverKey, (long)(object)value);
            if (typeof(T) == typeof(float))
                this.PlcADO.SetDevicelFloat(reg.DriverKey, (float)(object)value);
            if (typeof(T) == typeof(double))
                this.PlcADO.SetDevicelDouble(reg.DriverKey, (double)(object)value);
            if (typeof(T) == typeof(string))
                this.PlcADO.SetDevicelString(reg.DriverKey, (string)(object)value);
            throw new AMWException(this.Logger, AMWExceptionCode.V0_DATATYPE_NOT_SUPPORT, typeof(T).Name);
        }

        private void Write_McWork2DB_OnRun()
        {
            try
            {
                if (this.McObject.CompareFields(McWorkTmp))
                {
                    DataADO.GetInstant().UpdateBy<act_McObject>(this.McObject, this.BuVO);
                    this.McObject = DataADO.GetInstant().SelectByID<act_McObject>(this.McObject.ID.Value, this.BuVO);
                    this.McWorkTmp = this.McObject.Clone();
                }
            }
            catch(Exception ex)
            {
                new AMWException(this.Logger, AMWExceptionCode.S0005, ex.Message);
            }
        }


        public bool Command(McCommand comm, string souLocCode, string desLocCode)
        {
            if(this.McObject.EventStatus == McObjectEventStatus.IDEL)
            {
                McObject.EventStatus = McObjectEventStatus.COMMAND;
                McObject.Command = comm;
                var souLoc = StaticValueManager.GetInstant().Locations.FirstOrDefault(x => x.Code == souLocCode);
                var desLoc = StaticValueManager.GetInstant().Locations.FirstOrDefault(x => x.Code == souLocCode);
                this.McObject.Sou_Location_ID = (souLoc != null ? souLoc.ID : null);
                this.McObject.Des_Location_ID = (desLoc != null ? desLoc.ID : null);

                return true;
            }
            return false;
        }

        public void Runtime()
        {
            try
            {
                if (this.McObject == null || this.McObject.Status != EntityStatus.ACTIVE) { this.MessageLog = "Offline"; return; }

                this.MessageLog = "Status.PLC=" +
                this.McObject.PlcStatus.ToString() +
                " | Status.Evt=" +
                this.McObject.EventStatus.ToString() +
                " | Pos.This=" +
                (this.McObject.Location_ID.HasValue ?
                    StaticValueManager.GetInstant().GetLocation(this.McObject.Location_ID.Value).Code : "") +
                " | Pos.Sou=" +
                (this.McObject.Sou_Location_ID.HasValue ?
                    StaticValueManager.GetInstant().GetLocation(this.McObject.Sou_Location_ID.Value).Code : "") +
                " | Pos.Des=" +
                (this.McObject.Des_Location_ID.HasValue ?
                    StaticValueManager.GetInstant().GetLocation(this.McObject.Des_Location_ID.Value).Code : "");

                if (this.LogDay != DateTime.Now.Day)
                {
                    this.Logger = AMWLoggerManager.GetLogger("Machine", McMst.Code);
                }


                this.Read_Plc2McWork_OnRun();
                this.Action_McWork2Plc_OnRun();
                this.Write_McWork2DB_OnRun();

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

        private void Action_McWork2Plc_OnRun()
        {
            switch (this.McObject.EventStatus)
            {
                case McObjectEventStatus.IDEL:
                    if (this.OnIdle()) this.McObject.EventStatus = McObjectEventStatus.COMMAND; break;
                case McObjectEventStatus.COMMAND:
                    if (this.OnCommand()) this.McObject.EventStatus = McObjectEventStatus.WORKING; break;
                case McObjectEventStatus.WORKING:
                    if (this.OnWorking()) this.McObject.EventStatus = McObjectEventStatus.DONE; break;
                case McObjectEventStatus.DONE:
                    if (this.OnDone()) this.McObject.EventStatus = McObjectEventStatus.ERROR; break;
                case McObjectEventStatus.ERROR:
                    if (this.OnError()) this.McObject.EventStatus = McObjectEventStatus.IDEL; break;
            }
        }

        public void Dispose()
        {
            string mcMstStr = this.McMst.Json();
            this.Logger.LogInfo("McMst > " + mcMstStr);
            string mcWorkStr = this.McObject.Json();
            this.Logger.LogInfo("McWork > " + mcWorkStr);
            this.Write_McWork2DB_OnRun();
            this.PlcADO.Close();
            this.Logger.LogInfo("PlcADO.Close()");
            this.Logger.LogInfo("########### END MACHINE ###########");
        }
    }
}
