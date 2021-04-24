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
using System.Threading;

namespace AWCSEngine.Engine.McRuntime
{
    public abstract partial class BaseMcRuntime : BaseEngine<NullCriteria, NullCriteria>, IDisposable
    {
        private act_McObject _McObj_TMP { get; set; }
        private List<Func<BaseMcRuntime, LoopResult>> _Callback_OnChanges { get; set; }
        //private McObjectEventStatus _McObjectEventStatus_Tmp { get; set; }

        private McObjectEventStatus _EventStatus_Temp = (McObjectEventStatus)9999;
        private bool IsOnChanged = true;

        protected abstract void OnStart();
        protected abstract void OnRun();
        protected abstract void OnEnd();
        protected IPlcADO PlcADO { get; private set; }

        public acs_McMaster McMst { get; private set; }
        public act_McObject McObj { get; private set; }

        private string McWork4Work_LabelData { get; set; }
        private string McWork4Receive_LabelData { get; set; }

        private act_McWork _McWork4Work { get; set; }
        private act_McWork _McWork4Receive { get; set; }
        public act_McWork McWork4Work {
            get => _McWork4Work;
            private set
            {
                _McWork4Work = value;
                if (_McWork4Work != null)
                    this.McWork4Work_LabelData =
                        BaseObjectADO.GetInstant().GetByID(_McWork4Work.BaseObject_ID, this.BuVO).LabelData;
                else
                    this.McWork4Work_LabelData = null;
            }
        }
        public act_McWork McWork4Receive
        {
            get => _McWork4Receive;
            private set
            {
                _McWork4Receive = value;
                if (_McWork4Receive != null)
                    this.McWork4Receive_LabelData =
                        BaseObjectADO.GetInstant().GetByID(_McWork4Receive.BaseObject_ID, this.BuVO).LabelData;
                else
                    this.McWork4Receive_LabelData = null;
            }
        }
        //public act_BaseObject BaseObj { get; private set; }

        public acs_McCommand RunCmd { get => this.McObj.Command_ID == null ? null : StaticValueManager.GetInstant().GetMcCommand(this.McObj.Command_ID.Value); }
        public List<acs_McCommandAction> RunCmdActions { get => this.McObj.Command_ID == null ? null : StaticValueManager.GetInstant()
                .ListMcCommandAction(this.McObj.Command_ID.Value).Where(x => x.Seq >= this.McObj.CommandAction_Seq).ToList(); }
        public List<string> RunCmdParameters { get => this.McObj.CommandParameter == null ? null : this.McObj.CommandParameter.Split("&").ToList(); }


        public string StepTxt
        {
            get => this.McObj.StepTxt;
            set { this.McObj.StepTxt = value; DisplayController.Events_Write($"{this.Code} > step {value}"); }
        }
        public long ID { get => this.McObj.ID.Value; }
        public string Code { get => this.McMst.Code; }
        public McObjectEventStatus EventStatus { get => this.McObj.EventStatus; }
        public acs_Area Cur_Area
        {
            get
            {
                if (this.McObj.Cur_Location_ID == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V0_MC_LOCATION_NOT_SET, this.Code);
                return StaticValueManager.GetInstant().GetArea(this.Cur_Location.Area_ID);
            }
        }
        public acs_Location Cur_Location
        {
            get
            {
                if (this.McObj.Cur_Location_ID == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V0_MC_LOCATION_NOT_SET, this.Code);
                return StaticValueManager.GetInstant().GetLocation(this.McObj.Cur_Location_ID.Value);
            }
        }
        //public List<string> DeviceLogs { get; set; }
        public List<string> DeviceNames { get; set; }
        public BaseMcRuntime(acs_McMaster mcMst) : base(ObjectUtil.GenUniqID())
        {
            this.McMst = mcMst;
        }

        protected override string BaseLogName()
        {
            return "McObject";
        }
        public void Reload()
        {
            this.StaticValue.LoadMcMaster();
            this.McMst = this.StaticValue.GetMcMaster(this.McMst.ID.Value);
            this.Initial();
        }

        public void Initial()
        {
            this.Logger.LogInfo("########### BEGIN MACHINE ###########");
            LoadDictionaryALL();
            try
            {
                if (this.McMst.PlcCommuType == PlcCommunicationType.TEST)
                    this.PlcADO = ADO.WCSPLC.PlcTestADO.GetInstant(this.McMst.PlcDeviceName);
                else if (this.McMst.PlcCommuType == PlcCommunicationType.MX)
                    this.PlcADO = ADO.WCSPLC.PlcMxADO.GetInstant(this.McMst.PlcDeviceName);
                else if (this.McMst.PlcCommuType == PlcCommunicationType.KEPWARE_6)
                    this.PlcADO = ADO.WCSPLC.PlcKepwareV6ADO.GetInstant(this.McMst.PlcDeviceName);

                //this.PlcADO.Open();
                this.Logger.LogInfo("PlcADO Open " + this.PlcADO.GetType().FullName);
            }
            catch (Exception ex)
            {
                if (this.PlcADO == null)
                    new AMWException(this.Logger, AMWExceptionCode.V0_PLC_COMMUTYPE_NOT_FOUND, this.McMst.PlcCommuType.ToString());
                throw;
            }

            this.McObj = McObjectADO.GetInstant().GetByMstID(this.McMst.ID.Value, this.BuVO);
            this._McObj_TMP = this.McObj.Clone();
            this.McObj.EventStatus = McObjectEventStatus.IDEL;

            this.McWork4Work = McWorkADO.GetInstant().GetByCurMcObject(this.McObj.ID.Value, this.BuVO);
            this.McWork4Receive = McWorkADO.GetInstant().GetByRecMcObject(this.McObj.ID.Value, this.BuVO);
            if (this.McWork4Work != null && this.McWork4Work.EventStatus == McWorkEventStatus.ACTIVE_KEEP)
            {
                this.McWork4Work.EventStatus = McWorkEventStatus.ACTIVE_WORKED;
                DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork4Work, this.BuVO);
            }

            string mcMstStr = this.McMst.Json();
            this.Logger.LogInfo("McMst > " + mcMstStr);
            string mcObjStr = this.McObj.Json();
            this.Logger.LogInfo("McObj > " + mcObjStr);
            this.Logger.LogInfo("McController.AddMC()");
            McRuntimeController.GetInstant().AddMC(this);

            this.DeviceNames = new List<string>();
            this.McObj.GetType().GetFields().ToList().ForEach(x => { if (x.Name.StartsWith("DV_")) { this.DeviceNames.Add(x.Name.Substring(3)); } });
            this.OnStart();

            DisplayController.Events_Write($"{this.Code} > [START] {(this.McObj.IsOnline ? "Online" : "Offline")} | {(this.McObj.IsAuto ? "Auto" : "Manual")}");

            this._5_MessageLog_OnRun();
        }


        public bool IsOnline { get => this.McObj.IsOnline; }
        public bool IsAuto { get => this.McObj.IsAuto; }
        public void SetOnline(bool isOnline)
        {
            this.McObj.IsOnline = isOnline;
            DisplayController.Events_Write($"{this.Code} > [CONFIG] {(this.McObj.IsOnline ? "Online" : "Offline")}");

        }
        public void SetAuto(bool isAuto)
        {
            this.McObj.IsAuto = isAuto;
            DisplayController.Events_Write($"{this.Code} > [CONFIG] {(this.McObj.IsAuto ? "Auto" : "Manual")}");

        }


        public void Execute()
        {
            base.Execute(null);
        }

        private string ErrorMessageOld = "";
        protected override NullCriteria ExecuteChild(NullCriteria request)
        {
            bool isError = false;
            try
            {
                if (this.McObj != null)
                {
                    //this._0_Read_Database_Change();
                    if (this.McObj.IsOnline && this.PlcADO.IsConnect)
                    {
                        this._1_Read_Plc2McObj_OnRun();
                        if (this.McObj.IsAuto)
                        {
                            this._2_ExecuteChild_OnRun();
                        }
                        this._3_Write_Cmd2Plc_OnRun();
                    }
                    this._4_DBLog_OnRun();
                    this._5_MessageLog_OnRun();
                }
                else
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V0_MC_NOT_FOUND);
                }
                this.ErrorMessageOld = "";
            }
            catch (AMWException ex)
            {
                if(ex.Message != this.ErrorMessageOld)
                {
                    this.ErrorMessageOld = ex.Message;
                    DisplayController.Events_Write($"{this.Code} > [ERROR] {ex.Message} ...(5000ms)");
                    DisplayController.Events_Write($"{this.Code} > {ex.StackTrace}");
                }
                this._5_MessageLog_OnRun(ex.Message);
                isError = true;
            }
            catch (Exception ex)
            {
                if (ex.Message != this.ErrorMessageOld)
                {
                    this.ErrorMessageOld = ex.Message;
                    DisplayController.Events_Write($"{this.Code} > [ERROR] {ex.Message} ...(5000ms)");
                    DisplayController.Events_Write($"{this.Code} > {ex.StackTrace}");
                }
                this.Logger.LogError(ex.Message);
                this._5_MessageLog_OnRun(ex.Message);
                isError = true;
            }
            finally
            {
                if(isError)
                    Thread.Sleep(5000);
            }

            return null;

        }
        private void _0_Read_Database_Change()
        {
            var _mcMst = DataADO.GetInstant().SelectByID<acs_McMaster>(this.McMst.ID.Value, this.BuVO);
            var _mcObj = DataADO.GetInstant().SelectByID<act_McObject>(this.McObj.ID.Value, this.BuVO);

            if (this.McObj.IsAuto != _mcObj.IsAuto)
                this.SetAuto(_mcObj.IsAuto);
            if (this.McObj.IsOnline != _mcObj.IsOnline)
                this.SetOnline(_mcObj.IsOnline);
            if (this.McMst.Info1 != _mcMst.Info1)
                this.McMst.Info1 = _mcMst.Info1;
            if (this.McMst.Info2 != _mcMst.Info2)
                this.McMst.Info2 = _mcMst.Info2;
            if (this.McMst.Info3 != _mcMst.Info3)
                this.McMst.Info3 = _mcMst.Info3;
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
                var deviceType = t_McObj.GetField("DV_" + name).FieldType;
                if (deviceType == typeof(string))
                {
                    var valWord = t_McMst.GetField("DW_" + name).GetValue(McMst).Get2<int>();
                    t_McObj.GetField("DV_" + name).SetValue(McObj, this.PlcADO.GetDeviceString(deviceKey, valWord));
                }
                else if (deviceType == typeof(short))
                    t_McObj.GetField("DV_" + name).SetValue(McObj, this.PlcADO.GetDevice<short>(deviceKey));
                else if (deviceType == typeof(int))
                    t_McObj.GetField("DV_" + name).SetValue(McObj, this.PlcADO.GetDevice<int>(deviceKey));
                else if (deviceType == typeof(long))
                    t_McObj.GetField("DV_" + name).SetValue(McObj, this.PlcADO.GetDevice<long>(deviceKey));
                else if (deviceType == typeof(float))
                    t_McObj.GetField("DV_" + name).SetValue(McObj, this.PlcADO.GetDevice<float>(deviceKey));
                else if (deviceType == typeof(double))
                    t_McObj.GetField("DV_" + name).SetValue(McObj, this.PlcADO.GetDevice<double>(deviceKey));
            });

        }

        private void _2_ExecuteChild_OnRun()
        {
            this.OnRun();

            if (this._Callback_OnChanges != null && this._Callback_OnChanges.Count > 0 && this.EventStatus == McObjectEventStatus.IDEL)
            {
                List<int> i_removes = new List<int>();
                for (int i = 0; i < this._Callback_OnChanges.Count; i++)
                {
                    if (this._Callback_OnChanges[i](this) == LoopResult.Break)
                        i_removes.Add(i);
                }
                i_removes.ForEach(i => this._Callback_OnChanges.RemoveAt(i));
            }

        }

        private void _3_Write_Cmd2Plc_OnRun()
        {
            if (this.McObj.EventStatus == McObjectEventStatus.COMMAND_CONDITION || this.McObj.EventStatus == McObjectEventStatus.COMMAND_WRITING)
            {
                var tMcMst = this.McMst.GetType();
                var tMcObj = this.McObj.GetType();


                bool isNext = false;
                int setComm = -1;
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

                        var _act_sets_comp = _act_sets.QryStrToKeyValues();
                        int maxSeq = this.RunCmdActions.Max(x => x.Seq);
                        string _log_con = $"{this.Code} > [DEVICE BEGIN] ({act.Seq}/{maxSeq}) {act.DKV_Condition}";
                        DisplayController.Events_Write(_log_con);
                        this.Logger.LogInfo(_log_con);

                        _act_sets_comp.ForEach(x2 => {
                            string name = x2.Key;
                            string val = x2.Value;
                            string deviceKey = this.McMst.Get2<string>("DK_" + name);
                            var t_deviceVal = this.McObj.GetType().GetField("DV_" + name).FieldType;

                            DisplayController.Events_Write($"{this.Code} > <setting> {deviceKey}={val}");

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

                            if (name.ToUpper() == "SET_COMM")
                                setComm = val.Get2<int>();
                        });

                        string _log_set = $"{this.Code} > [DEVICE END] ({act.Seq}/{maxSeq})] {_act_sets}";
                        DisplayController.Events_Write(_log_set);
                        this.Logger.LogInfo(_log_set);
                        isNext = true;
                        break;
                    }


                    if (false && string.IsNullOrWhiteSpace(this.McMst.DK_Con_Comm) && isNext && setComm != -1)
                    {
                        var dk = this.McMst.DK_Con_Comm;
                        var dv = this.PlcADO.GetDevice<int>(dk);
                        if (dv == setComm)
                        {
                            this.PlcADO.SetDevice<int>(dk, 0);
                            isNext = true;
                            DisplayController.Events_Write($"{this.Code} > [DEVICE] Complete! Set_Comm = Con_Comm = {dv}");
                        }
                        else
                        {
                            isNext = false;
                        }

                    }
                }


                if (isNext)
                {
                    this.McObj.CommandAction_Seq++;
                    if (this.McObj.EventStatus == McObjectEventStatus.COMMAND_CONDITION)
                    {
                        this.McObj.EventStatus = McObjectEventStatus.COMMAND_WRITING;
                    }

                    if (this.RunCmdActions.Count <= 0)
                    {
                        this.McObj.Command_ID = null;
                        this.McObj.CommandAction_Seq = null;
                        this.McObj.CommandParameter = null;

                        this.McObj.EventStatus = McObjectEventStatus.DONE;
                        this.Logger.LogInfo("[" + this.McObj.EventStatus + "]");
                    }

                }
            }
            else if (this.McObj.EventStatus == McObjectEventStatus.DONE)
            {
                this.McObj.EventStatus = McObjectEventStatus.IDEL;
                this.Logger.LogInfo("[" + this.McObj.EventStatus + "]");
            }

            if (this.McObj.EventStatus != this._EventStatus_Temp)
            {
                DisplayController.Events_Write($"{this.Code} > [EVT.STATUS] {this.EventStatus}!");
                this._EventStatus_Temp = this.EventStatus;
            }
        }

        private void _4_DBLog_OnRun()
        {
            try
            {
                if (!this.McObj.CompareFields(_McObj_TMP, "CreateBy", "CreateTime", "ModifyBy", "ModifyTime"))
                {
                    DataADO.GetInstant().UpdateBy<act_McObject>(this.McObj, this.BuVO);
                    this._McObj_TMP = this.McObj.Clone();
                    this.IsOnChanged = true;
                }
                if (this.McWork4Work != null &&
                    this.McObj.Cur_Location_ID != this.McWork4Work.Cur_Location_ID)
                {
                    this.McWork4Work.Cur_Location_ID = this.McObj.Cur_Location_ID.Value;
                    this.McWork4Work.Cur_Warehouse_ID = this.Cur_Area.ID.Value;
                    this.McWork4Work.Cur_Area_ID = this.Cur_Area.Warehouse_ID;
                    DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork4Work, this.BuVO);
                    this.IsOnChanged = true;
                }
            }
            catch (Exception ex)
            {
                new AMWException(this.Logger, AMWExceptionCode.S0005, ex.Message);
            }
        }

        public enum McTypeEnum
        {
            NONE,
            CV,
            SRM,
            SHU
        }
        protected abstract McTypeEnum McType { get; }
        protected string GetTextStatus(int status)
        {
            if (McType == McTypeEnum.CV)
                return dic_psts_cv[status];
            else if (McType == McTypeEnum.SHU)
                return dic_psts_shu[status];
            else if (McType == McTypeEnum.SRM)
                return dic_psts_srm[status];
            return "";
        }
        protected string GetTextCommand(int command)
        {
            if (McType == McTypeEnum.CV)
                return dic_comm_cv[command];
            else if (McType == McTypeEnum.SHU)
                return dic_comm_shu[command];
            else if (McType == McTypeEnum.SRM)
                return dic_comm_srm[command];
            return "";
        }
        private void _5_MessageLog_OnRun(string error = "")
        {
            //if (!this.IsOnChanged) { return; }

            if (!this.PlcADO.IsConnect)
            {
                Controller.DisplayController.McLists_Write(this.Code, $"{this.Code} >> PLC Disconnect !!!\n{new string(' ', this.Code.Length)} >>\n{new string(' ', this.Code.Length)} >>");
            }
            else
            {

                string str_line1 =
                    string.Format(
                        "{0} >> [{1}] CMD={2} : {3} | PSTS={4} : {5}"
                        , this.Code                                                 //0
                        , this.EventStatus.ToString().Substring(0, 4)               //1
                        , this.RunCmd != null ? (int)this.RunCmd.McCommandType : 0  //2
                        , GetTextCommand(this.RunCmd != null ? (int)this.RunCmd.McCommandType : 0) //3
                        , this.McObj.DV_Pre_Status                                  //4
                        , GetTextStatus(this.McObj.DV_Pre_Status)                   //5
                        );
                string str_line1_1 =
                    string.Format("{0} >> [{1}] [{2}] | LOC={3} | STEP={4} | ERR={5}"
                        , new string(' ', this.Code.Length)                         //0
                        , this.McObj.IsOnline ? "ON" : "OFF"                  //1
                        , this.McObj.IsAuto ? "AUTO" : "MANUL"                    //2
                        , this.Cur_Location.Code                                    //3
                        , this.StepTxt                                              //4
                        , error                                                     //5
                    );



                List<string> deviceLogs_1 = new List<string>();
                List<string> deviceLogs_2 = new List<string>();
                this.DeviceNames.ForEach(name =>
                {
                    if ((name.StartsWith("Set") || name.StartsWith("Pre")) &&
                            this.McMst.Get2("DK_"+name) != null &&
                            !string.IsNullOrEmpty(this.McMst.Get2<string>("DK_"+name)))
                    {
                        if (name.StartsWith("S"))
                            deviceLogs_1.Add(name.Substring(4) + "=" + this.McObj.Get2<string>("DV_" + name));
                        else if (name.StartsWith("P"))
                            deviceLogs_2.Add(name.Substring(4) + "=" + this.McObj.Get2<string>("DV_" + name));
                    }
                });
                string str_line2_1 =
                    string.Format(
                        "{0} >> [Set] {1}"
                        , new string(' ', this.Code.Length)
                        , string.Join(" | ", deviceLogs_1.ToArray()));
                string str_line2_2 =
                    string.Format(
                        "{0} >> [Pre] {1}"
                        , new string(' ', this.Code.Length)
                        , string.Join(" | ", deviceLogs_2.ToArray()));

                string[] txt3_2 = new string[9];
                string[] txt3_1 = new string[9];
                string str_line3 = string.Format("{0} >> ", new string(' ', this.Code.Length));
                //string str_line4 = string.Format("{0} >> ", txt4[0]);
                if (this.McWork4Work != null)
                {
                    txt3_1[0] = this.McWork4Work.ID.ToString();
                    txt3_1[1] = this.McWork4Work_LabelData;
                    txt3_1[2] = StaticValue.GetLocation(this.McWork4Work.Sou_Location_ID).Code;
                    txt3_1[3] = this.McWork4Work.Des_Location_ID.HasValue ?
                        StaticValue.GetLocation(this.McWork4Work.Des_Location_ID.Value).Code :
                        StaticValue.GetArea(this.McWork4Work.Des_Area_ID).Code;
                    txt3_1[4] = this.McWork4Work.EventStatus.ToString();
                    str_line3 += string.Format("[Q.CUR <=] ID={0} | LABEL={1} | SOU={2} | DES={3} | STS={4}"
                        , txt3_1[0], txt3_1[1], txt3_1[2], txt3_1[3], txt3_1[4]);
                    str_line3 += " /// ";
                }
                if (this.McWork4Receive != null)
                {
                    txt3_2[0] = this.McWork4Receive.ID.ToString();
                    txt3_2[1] = this.McWork4Receive_LabelData;
                    txt3_2[2] = StaticValue.GetLocation(this.McWork4Receive.Sou_Location_ID).Code;
                    txt3_2[3] = this.McWork4Receive.Des_Location_ID.HasValue ?
                        StaticValue.GetLocation(this.McWork4Receive.Des_Location_ID.Value).Code :
                        StaticValue.GetArea(this.McWork4Receive.Des_Area_ID).Code;
                    txt3_2[4] = this.McWork4Receive.EventStatus.ToString();
                    str_line3 += string.Format("[Q.REC =>] ID={0} | LABEL={1} | SOU={2} | DES={3} | STS={4}"
                        , txt3_2[0], txt3_2[1], txt3_2[2], txt3_2[3], txt3_2[4]);
                }


                Controller.DisplayController.McLists_Write(this.Code, $"{str_line1}\n{str_line1_1}\n{str_line2_1}\n{str_line2_2}\n{str_line3}");
                this.IsOnChanged = false;
            }
            
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
