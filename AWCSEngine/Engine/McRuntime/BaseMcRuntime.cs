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
    public abstract partial class BaseMcRuntime : BaseEngine<NullCriteria, NullCriteria>, IDisposable
    {
        private act_McObject _McObj_TMP { get; set; }
        private Func<BaseMcRuntime, LoopResult> _Callback_OnChange { get; set; }
        //private McObjectEventStatus _McObjectEventStatus_Tmp { get; set; }

        protected abstract void OnStart();
        protected abstract void OnRun();
        protected abstract void OnEnd();
        protected IPlcADO PlcADO { get; private set; }

        public acs_McMaster McMst { get; private set; }
        public act_McObject McObj { get; private set; }
        public act_McWork McWork4Work { get; private set; }
        public act_McWork McWork4Receive { get; private set; }
        //public act_BaseObject BaseObj { get; private set; }

        public acs_McCommand RunCmd { get => this.McObj.Command_ID == null ? null : StaticValueManager.GetInstant().GetMcCommand(this.McObj.Command_ID.Value); }
        public List<acs_McCommandAction> RunCmdActions { get => this.McObj.Command_ID == null ? null : StaticValueManager.GetInstant().ListMcCommandAction(this.McObj.Command_ID.Value); }
        public List<string> RunCmdParameters { get => this.McObj.CommandParameter == null?null:this.McObj.CommandParameter.Split("&").ToList(); }


        //public McObjectStatus McEngineStatus { get; private set; }
        public long ID { get => this.McObj.ID.Value; }
        public string Code { get => this.McMst.Code; }
        public McObjectEventStatus EventStatus { get => this.McObj.EventStatus; }
        public acs_Area Cur_Area { get => StaticValueManager.GetInstant().GetArea(this.Cur_Location.Area_ID); }
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
            catch (Exception ex)
            {
                if (this.PlcADO == null)
                    new AMWException(this.Logger, AMWExceptionCode.V0_PLC_COMMUTYPE_NOT_FOUND, this.McMst.PlcCommuType.ToString());
                throw;
            }

            this.McWork4Work = McWorkADO.GetInstant().GetByCurMcObject(this.McObj.ID.Value, this.BuVO);
            this.McWork4Receive = McWorkADO.GetInstant().GetByDesMcObject(this.McObj.ID.Value, this.BuVO);
            if (this.McWork4Work != null && this.McWork4Work.EventStatus == McWorkEventStatus.ACTIVE_KEEP)
            {
                this.McWork4Work.EventStatus = McWorkEventStatus.ACTIVE_WORKED;
                DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork4Work, this.BuVO);
            }
            this.McObj = McObjectADO.GetInstant().GetByMstID(this.McMst.ID.Value, this.BuVO);
            this._McObj_TMP = this.McObj.Clone();
            this.McObj.EventStatus = McObjectEventStatus.IDEL;
            string mcMstStr = this.McMst.Json();
            this.Logger.LogInfo("McMst > " + mcMstStr);
            string mcObjStr = this.McObj.Json();
            this.Logger.LogInfo("McObj > " + mcObjStr);
            this.Logger.LogInfo("McController.AddMC()");
            McRuntimeController.GetInstant().AddMC(this);

            this.DeviceNames = new List<string>();
            this.McObj.GetType().GetFields().ToList().ForEach(x => { if (x.Name.StartsWith("DV_")){ this.DeviceNames.Add(x.Name.Substring(3)); } });
            this.OnStart();
        }

        public bool PostCommand(McCommandType comm, Func<BaseMcRuntime, LoopResult> callback_OnChange)
        {
            return this.PostCommand(comm, new ListKeyValue<string, object>(), callback_OnChange);
        }
        public bool PostCommand(McCommandType comm,
            int Set_SouLoc, int Set_DesLoc, int Set_Unit, string Set_PalletID, int Set_Weigh,
            Func<BaseMcRuntime, LoopResult> callback_OnChange)
        {
            return this.PostCommand(comm, ListKeyValue<string, object>
                            .New("Set_SouLoc", Set_SouLoc)
                            .Add("Set_DesLoc", Set_DesLoc)
                            .Add("Set_Unit", Set_Unit)
                            .Add("Set_PalletID", Set_PalletID)
                            .Add("Set_Weigth", Set_Weigh), callback_OnChange);
        }
        public bool PostCommand(McCommandType comm, ListKeyValue<string,object> parameters, Func<BaseMcRuntime, LoopResult> callback_OnChange)
        {
            //if(this.McObj.EventStatus == McObjectEventStatus.IDEL)
            {
                this.Logger.LogInfo("[CMD] > " + comm.ToString() + " " + parameters.Items.Select(x => x.Key + "=" + x.Value).JoinString('&'));
                this.McObj.Command_ID = StaticValueManager.GetInstant().GetMcCommand(this.McMst.ID.Value, comm).ID.Value;
                this.McObj.CommandAction_Seq = this.RunCmdActions.Min(x => x.Seq);
                this.McObj.CommandParameter = parameters.ToQryStr();
                this.McObj.EventStatus = McObjectEventStatus.COMMAND_CONDITION;

                this._Callback_OnChange = callback_OnChange;

            }
            return true;
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
                if (this._Callback_OnChange != null)
                {
                    if (this._Callback_OnChange(this) == LoopResult.Break)
                        this._Callback_OnChange = null;

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

        }

        private void _3_Write_Cmd2Plc_OnRun()
        {
            if (this.McObj.EventStatus == McObjectEventStatus.COMMAND_CONDITION || this.McObj.EventStatus == McObjectEventStatus.COMMAND_WRITING)
            {
                var tMcMst = this.McMst.GetType();
                var tMcObj = this.McObj.GetType();


                bool isNext = false;
                foreach (var act in this.RunCmdActions.Where(x => x.Seq == this.McObj.CommandAction_Seq))
                {
                    var act_conditions = act.DKV_Condition.QryStrToKeyValues();
                    if (act_conditions.Count() == 0 ||
                        (this.McObj.CommandAction_Seq == 1 && this.RunCmdParameters.LastOrDefault() == "\\nc") || 
                        act_conditions.TrueForAll(x => this.McObj.Get2<string>("DV_" + x.Key) == x.Value.Trim()))
                    {
                        string _act_sets = act.DKV_Set;
                        for (int i = 0; i < this.RunCmdParameters.Count; i++)
                        {
                            string[] kv = this.RunCmdParameters[i].Split('=', 2);
                            string v = kv.Length == 1 || kv[1] == "\\nc" ? string.Empty : kv[1];
                            _act_sets = _act_sets.Replace("{" + i + "}", v).Replace("{" + kv[0] + "}", v);
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
                    var _Next_CmdActs = this.RunCmdActions.FindAll(x => x.Seq > this.McObj.CommandAction_Seq.Value);
                    if (this.McObj.EventStatus == McObjectEventStatus.COMMAND_CONDITION)
                    {
                        this.McObj.EventStatus = McObjectEventStatus.COMMAND_WRITING;
                    }

                    if (_Next_CmdActs.Count > 0)
                    {
                        this.McObj.CommandAction_Seq = _Next_CmdActs.Min(x => x.Seq);
                    }
                    else
                    {
                        this.McObj.Command_ID = null;
                        this.McObj.CommandAction_Seq = null;
                        this.McObj.CommandParameter = null;

                        this.McObj.EventStatus = McObjectEventStatus.DONE;
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
                if (!this.McObj.CompareFields(_McObj_TMP,"CreateBy","CreateTime","ModifyBy","ModifyTime"))
                {
                    DataADO.GetInstant().UpdateBy<act_McObject>(this.McObj, this.BuVO);
                    this._McObj_TMP = this.McObj.Clone();
                }
                if(this.McWork4Work != null &&
                    this.McObj.Cur_Location_ID != this.McWork4Work.Cur_Location_ID)
                {
                    this.McWork4Work.Cur_Location_ID = this.McObj.Cur_Location_ID.Value;
                    this.McWork4Work.Cur_Warehouse_ID = this.Cur_Area.ID.Value;
                    this.McWork4Work.Cur_Area_ID = this.Cur_Area.Warehouse_ID;
                    DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork4Work, this.BuVO);
                }
            }
            catch (Exception ex)
            {
                new AMWException(this.Logger, AMWExceptionCode.S0005, ex.Message);
            }
        }

        private void _5_MessageLog_OnRun(string error = "")
        {
            //if (error != "") { this.MessageLog = error; return; }
            
            this.MessageLog = $"({this.EventStatus.ToString().Substring(0,4)} {(this.RunCmd != null ? (int)this.RunCmd.McCommandType : 0)}) > ";
            this.McMst.GetType().GetFields().OrderBy(x => x.Name).ToList().ForEach(x =>
            {
                string name = x.Name;
                if ((name.StartsWith("DK_Set") || name.StartsWith("DK_Pre")) && x.GetValue(this.McMst) != null && !string.IsNullOrEmpty( x.GetValue(this.McMst).ToString()))
                {
                    this.MessageLog += name.Substring(3) + "=" + this.McObj.Get2<string>("DV_" + name.Substring(3)) + " | ";
                }
            });
            this.MessageLog += "\n:::::::" + error;
        }

        public void Dispose()
        {
            string mcMstStr = this.McMst.Json();
            this.Logger.LogInfo("McMst > " + mcMstStr);
            string mcObjStr = this.McObj.Json();
            this.Logger.LogInfo("McObj > " + mcObjStr);
            this._4_DBLog_OnRun();
            this.PlcADO.Close();
            this.Logger.LogInfo("PlcADO.Close()");
            this.OnEnd();
            this.Logger.LogInfo("########### END MACHINE ###########");
        }
    }
}
