using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWCSEngine.Controller;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AWCSEngine.Engine.McObjectEngine
{
    public abstract class BaseMcObjectEngine : IDisposable
    {
        protected abstract bool OnIdle();
        protected abstract bool OnCommand();
        protected abstract bool OnWorking();
        protected abstract bool OnDone();
        protected abstract bool OnError();
        protected int LogDay { get; set; }
        protected acs_McMaster McMst { get; private set; }
        protected act_McObject McObj { get; private set; }
        protected acs_McCommand RunCmd { get; private set; }
        protected List<acs_McCommandAction> RunCmdAction { get; private set; }
        protected List<string> RunCmdSetValues { get; private set; }
        private act_McObject McWorkTmp { get; set; }
        private ADO.WCSPLC.IPlcADO PlcADO { get; set; }

        private VOCriteria BuVO { get; set; }
        private AMWLogger Logger { get => this.BuVO.Logger; set => this.BuVO.Logger = value; }

        //public McObjectStatus McEngineStatus { get; private set; }
        public long ID { get => this.McMst.ID.Value; }
        public string Code { get => this.McMst.Code; }
        public string MessageLog { get; set; }
        public List<string> DeviceNames { get; set; }
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


            this.McObj = McWorkADO.GetInstant().GetByMstID(this.McMst.ID.Value, this.BuVO);
            this.McWorkTmp = this.McObj.Clone();
            this.McObj.EventStatus = McObjectEventStatus.IDEL;
            this.LogDay = DateTime.Now.Day;
            string mcMstStr = this.McMst.Json();
            this.Logger.LogInfo("McMst > " + mcMstStr);
            string mcWorkStr = this.McObj.Json();
            this.Logger.LogInfo("McWork > " + mcWorkStr);
            this.Logger.LogInfo("McController.AddMC()");
            McController.GetInstant().AddMC(this);

            this.DeviceNames = new List<string>();
            this.McObj.GetType().GetFields().ToList().ForEach(x => { if (x.Name.StartsWith("DV_")){ this.DeviceNames.Add(x.Name.Substring(3)); } });
        }


        /*protected T GetDevice<T>(string code)
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
        }*/

        /*protected T SetDevice<T>(string code, T value)
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
        }*/


        public bool PostCommand(McCommandType comm, params string[] values)
        {
            if(this.McObj.EventStatus == McObjectEventStatus.IDEL)
            {
                this.Logger.LogInfo("[CMD] > " + comm.ToString() + " " + values.JoinString());
                McObj.Command = comm;
                McObj.EventStatus = McObjectEventStatus.COMMAND;
                this.RunCmd = StaticValueManager.GetInstant().GetMcCommand(this.McMst.ID.Value, comm);
                this.RunCmdAction = StaticValueManager.GetInstant().ListMcCommandAction(this.RunCmd.ID.Value);
                this.RunCmdSetValues = values.ToList();
                //var souLoc = StaticValueManager.GetInstant().Locations.FirstOrDefault(x => x.Code == souLocCode);
                //var desLoc = StaticValueManager.GetInstant().Locations.FirstOrDefault(x => x.Code == desLocCode);
                //this.McObj.Sou_Location_ID = (souLoc != null ? souLoc.ID : null);
                //this.McObj.Des_Location_ID = (desLoc != null ? desLoc.ID : null);

                return true;
            }
            return false;
        }

        public void Runtime()
        {
            try
            {
                if (this.McObj == null || this.McObj.Status != EntityStatus.ACTIVE) { this.MessageLog = "Offline"; return; }

                if (this.LogDay != DateTime.Now.Day)
                {
                    this.Logger = AMWLoggerManager.GetLogger("Machine", McMst.Code);
                }

                this._1_Read_Plc2McObj_OnRun();

                this._2_ExecuteChild_OnRun();

                this._3_Write_Cmd2Plc_OnRun();
                this._4_DBLog_OnRun();
                this._5_MessageLog_OnRun();
            }
            catch (AMWException ex)
            {
                this._5_MessageLog_OnRun(ex.Message);
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex.Message);
                this._5_MessageLog_OnRun(ex.Message);
            }
            finally
            {
            }


        }
        
        private void _1_Read_Plc2McObj_OnRun()
        {
            var t_McMst = this.McMst.GetType();
            var t_McObj = this.McObj.GetType();

            this.DeviceNames.ForEach(name =>
            {
                var deviceKey = t_McMst.GetField("DK_" + name).GetValue(McMst).ToString();
                var t_deviceVal = t_McObj.GetField("DV_" + name).GetValue(McObj).GetType(); 
                if (t_deviceVal == typeof(string))
                {
                    var valWord = t_McMst.GetField("VW_" + name).GetValue(McMst).Get<int>();
                    t_McObj.GetField(name).SetValue(McObj, this.PlcADO.GetDevicelString(deviceKey, valWord));
                }
                else if (t_deviceVal == typeof(short))
                    t_McObj.GetField(name).SetValue(McObj, this.PlcADO.GetDevicelShot(deviceKey));
                else if (t_deviceVal == typeof(int))
                    t_McObj.GetField(name).SetValue(McObj, this.PlcADO.GetDevicelInt(deviceKey));
                else if (t_deviceVal == typeof(long))
                    t_McObj.GetField(name).SetValue(McObj, this.PlcADO.GetDevicelLong(deviceKey));
                else if (t_deviceVal == typeof(float))
                    t_McObj.GetField(name).SetValue(McObj, this.PlcADO.GetDevicelFloat(deviceKey));
                else if (t_deviceVal == typeof(double))
                    t_McObj.GetField(name).SetValue(McObj, this.PlcADO.GetDevicelDouble(deviceKey));
            });

        }

        private void _2_ExecuteChild_OnRun()
        {
            switch (this.McObj.EventStatus)
            {
                case McObjectEventStatus.IDEL:
                    if (this.OnIdle()) this.McObj.EventStatus = McObjectEventStatus.COMMAND; break;
                case McObjectEventStatus.COMMAND:
                    if (this.OnCommand()) this.McObj.EventStatus = McObjectEventStatus.WORKING; break;
                case McObjectEventStatus.WORKING:
                    if (this.OnWorking()) this.McObj.EventStatus = McObjectEventStatus.DONE; break;
                case McObjectEventStatus.DONE:
                    if (this.OnDone()) this.McObj.EventStatus = McObjectEventStatus.ERROR; break;
                case McObjectEventStatus.ERROR:
                    if (this.OnError()) this.McObj.EventStatus = McObjectEventStatus.IDEL; break;
            }
        }

        private void _3_Write_Cmd2Plc_OnRun()
        {
            if (this.McObj.EventStatus == McObjectEventStatus.COMMAND || this.McObj.EventStatus == McObjectEventStatus.WORKING)
            {
                var tMcMst = this.McMst.GetType();
                var tMcObj = this.McObj.GetType();
                var seq = this.RunCmdAction.Min(x => x.Seq);
                bool isNext = false;
                foreach (var act in this.RunCmdAction.Where(x => x.Seq == seq))
                {
                    var conditions = act.DKV_Condition.QryStrToKeyValues();

                    if (conditions.TrueForAll(x => this.McObj.Get<string>("DV_" + x.Key) == x.Value))
                    {
                        var _sets = string.Format(act.DKV_Set, this.RunCmdSetValues);
                        var sets = _sets.QryStrToKeyValues();
                        sets.ForEach(x2 => {
                            string name = x2.Key;
                            string val = x2.Value;
                            string deviceKey = this.McMst.Get<string>("DK_" + name);

                            var t_deviceVal = this.McObj.Get("DV_" + name).GetType();
                            if (t_deviceVal == typeof(string))
                            {
                                var valWord = this.McMst.Get<int>("VW_" + name);
                                this.PlcADO.SetDevicelString(deviceKey, val, valWord);
                            }
                            else if (t_deviceVal == typeof(short))
                                this.PlcADO.SetDevicelShot(deviceKey, val.Get<short>());
                            else if (t_deviceVal == typeof(int))
                                this.PlcADO.SetDevicelInt(deviceKey, val.Get<int>());
                            else if (t_deviceVal == typeof(long))
                                this.PlcADO.SetDevicelLong(deviceKey, val.Get<long>());
                            else if (t_deviceVal == typeof(float))
                                this.PlcADO.SetDevicelFloat(deviceKey, val.Get<float>());
                            else if (t_deviceVal == typeof(double))
                                this.PlcADO.SetDevicelDouble(deviceKey, val.Get<double>());
                        });


                        this.Logger.LogInfo("[" + this.McObj.EventStatus + "] > " + _sets);
                        isNext = true;
                        break;
                    }
                }

                if (isNext)
                {
                    this.RunCmdAction.RemoveAll(x => x.Seq == seq);
                    if (this.McObj.EventStatus == McObjectEventStatus.COMMAND)
                    {
                        this.McObj.EventStatus = McObjectEventStatus.WORKING;
                    }
                    if(this.RunCmdAction.Count == 0)
                    {
                        this.McObj.EventStatus = McObjectEventStatus.DONE;
                        this.RunCmd = null;
                        this.RunCmdAction = null;
                        this.Logger.LogInfo("[" + this.McObj.EventStatus + "]");
                    }
                }
            }
            else if(this.McObj.EventStatus == McObjectEventStatus.DONE)
            {
                this.McObj.EventStatus = McObjectEventStatus.IDEL;
                this.Logger.LogInfo("[" + this.McObj.EventStatus + "]");
            }
        }

        private void _4_DBLog_OnRun()
        {
            try
            {
                if (this.McObj.CompareFields(McWorkTmp))
                {
                    DataADO.GetInstant().UpdateBy<act_McObject>(this.McObj, this.BuVO);
                    this.McObj = DataADO.GetInstant().SelectByID<act_McObject>(this.McObj.ID.Value, this.BuVO);
                    this.McWorkTmp = this.McObj.Clone();
                }
            }
            catch (Exception ex)
            {
                new AMWException(this.Logger, AMWExceptionCode.S0005, ex.Message);
            }
        }

        private void _5_MessageLog_OnRun(string error = "")
        {
            if (error != "") { this.MessageLog = error; return; }

            this.MessageLog = string.Empty;
            this.McObj.GetType().GetFields().ToList().ForEach(x =>
            {
                string name = x.Name;
                if (name.StartsWith("DV_"))
                {
                    this.MessageLog += name.Substring(3) + "=" + x.GetValue(this.McObj) + " | ";
                }
            });
        }

        public void Dispose()
        {
            string mcMstStr = this.McMst.Json();
            this.Logger.LogInfo("McMst > " + mcMstStr);
            string mcWorkStr = this.McObj.Json();
            this.Logger.LogInfo("McWork > " + mcWorkStr);
            this._4_DBLog_OnRun();
            this.PlcADO.Close();
            this.Logger.LogInfo("PlcADO.Close()");
            this.Logger.LogInfo("########### END MACHINE ###########");
        }
    }
}
