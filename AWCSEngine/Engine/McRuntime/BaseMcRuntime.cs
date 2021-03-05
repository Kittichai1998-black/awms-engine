using ADO.WCSDB;
using ADO.WCSPLC;
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
using System.Text.RegularExpressions;

namespace AWCSEngine.Engine.McRuntime
{
    public abstract class BaseMcRuntime : BaseEngine<NullCriteria, NullCriteria>, IDisposable
    {
        private act_McObject _McWork_Tmp { get; set; }
        private Action<BaseMcRuntime> _Callback_OnChange { get; set; }
        private McObjectEventStatus _McObjectEventStatus_Tmp { get; set; }

        protected abstract void OnRun();
        protected abstract bool OnRun_IDLE();
        protected abstract bool OnRun_COMMAND();
        protected abstract bool OnRun_WORKING();
        protected abstract bool OnRun_DONE();
        protected abstract bool OnRun_ERROR();
        protected IPlcADO PlcADO { get; private set; }

        public acs_McMaster McMst { get; private set; }
        public act_McObject McObj { get; private set; }
        //public act_BaseObject BaseObj { get; private set; }

        public acs_McCommand RunCmd { get; private set; }
        public List<acs_McCommandAction> RunCmdActions { get; private set; }
        public List<string> RunCmdParameters { get; private set; }


        //public McObjectStatus McEngineStatus { get; private set; }
        public long ID { get => this.McMst.ID.Value; }
        public string Code { get => this.McMst.Code; }
        public McObjectEventStatus EventStatus { get => this.McObj.EventStatus; }
        public acs_Location Cur_Location { get => StaticValueManager.GetInstant().GetLocation(this.McObj.Cur_Location_ID.Value); }
        public acs_Location Sou_Location { get => StaticValueManager.GetInstant().GetLocation(this.McObj.Sou_Location_ID.Value); }
        public acs_Location Des_Location { get => StaticValueManager.GetInstant().GetLocation(this.McObj.Des_Location_ID.Value); }
        public string MessageLog { get; set; }
        public List<string> DeviceNames { get; set; }
        public BaseMcRuntime(acs_McMaster mcMst) : base(ObjectUtil.GenUniqID())
        {
            this.McMst = mcMst;
        }

        protected override string BaseLogName()
        {
            return "McObject";
        }

        private McObjectEventStatus EventStatus_BeforError;
        public void PostError(string error)
        {
            this.MessageLog = error;
            this.EventStatus_BeforError = this.McObj.EventStatus;
            this.McObj.EventStatus = McObjectEventStatus.ERROR;
        }
        public void ClearERROR_PostIDEL()
        {
            this.McObj.EventStatus = McObjectEventStatus.IDEL;
        }
        public void ClearERROR_PostTryAgain()
        {
            this.McObj.EventStatus = McObjectEventStatus.IDEL;
        }

        public void Initial()
        {
            this.Logger.LogInfo("########### BEGIN MACHINE ###########");
            try
            {
                if (this.McMst.PlcCommuType == PlcCommunicationType.TEST)
                    this.PlcADO = ADO.WCSPLC.PlcTestADO.GetInstant(this.McMst.PlcDeviceName);
                else if (this.McMst.PlcCommuType == PlcCommunicationType.MX)
                    this.PlcADO = ADO.WCSPLC.PlcMxADO.GetInstant(this.McMst.PlcDeviceName);
                else if (this.McMst.PlcCommuType == PlcCommunicationType.KEPWARE_6)
                    this.PlcADO = ADO.WCSPLC.PlcKepwareV6ADO.GetInstant(this.McMst.PlcDeviceName);

                //this.PlcADO.Open();
                this.Logger.LogInfo("PlcADO Open "+ this.PlcADO.GetType().FullName);
            }
            catch (Exception)
            {
                if (this.PlcADO == null)
                    new AMWException(this.Logger, AMWExceptionCode.V0_PLC_COMMUTYPE_NOT_FOUND, this.McMst.PlcCommuType.ToString());
                throw;
            }


            this.McObj = McWorkADO.GetInstant().GetByMstID(this.McMst.ID.Value, this.BuVO);
            this._McWork_Tmp = this.McObj.Clone();
            this.McObj.EventStatus = McObjectEventStatus.IDEL;
            string mcMstStr = this.McMst.Json();
            this.Logger.LogInfo("McMst > " + mcMstStr);
            string mcWorkStr = this.McObj.Json();
            this.Logger.LogInfo("McWork > " + mcWorkStr);
            this.Logger.LogInfo("McController.AddMC()");
            McRuntimeController.GetInstant().AddMC(this);

            this.DeviceNames = new List<string>();
            this.McObj.GetType().GetFields().ToList().ForEach(x => { if (x.Name.StartsWith("DV_")){ this.DeviceNames.Add(x.Name.Substring(3)); } });
        }


        public bool PostCommand(McCommandType comm, ListKeyValue<string,object> parameters, Action<BaseMcRuntime> callback_OnChange)
        {
            if(this.McObj.EventStatus == McObjectEventStatus.IDEL)
            {
                this.Logger.LogInfo("[CMD] > " + comm.ToString() + " " + parameters.Items.Select(x => x.Key + "=" + x.Value).JoinString('&'));
                this.RunCmd = StaticValueManager.GetInstant().GetMcCommand(this.McMst.ID.Value, comm);
                this.RunCmdActions = StaticValueManager.GetInstant().ListMcCommandAction(this.RunCmd.ID.Value);
                this.RunCmdParameters = parameters.Items.Select(x => x.Key + "=" + x.Value).ToList();

                this.McObj.CommandTypeName = comm.ToString();
                this.McObj.Command_ID = this.RunCmd.ID;
                this.McObj.EventStatus = McObjectEventStatus.COMMAND;

                this._Callback_OnChange = callback_OnChange;

                return true;
            }
            return false;
        }
        public act_BaseObject Push_BaseObj_byLoc(long fromLocID)
        {
            var baseObj = BaseObjectADO.GetInstant().GetByLocation(fromLocID, BuVO);
            if (baseObj == null)
            {
                var loc = StaticValueManager.GetInstant().GetLocation(fromLocID);
                throw new AMWException(this.Logger, AMWExceptionCode.V0_STOinLOC_NOT_FOUND,loc.Code);
            }

            baseObj.Location_ID = this.McObj.Cur_Location_ID.Value;
            baseObj.McObject_ID = this.McObj.ID.Value;
            DataADO.GetInstant().UpdateBy<act_BaseObject>(baseObj, this.BuVO);
            return baseObj;
        }
        public act_BaseObject Pop_BaseObj_byLoc(int toLocID)
        {
            var baseObj = BaseObjectADO.GetInstant().GetByMcObject(this.McMst.ID.Value, BuVO);
            if (baseObj == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V0_STOinMC_NOT_FOUND, this.McMst.Code);

            var loc = StaticValueManager.GetInstant().GetLocation(toLocID);
            var baseObj2 = BaseObjectADO.GetInstant().GetByLocation(toLocID, BuVO);
            if (baseObj2 != null)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V0_BASEBLOCK_LOCATION, loc.Code);
            }

            baseObj.Area_ID = loc.Area_ID;
            baseObj.Location_ID = loc.ID.Value;
            baseObj.McObject_ID = null;
            DataADO.GetInstant().UpdateBy<act_BaseObject>(baseObj, this.BuVO);
            return baseObj;
        }


        public void Execute()
        {
            base.Execute(null);
        }
        protected override NullCriteria ExecuteChild(NullCriteria request)
        {
            try
            {
                if (this.McObj == null || this.McObj.Status != EntityStatus.ACTIVE) { this.MessageLog = "Offline"; return null; }

                //if (this.McObj.EventStatus != McObjectEventStatus.ERROR) return null;
                this._1_Read_Plc2McObj_OnRun();
                this._2_ExecuteChild_OnRun();
                this._3_Write_Cmd2Plc_OnRun();
                this._4_DBLog_OnRun();
                if (this.McObj.EventStatus != McObjectEventStatus.ERROR)
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
                if(this._McObjectEventStatus_Tmp != this.McObj.EventStatus)
                {
                    this._McObjectEventStatus_Tmp = this.McObj.EventStatus;
                    if (this._Callback_OnChange != null)
                        this._Callback_OnChange(this);
                }
            }

            return null;

        }
        
        private void _1_Read_Plc2McObj_OnRun()
        {
            var t_McMst = this.McMst.GetType();
            var t_McObj = this.McObj.GetType();

            this.DeviceNames.ForEach(name =>
            {
                string deviceKey = (String)t_McMst.GetField("DK_" + name).GetValue(McMst);
                if (string.IsNullOrEmpty(deviceKey)) 
                    return;

                deviceKey = deviceKey.ToUpper();
                object deviceVal =  t_McObj.GetField("DV_" + name).GetValue(McObj); 
                if (deviceVal is string)
                {
                    var valWord = t_McMst.GetField("DW_" + name).GetValue(McMst).Get2<int>();
                    t_McObj.GetField("DV_" + name).SetValue(McObj, this.PlcADO.GetDeviceString(deviceKey, valWord));
                }
                else if (deviceVal is short)
                    t_McObj.GetField("DV_" + name).SetValue(McObj, this.PlcADO.GetDevice<short>(deviceKey));
                else if (deviceVal is int)
                    t_McObj.GetField("DV_" + name).SetValue(McObj, this.PlcADO.GetDevice<int>(deviceKey));
                else if (deviceVal is long)
                    t_McObj.GetField("DV_" + name).SetValue(McObj, this.PlcADO.GetDevice<long>(deviceKey));
                else if (deviceVal is float)
                    t_McObj.GetField("DV_" + name).SetValue(McObj, this.PlcADO.GetDevice<float>(deviceKey));
                else if (deviceVal is double)
                    t_McObj.GetField("DV_" + name).SetValue(McObj, this.PlcADO.GetDevice<double>(deviceKey));
            });

        }

        private void _2_ExecuteChild_OnRun()
        {
            this.OnRun();

            switch (this.McObj.EventStatus)
            {
                case McObjectEventStatus.IDEL:
                    if (this.OnRun_IDLE()) this.McObj.EventStatus = McObjectEventStatus.COMMAND; break;
                case McObjectEventStatus.COMMAND:
                    if (this.OnRun_COMMAND()) this.McObj.EventStatus = McObjectEventStatus.WORKING; break;
                case McObjectEventStatus.WORKING:
                    if (this.OnRun_WORKING()) this.McObj.EventStatus = McObjectEventStatus.DONE; break;
                case McObjectEventStatus.DONE:
                    if (this.OnRun_DONE()) this.McObj.EventStatus = McObjectEventStatus.ERROR; break;
                case McObjectEventStatus.ERROR:
                    if (this.OnRun_ERROR()) this.McObj.EventStatus = McObjectEventStatus.IDEL; break;
            }
        }

        private void _3_Write_Cmd2Plc_OnRun()
        {
            if (this.McObj.EventStatus == McObjectEventStatus.COMMAND || this.McObj.EventStatus == McObjectEventStatus.WORKING)
            {
                var tMcMst = this.McMst.GetType();
                var tMcObj = this.McObj.GetType();
                var seq = this.RunCmdActions.Min(x => x.Seq);
                this.McObj.CommandAction_Seq = seq;

                bool isNext = false;
                foreach (var act in this.RunCmdActions.Where(x => x.Seq == seq))
                {
                    var act_conditions = act.DKV_Condition.QryStrToKeyValues();
                    if (act_conditions.TrueForAll(x => this.McObj.Get2<string>("DV_" + x.Key) == x.Value.Trim()))
                    {
                        string _act_sets = act.DKV_Set;
                        for (int i = 0; i < this.RunCmdParameters.Count; i++)
                        {
                            string[] kv = this.RunCmdParameters[i].Split('=', 2);
                            _act_sets = _act_sets.Replace("{" + i + "}", kv[1]).Replace("{" + kv[0] + "}", kv[1]);
                        }

                        var act_sets = _act_sets.QryStrToKeyValues();
                        act_sets.ForEach(x2 => {
                            string name = x2.Key;
                            string val = x2.Value;
                            string deviceKey = this.McMst.Get2<string>("DK_" + name);

                            var t_deviceVal = this.McObj.GetType().GetField("DV_" + name).FieldType;
                            if (t_deviceVal == typeof(string))
                            {
                                var valWord = this.McMst.Get2<int>("DW_" + name);
                                this.PlcADO.SetDeviceString(deviceKey, val, valWord);
                            }
                            else if (t_deviceVal == typeof(short))
                                this.PlcADO.SetDevice<short>(deviceKey, val.Get2<short>());
                            else if (t_deviceVal == typeof(int))
                                this.PlcADO.SetDevice<int>(deviceKey, val.Get2<int>());
                            else if (t_deviceVal == typeof(long))
                                this.PlcADO.SetDevice<long>(deviceKey, val.Get2<long>());
                            else if (t_deviceVal == typeof(float))
                                this.PlcADO.SetDevice<float>(deviceKey, val.Get2<float>());
                            else if (t_deviceVal == typeof(double))
                                this.PlcADO.SetDevice<double>(deviceKey, val.Get2<double>());
                        });


                        this.Logger.LogInfo("[" + this.McObj.EventStatus + "] > " + _act_sets);
                        isNext = true;
                        break;
                    }
                }

                if (isNext)
                {
                    this.RunCmdActions.RemoveAll(x => x.Seq == seq);
                    if (this.McObj.EventStatus == McObjectEventStatus.COMMAND)
                    {
                        this.McObj.EventStatus = McObjectEventStatus.WORKING;
                    }
                    if(this.RunCmdActions.Count == 0)
                    {
                        this.RunCmd = null;
                        this.RunCmdActions = null;
                        this.McObj.EventStatus = McObjectEventStatus.DONE;
                        this.Logger.LogInfo("[" + this.McObj.EventStatus + "]");
                    }
                }
            }
            else if(this.McObj.EventStatus == McObjectEventStatus.DONE)
            {
                this.McObj.Command_ID = null;
                this.McObj.CommandTypeName = null;
                this.McObj.CommandAction_Seq = null;
                this.McObj.EventStatus = McObjectEventStatus.IDEL;
                this.Logger.LogInfo("[" + this.McObj.EventStatus + "]");
            }
        }

        private void _4_DBLog_OnRun()
        {
            try
            {
                if (this.McObj.CompareFields(_McWork_Tmp))
                {
                    DataADO.GetInstant().UpdateBy<act_McObject>(this.McObj, this.BuVO);
                    this.McObj = DataADO.GetInstant().SelectByID<act_McObject>(this.McObj.ID.Value, this.BuVO);
                    this._McWork_Tmp = this.McObj.Clone();
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
            this.McMst.GetType().GetFields().OrderBy(x => x.Name).ToList().ForEach(x =>
            {
                string name = x.Name;
                if ((name.StartsWith("DK_Set") || name.StartsWith("DK_Pre")) && x.GetValue(this.McMst) != null && !string.IsNullOrEmpty( x.GetValue(this.McMst).ToString()))
                {
                    this.MessageLog += name.Substring(3) + "=" + this.McObj.Get2<string>("DV_" + name.Substring(3)) + " | ";
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
