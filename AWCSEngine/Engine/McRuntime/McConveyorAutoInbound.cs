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
            reset();
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
        private string McNextStep { get; set; }
        #endregion

        #region Methods
        private void Mc_OnRun()
        {
            switch (this.McNextStep)
            {
                case "0":
                    //Check cv status &  pallet qr
                    step0();
                    break;

                case "1":
                    //Create work queue
                    step1();
                    break;

                case "2":
                    //Conveyor ทำงาน
                    step2();
                    break;

                case "3":
                    //จบคิวงาน Conveyor
                    step2();
                    break;

                default:
                    //กำหนดให้ Step ถัดไป = Step ปัจจุบัน
                    clear();
                    this.McNextStep = this.StepTxt;
                    break;
            }
        }

        private void reset()
        {
            this.StepTxt = "0";
            this.McNextStep = "0";
        }

        private void clear()
        {
            if (this.McObj.DV_Pre_Status == 96 && !string.IsNullOrWhiteSpace(this.McObj.DV_Pre_BarProd))
            {
                //คำสั่งงานล่าสุดยังไม่เรียบร้อย
                this.PostCommand(McCommandType.CM_3);
                writeEventLog(baseObj, buWork, " ทำคำสั่งงานล่าสุดที่ยังไม่เรียบร้อย");
            }
            else if (this.McObj.DV_Pre_Status == 99 && !string.IsNullOrWhiteSpace(this.McObj.DV_Pre_BarProd))
            {
                //ทำงานเสร็จแล้ว ยืนยันจบงาน
                this.PostCommand(McCommandType.CM_99);
                writeEventLog(baseObj, buWork, " จบงาน");
            }
        }

        /// <summary>
        /// Check cv status &  pallet qr
        /// </summary>
        private void step0()
        {
            this.StepTxt = "0";
            try
            {
                if (this.McObj.DV_Pre_Status == 98 && !string.IsNullOrWhiteSpace(this.McObj.DV_Pre_BarProd))
                {
                    baseObj = BaseObjectADO.GetInstant().GetByLabel(this.McObj.DV_Pre_BarProd, this.BuVO);
                    if (baseObj == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V0_STO_NOT_FOUND, this.McObj.DV_Pre_BarProd);

                    buWork = DataADO.GetInstant().SelectByID<act_BuWork>(baseObj.BuWork_ID, this.BuVO);
                    if (buWork == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V0_DOC_NOT_FOUND, this.McObj.BaseObject_ID.ToString());

                    writeEventLog(baseObj, buWork, " Check cv status &  pallet qr");

                    this.McNextStep = "1";
                }else
                {
                    clear();
                }
            }
            catch (Exception ex)
            {
                string msg = this.Code + " > Working step " + this.StepTxt + " | LABEL =" + this.McObj.DV_Pre_BarProd + " | error =" + ex.Message;
                DisplayController.Events_Write(msg);
            }
           
        }

        /// <summary>
        /// Create work queue
        /// </summary>
        private void step1()
        {
            this.StepTxt = "1";
            try
            {
                if (this.McObj.DV_Pre_Status == 98)
                {
                    this.mcWork = DataADO.GetInstant().SelectBy<act_McWork>(
                           ListKeyValue<string, object>
                           .New("QueueType", QueueType.QT_1)
                           .Add("IOType", IOType.INBOUND)
                           .Add("Sou_Location_ID", this.McObj.Cur_Location_ID.GetValueOrDefault())
                           , this.BuVO).FirstOrDefault();

                    //ไม่มีคิวงาน
                    if (this.mcWork == null)
                    {
                        if (!String.IsNullOrWhiteSpace(baseObj.PassFlag) && baseObj.PassFlag.Equals("Y"))
                        {
                            this.createWorkQueue(baseObj, buWork);
                            writeEventLog(baseObj, buWork, "สร้างคิวงาน Cv");
                            this.McNextStep = "2";
                        }
                        else
                        {
                            //Reject จากจุดซ้อนพาเลท
                            baseObj.Status = EntityStatus.REMOVE;
                            DataADO.GetInstant().UpdateBy<act_BaseObject>(baseObj, this.BuVO);

                            this.PostCommand(McCommandType.CM_14);
                            writeEventLog(baseObj, buWork, "Reject จากจุดซ้อนพาเลท");
                            this.McNextStep = "0";
                        }
                    }
                    else
                    {
                        this.McNextStep = "2";
                    }

                }
            }
            catch (Exception ex)
            {
                string msg = this.Code + " > Working step " + this.StepTxt + " | LABEL =" + this.McObj.DV_Pre_BarProd + " | error =" + ex.Message;
                DisplayController.Events_Write(msg);
            }
            
        }

        /// <summary>
        /// Conveyor ทำงาน
        /// </summary>
        private void step2()
        {
            this.StepTxt = "2";
            try
            {
                if (this.McObj.DV_Pre_Status == 98)
                {
                    if (this.mcWork.Des_Location_ID != 0 && this.mcWork.Rec_McObject_ID != 0 && this.mcWork.QueueStatus != 7)
                    {
                        this.mcWork.EventStatus = McWorkEventStatus.ACTIVE_WORKING;
                        this.mcWork.ActualTime = DateTime.Now;
                        DataADO.GetInstant().UpdateBy<act_McWork>(this.mcWork, this.BuVO);

                        //สั่งให้ Conveyor เริ่มทำงานเก็บ
                        this.PostCommand(McCommandType.CM_1, 0, 0, 1, baseObj.Code, (int)baseObj.SkuQty, () => writeEventLog(baseObj, buWork, "Conveyor เริ่มทำงานเก็บ"));

                        writeEventLog(baseObj, buWork, "สั่งให้ Conveyor เริ่มทำงานเก็บ");
                        this.McNextStep = "3";
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

                            this.McNextStep = "0";
                        }
                    }
                }
            }
            catch(Exception ex)
            {
                string msg = this.Code + " > Working step " + this.StepTxt + " | LABEL =" + this.McObj.DV_Pre_BarProd + " | error =" + ex.Message;
                DisplayController.Events_Write(msg);
            }
            
        }

        /// <summary>
        /// จบคิวงาน Conveyor
        /// </summary>
        private void step3()
        {
            this.StepTxt = "3";
            try
            {
                if (this.McObj.DV_Pre_Status == 4 || this.McObj.DV_Pre_Status == 14)
                {
                    if (this.mcWork != null && this.mcWork.EventStatus == McWorkEventStatus.ACTIVE_WORKING)
                    {
                        this.mcWork.EventStatus = McWorkEventStatus.ACTIVE_WORKED;
                        this.mcWork.ActualTime = DateTime.Now;
                        DataADO.GetInstant().UpdateBy<act_McWork>(this.mcWork, this.BuVO);

                        baseObj.Location_ID = this.McObj.Cur_Location_ID.GetValueOrDefault();
                        baseObj.McObject_ID = null;
                        DataADO.GetInstant().UpdateBy(baseObj, this.BuVO);

                        writeEventLog(baseObj, buWork, "จบคิวงาน Conveyor");
                        this.McNextStep = "0";
                    }
                }
            }
            catch (Exception ex)
            {
                string msg = this.Code + " > Working step " + this.StepTxt + " | LABEL =" + this.McObj.DV_Pre_BarProd + " | error =" + ex.Message;
                DisplayController.Events_Write(msg);
            }
            
        }

        private void writeEventLog(act_BaseObject _bo, act_BuWork _bu,string _msg)
        {
            string msg = this.Code + " > Working step " + this.StepTxt + " | LABEL =" + this.McObj.DV_Pre_BarProd + " | DisCharge =" + (_bo != null ?_bo.DisCharge : "");
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
                //var bLocation = this.StaticValue.GetLocation(_bo.Location_ID);

                //หา Location ของ Mc
                var bLocation = this.StaticValue.GetLocation(this.McObj.Cur_Location_ID.GetValueOrDefault());

                var desLoc = this.StaticValue.GetLocation(_bu.Des_Location_ID.Value);
                var desArea = this.StaticValue.GetArea(_bu.Des_Area_ID.Value);
                var desWh = this.StaticValue.GetWarehouse(_bu.Des_Warehouse_ID.Value);

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
                    //Rec_McObject_ID = this.ID,
                    Rec_McObject_ID = null,
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
