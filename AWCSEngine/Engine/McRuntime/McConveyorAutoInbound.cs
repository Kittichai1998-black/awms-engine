using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.Exception;
using AWCSEngine.Controller;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AWCSEngine.Engine.McRuntime
{
    public class McConveyorAutoInbound : BaseMcRuntime
    {
        protected override McTypeEnum McType => McTypeEnum.CV;

        public McConveyorAutoInbound(acs_McMaster mcMst) : base(mcMst)
        {
        }

        private static object _single_thread = new object();
        

        protected override void OnRun()
        {
            //Lock ให้ Thread ทำงานจนจบก่อนที่จะไปทำที่ Thread อื่น
            lock (_single_thread)
            {
                this.Mc_OnRun();
            }
        }
        protected override void OnStart()
        {
        }
        protected override void OnEnd()
        {
        }

        #region Declare variable
        protected string LogCode => this.Code + "_";
        private act_McWork mcWork { get; set; }
        private acs_McMaster _mcSRM { get; set; }
        private act_BuWork buWork { get; set; }
        private act_BaseObject baseObj { get; set; }
        #endregion

        #region Methods
        private void Mc_OnRun()
        {
            if (this.McObj == null) { return; }

            switch (this.McObj.DV_Pre_Status)
            {
                case 4:
                case 14:
                    this.StepTxt = this.LogCode + "1.3";
                    if(this.mcWork != null)
                    {
                        switch (this.mcWork.EventStatus)
                        {
                            case McWorkEventStatus.ACTIVE_WORKING:
                                //จบงาน Cy
                                this.mcWork.EventStatus = McWorkEventStatus.ACTIVE_WORKED;
                                this.mcWork.ActualTime = DateTime.Now;
                                DataADO.GetInstant().UpdateBy<act_McWork>(this.mcWork, this.BuVO);

                                baseObj.Location_ID = this.McObj.Cur_Location_ID.Value;
                                baseObj.McObject_ID = null;
                                DataADO.GetInstant().UpdateBy(baseObj, this.BuVO);

                                var msg = "จบงาน Cy ";

                                //ส่งงานให้ SRM
                                 _mcSRM = this.findSRM(baseObj);
                                if(_mcSRM != null)
                                {
                                    var mcSrm = Controller.McRuntimeController.GetInstant().GetMcRuntime(_mcSRM.Code);
                                    //SRM จอดปกติ
                                    if (mcSrm.McObj.DV_Pre_Status == 90)
                                    {
                                        this.mcWork.Rec_McObject_ID = mcSrm.ID;
                                        this.mcWork.EventStatus = McWorkEventStatus.ACTIVE_RECEIVE;
                                        this.mcWork.ActualTime = DateTime.Now;

                                        msg += " ส่งงานให้ SRM : " + mcSrm.Code ;
                                        DataADO.GetInstant().UpdateBy<act_McWork>(this.mcWork, this.BuVO);
                                    }
                                }

                                writeEventLog(baseObj, buWork, msg);

                                break;

                            case McWorkEventStatus.ACTIVE_WORKED:
                                //ส่งงานให้ SRM
                                 _mcSRM = this.findSRM(baseObj);
                                var msg1 = "งานค้าง ยังไม่มี SRM มารับงาน ";
                                if (_mcSRM != null)
                                {
                                    var mcSrm = Controller.McRuntimeController.GetInstant().GetMcRuntime(_mcSRM.Code);
                                    //SRM จอดปกติ
                                    if (mcSrm.McObj.DV_Pre_Status == 90)
                                    {
                                        this.mcWork.Rec_McObject_ID = mcSrm.ID;
                                        this.mcWork.EventStatus = McWorkEventStatus.ACTIVE_RECEIVE;
                                        this.mcWork.ActualTime = DateTime.Now;

                                        msg1 += " ส่งงานให้ SRM : " + mcSrm.Code;
                                        DataADO.GetInstant().UpdateBy<act_McWork>(this.mcWork, this.BuVO);
                                    }
                                }

                                writeEventLog(baseObj, buWork, msg1);

                                break;
                        }
                    }

                    break;

                case 96:
                    //คำสั่งงานล่าสุดยังไม่เรียบร้อย
                    this.PostCommand(McCommandType.CM_3);
                    break;

                case 98:
                    if (!string.IsNullOrWhiteSpace(this.McObj.DV_Pre_BarProd))
                    {

                         baseObj = BaseObjectADO.GetInstant().GetByLabel(this.McObj.DV_Pre_BarProd, this.BuVO);
                        if (baseObj == null)
                            throw new AMWException(this.Logger, AMWExceptionCode.V0_STO_NOT_FOUND, this.McObj.DV_Pre_BarProd);

                         buWork = DataADO.GetInstant().SelectByID<act_BuWork>(baseObj.BuWork_ID, this.BuVO);
                        if (buWork == null)
                            throw new AMWException(this.Logger, AMWExceptionCode.V0_DOC_NOT_FOUND, this.McObj.DV_Pre_BarProd);

                        this.mcWork = DataADO.GetInstant().SelectBy<act_McWork>(
                        ListKeyValue<string, object>
                        .New("QueueType", QueueType.QT_1)
                        .Add("IOType", IOType.INBOUND)
                        .Add("Rec_McObject_ID", this.McObj.McMaster_ID)
                        , this.BuVO).FirstOrDefault();

                        //ไม่มีคิวงาน
                        if (this.mcWork == null)
                        {
                            
                            if (baseObj != null)
                            {
                                this.StepTxt = this.LogCode + "1.1";
                                if (!String.IsNullOrWhiteSpace(baseObj.PassFlag) && baseObj.PassFlag.Equals("Y"))
                                {
                                    this.createWorkQueue(baseObj, buWork);
                                    writeEventLog(baseObj, null, "สร้างคิวงาน Cv");
                                }
                                else
                                {
                                    //Reject จากจุดซ้อนพาเลท
                                    baseObj.Status = EntityStatus.REMOVE;
                                    DataADO.GetInstant().UpdateBy<act_BaseObject>(baseObj, this.BuVO);

                                    this.PostCommand(McCommandType.CM_14);
                                    writeEventLog(baseObj, buWork, "Reject จากจุดซ้อนพาเลท");
                                    this.StepTxt = string.Empty;
                                }
                            }
                        }
                        else  //มีคิวงาน
                        {
                            this.StepTxt = this.LogCode + "1.2";   
                            //คิวพร้อมเก็บ
                            if(this.mcWork.Des_Location_ID != 0 && this.mcWork.Rec_McObject_ID != 0 && this.mcWork.QueueStatus != 7)
                            {
                                this.mcWork.ActualTime = DateTime.Now;
                                DataADO.GetInstant().UpdateBy<act_McWork>(this.mcWork, this.BuVO);

                                //สั่งให้ Conveyor เริ่มทำงานเก็บ
                                this.PostCommand(McCommandType.CM_1, 0, 0, 1, baseObj.Code, (int)baseObj.WeiKG, () => writeEventLog(baseObj, buWork, "Conveyor เริ่มทำงานเก็บ"));
                            }
                            else
                            {
                                //พื้นที่จัดเก็บเต็ม
                                if (this.mcWork.QueueStatus != 7)
                                {
                                    //Reject พื้นที่จัดเก็บเต็ม
                                    baseObj.Status = EntityStatus.REMOVE;
                                    DataADO.GetInstant().UpdateBy<act_BaseObject>(baseObj, this.BuVO);

                                    this.mcWork.EventStatus = McWorkEventStatus.REMOVE_QUEUE;
                                    this.mcWork.Status = EntityStatus.REMOVE;
                                    DataADO.GetInstant().UpdateBy<act_McWork>(this.mcWork, this.BuVO);

                                    this.PostCommand(McCommandType.CM_13);
                                    writeEventLog(baseObj, buWork, "Reject พื้นที่จัดเก็บเต็ม");
                                }
                            }
                            
                        }
                    }
                    break;
            }
        }

        private void writeEventLog(act_BaseObject _bo, act_BuWork _bu,string _msg)
        {
            string msg = this.Code + " > Working | LABEL =" + this.McObj.DV_Pre_BarProd + " | DisCharge =" + (_bo != null ?_bo.DisCharge : "");
            msg += " | BuWork_ID =" + (_bo != null ? _bo.BuWork_ID : "") + " | BaseObject_ID =" + (_bo != null ? _bo.ID : "") + " | Checking Status =" + (_bo != null ? _bo.PassFlag : "");
            msg += " | WorkQueue_ID =" + (_bo != null ? _bu.WMS_WorkQueue_ID : "") + " | Message =" + _msg;

            DisplayController.Events_Write(msg);
        }

        private void createWorkQueue(act_BaseObject _bo, act_BuWork _bu)
        {
            if(_bo != null)
            {
                _bo.EventStatus = BaseObjectEventStatus.INBOUND;
                _bo.McObject_ID = this.ID;
                DataADO.GetInstant().UpdateBy<act_BaseObject>(_bo, this.BuVO);

                var bArea = this.StaticValue.GetArea(_bo.Area_ID);
                var bWh = this.StaticValue.GetWarehouse(bArea.Warehouse_ID);
                var bLocation = this.StaticValue.GetLocation(_bo.Location_ID);

                var desLoc = StaticValueManager.GetInstant().GetLocation(_bu.Des_Location_ID.Value);
                var desArea = StaticValueManager.GetInstant().GetArea(_bu.Des_Area_ID.Value);
                var desWh = StaticValueManager.GetInstant().GetWarehouse(_bu.Des_Warehouse_ID.Value);

                act_McWork mq = new act_McWork()
                {
                    ID = null,
                    IOType = IOType.INBOUND,
                    QueueType = (int)QueueType.QT_1,
                    WMS_WorkQueue_ID = _bu.ID.Value,
                    BuWork_ID = _bu.ID.Value,
                    TrxRef = _bu.TrxRef,

                    Priority = _bu.Priority,
                    SeqGroup = _bu.SeqGroup,
                    SeqItem = _bu.SeqIndex,

                    BaseObject_ID = _bo.ID.Value,
                    Rec_McObject_ID = this.ID,
                    Cur_McObject_ID = null,

                    Cur_Warehouse_ID = bWh.ID.Value,
                    Cur_Area_ID = _bo.Area_ID,
                    Cur_Location_ID = _bo.Location_ID,

                    Sou_Area_ID = bArea.ID.Value,
                    Sou_Location_ID = bLocation.ID.Value,

                    Des_Area_ID = desArea.ID.Value,

                    ActualTime = DateTime.Now,
                    StartTime = DateTime.Now,
                    EndTime = null,
                    EventStatus = McWorkEventStatus.ACTIVE_RECEIVE,
                    Status = EntityStatus.ACTIVE,

                    TreeRoute = "{}"
                };
                mq.ID = ADO.WCSDB.DataADO.GetInstant().Insert<act_McWork>(mq, this.BuVO);

                _bu.Status = EntityStatus.ACTIVE;
                _bu.WMS_WorkQueue_ID = mq.ID;
                DataADO.GetInstant().UpdateBy<act_BuWork>(_bu, this.BuVO);
            }
        }

        private acs_McMaster findSRM(act_BaseObject _bo)
        {
            var mcSRM = DataADO.GetInstant().SelectBy<acs_McMaster>(
                       ListKeyValue<string, object>
                       .New("Warehouse_ID", (_bo!=null?_bo.Warehouse_ID:0))
                       .Add("Info1", "IN")
                       , this.BuVO).FirstOrDefault(x => x.Code.StartsWith("SRM"));

            return mcSRM;
        }
        #endregion

    }
}
