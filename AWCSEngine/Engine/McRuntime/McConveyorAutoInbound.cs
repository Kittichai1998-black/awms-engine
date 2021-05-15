using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Constant.StringConst;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.PropertyFile;
using AWCSEngine.Controller;
using AWCSEngine.Util;
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
            //lock (_single_thread)
            //{
            //    this.Mc_OnRun();
            //}
            this.Mc_OnRun();
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
        private BaseMcRuntime _mcRCO { get; set; }
        string McChecking = PropertyFileManager.GetInstant().Get(PropertyConst.APP_KEY_machine_checking)[PropertyConst.APP_KEY_machine_checking];
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
                    //Check work queue
                    step1();
                    break;

                case "1.1":
                    //Create work queue
                    step1_1();
                    break;

                case "1.2":
                    //Reject พาเลท
                    step1_2();
                    break;

                case "2":
                    //Check คิวงาน พร้อมเก็บ
                    step2();
                    break;

                case "2.1":
                    //สั่งให้ Conveyor เริ่มทำงานเก็บ
                    step2_1();
                    break;

                case "2.2":
                    //Reject คิวงาน
                    step2_2();
                    break;

                case "3":
                    //จบคิวงาน Conveyor
                    step3();
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
                writeEventLog(this.baseObj, this.buWork, " ทำคำสั่งงานล่าสุดที่ยังไม่เรียบร้อย");
            }
            else if (this.McObj.DV_Pre_Status == 99 && !string.IsNullOrWhiteSpace(this.McObj.DV_Pre_BarProd))
            {
                //ทำงานเสร็จแล้ว ยืนยันจบงาน
                this.PostCommand(McCommandType.CM_99);
                writeEventLog(this.baseObj, this.buWork, " จบงาน");
            }
        }

        /// <summary>
        /// Check cv status &  pallet qr
        /// </summary>
        private void step0()
        {
            this.StepTxt = "0";
            
                if (this.McObj.DV_Pre_Status == 98)
                {

                    //หา baseObject ลำดับแรกที่ถูกสร้างจาก RCO5-3
                    this._mcRCO = McRuntimeController.GetInstant().GetMcRuntime(McChecking);
                    this.baseObj = BaseObjectADO.GetInstant().GetCheckingTempByWarehouse(this.Cur_Area.Warehouse_ID, this._mcRCO.McObj.ID, this.BuVO);

                    if (this.baseObj != null)
                    {
                        this.buWork = DataADO.GetInstant().SelectByIDActive<act_BuWork>(this.baseObj.BuWork_ID, this.BuVO);
                        if(this.buWork != null)
                        {
                            this.McNextStep = "1";
                        }
                    }

                    writeEventLog(this.baseObj, this.buWork, " Check baseObject on " + InboundUtil.GetInstant().McChecking + " McObj.ID" + _mcRCO.McObj.ID);



            }
            else
                {
                    clear();
                }
            
           
        }

        /// <summary>
        /// Check work queue
        /// </summary>
        private void step1()
        {
            this.StepTxt = "1";
            
                if (this.McObj.DV_Pre_Status == 98)
                {

                    //this.mcWork = InboundUtil.getMcWorkByQueueType(this.McObj, QueueType.QT_1, this.BuVO);
                    this.mcWork = DataADO.GetInstant().SelectBy<act_McWork>(
                           ListKeyValue<string, object>
                           .New("QueueType", QueueType.QT_1)
                           .Add("IOType", IOType.INBOUND)
                           //.Add("Sou_Location_ID", this.McObj.Cur_Location_ID.GetValueOrDefault())
                           , this.BuVO).FirstOrDefault();

                    //ไม่มีคิวงาน
                    if (this.mcWork == null)
                    {
                        if (this.baseObj != null && !String.IsNullOrWhiteSpace(this.baseObj.PassFlg) && this.baseObj.PassFlg.Equals("Y"))
                        {
                            //writeEventLog(baseObj, buWork, "ไม่มีคิวงาน สร้างคิวงาน");
                            this.McNextStep = "1.1";
                        }
                        else
                        {
                            //writeEventLog(baseObj, buWork, "ไม่มีคิวงาน แต่ Reject");
                            this.McNextStep = "1.2";
                        }
                    }
                    else
                    {
                        //writeEventLog(baseObj, buWork, "มีคิวงาน");
                        this.McNextStep = "2";
                    }

                }
            
            
        }

        private void step1_1()
        {
            this.StepTxt = "1.1";
            
                //InboundUtil.createWorkQueue(this.McObj, baseObj, buWork, this.BuVO);
                if(this.baseObj != null)
                {
                    this.baseObj.EventStatus = BaseObjectEventStatus.INBOUND;
                    this.baseObj.McObject_ID = this.McObj.ID;
                    DataADO.GetInstant().UpdateBy<act_BaseObject>(this.baseObj, BuVO);

                    var bArea = StaticValueManager.GetInstant().GetArea(this.baseObj.Area_ID);
                    var bWh = StaticValueManager.GetInstant().GetWarehouse(bArea.Warehouse_ID);

                    //หา Location ของ Mc
                    var bLocation = StaticValueManager.GetInstant().GetLocation(this.McObj.Cur_Location_ID.GetValueOrDefault());

                    var desLoc = StaticValueManager.GetInstant().GetLocation(this.buWork.Des_Location_ID.Value);
                    var desArea = StaticValueManager.GetInstant().GetArea(this.buWork.Des_Area_ID.Value);
                    var desWh = StaticValueManager.GetInstant().GetWarehouse(this.buWork.Des_Warehouse_ID.Value);

                    act_McWork mq = new act_McWork()
                    {
                        ID = null,
                        IOType = IOType.INBOUND,
                        QueueType = (int)QueueType.QT_1,
                        WMS_WorkQueue_ID = this.buWork.ID.Value,
                        BuWork_ID = this.buWork.ID.Value,
                        TrxRef = this.buWork.TrxRef,

                        Priority = this.buWork.Priority,
                        SeqGroup = this.buWork.SeqGroup,
                        SeqItem = this.buWork.SeqIndex,

                        BaseObject_ID = baseObj.ID.Value,
                        //Rec_McObject_ID = this.ID,
                        Rec_McObject_ID = null,
                        Cur_McObject_ID = null,

                        Cur_Warehouse_ID = bWh.ID.Value,
                        Cur_Area_ID = this.baseObj.Area_ID,
                        Cur_Location_ID = this.baseObj.Location_ID,

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
                    mq.ID = ADO.WCSDB.DataADO.GetInstant().Insert<act_McWork>(mq, BuVO);

                    this.mcWork = mq;

                    this.buWork.Status = EntityStatus.ACTIVE;
                    this.buWork.WMS_WorkQueue_ID = mq.ID;
                    DataADO.GetInstant().UpdateBy<act_BuWork>(buWork, BuVO);
                }
                //writeEventLog(baseObj, buWork, "สร้างคิวงาน Cv");
                this.McNextStep = "2";
            
        }

        /// <summary>
        /// Reject จากจุดซ้อนพาเลท
        /// </summary>
        private void step1_2()
        {
            this.StepTxt = "1.2";

            //Reject จากจุดซ้อนพาเลท
                this.baseObj.Status = EntityStatus.REMOVE;
                DataADO.GetInstant().UpdateBy<act_BaseObject>(this.baseObj, this.BuVO);

                this.PostCommand(McCommandType.CM_14);
                //writeEventLog(baseObj, buWork, "Reject จากจุดซ้อนพาเลท");
                this.McNextStep = "0";
            

            this.McNextStep = "0";
        }


        /// <summary>
        /// Check คิวงาน พร้อมเก็บ
        /// </summary>
        private void step2()
        {
            this.StepTxt = "2";
            
                if (this.McObj.DV_Pre_Status == 98)
                {
                    if (this.mcWork.Des_Location_ID != 0 && this.mcWork.Rec_McObject_ID != 0 && this.mcWork.QueueStatus != 7 && this.mcWork.QueueStatus == 5)
                    {
                        //writeEventLog(baseObj, buWork, " คิวงาน พร้อมเก็บ");

                        this.McNextStep = "2.1";
                    }
                    else
                    {
                        //พื้นที่จัดเก็บเต็ม
                        //writeEventLog(baseObj, buWork, "Reject คิวงาน ไม่พร้อมเก็บ");

                        this.McNextStep = "2.2";
                    }
                }
            
            
        }

        /// <summary>
        /// สั่งให้ Conveyor เริ่มทำงานเก็บ
        /// </summary>
        private void step2_1()
        {
            this.StepTxt = "2.1";

            
                this.mcWork.EventStatus = McWorkEventStatus.ACTIVE_WORKING;
                this.mcWork.ActualTime = DateTime.Now;
                DataADO.GetInstant().UpdateBy<act_McWork>(this.mcWork, this.BuVO);

                //สั่งให้ Conveyor เริ่มทำงานเก็บ
                this.PostCommand(McCommandType.CM_1, 0, 0, 1, this.baseObj.Code, (int)this.baseObj.SkuQty, () => writeEventLog(this.baseObj, this.buWork, "Conveyor เริ่มทำงานเก็บ"));

                //writeEventLog(baseObj, buWork, "สั่งให้ Conveyor เริ่มทำงานเก็บ");
                this.McNextStep = "3";
            
        }

        /// <summary>
        /// Reject คิวงาน
        /// </summary>
        private void step2_2()
        {
            this.StepTxt = "2.2";

            
                if (this.mcWork.QueueStatus != 7)
                {
                //Reject พื้นที่จัดเก็บเต็ม
                    this.baseObj.Status = EntityStatus.REMOVE;
                    DataADO.GetInstant().UpdateBy<act_BaseObject>(this.baseObj, this.BuVO);

                    this.mcWork.EventStatus = McWorkEventStatus.REMOVE_QUEUE;
                    this.mcWork.Status = EntityStatus.REMOVE;
                    DataADO.GetInstant().UpdateBy<act_McWork>(this.mcWork, this.BuVO);

                    this.PostCommand(McCommandType.CM_13);
                    //writeEventLog(baseObj, buWork, "Reject พื้นที่จัดเก็บเต็ม");

                    this.McNextStep = "0";
                }
            

            this.McNextStep = "0";
        }

        /// <summary>
        /// จบคิวงาน Conveyor
        /// </summary>
        private void step3()
        {
            this.StepTxt = "3";
            
                if (this.McObj.DV_Pre_Status == 4 || this.McObj.DV_Pre_Status == 14)
                {
                    if (this.mcWork != null && this.mcWork.EventStatus == McWorkEventStatus.ACTIVE_WORKING)
                    {
                        this.mcWork.EventStatus = McWorkEventStatus.ACTIVE_WORKED;
                        this.mcWork.ActualTime = DateTime.Now;
                        DataADO.GetInstant().UpdateBy<act_McWork>(this.mcWork, this.BuVO);

                        this.baseObj.Location_ID = this.McObj.Cur_Location_ID.GetValueOrDefault();
                        DataADO.GetInstant().UpdateBy(this.baseObj, this.BuVO);

                        //writeEventLog(baseObj, buWork, "จบคิวงาน Conveyor");
                        this.McNextStep = "0";
                    }
                }
            
            
        }

        private void writeEventLog(act_BaseObject _bo, act_BuWork _bu,string _msg)
        {
            string msg = this.Code + " > Working step " + this.StepTxt + " | Message =" + _msg;
            msg += " | LABEL =" + this.McObj.DV_Pre_BarProd + " | DisCharge =" + (_bo != null ?_bo.DisCharge : "");
            msg += " | BuWork_ID =" + (_bo != null ? _bo.BuWork_ID : "") + " | BaseObject_ID =" + (_bo != null ? _bo.ID : "") + " | Checking Status =" + (_bo != null ? _bo.PassFlg : "");
            msg += " | WorkQueue_ID =" + (_bo != null ? _bu.WMS_WorkQueue_ID : "") ;

            DisplayController.Events_Write(msg);
        }

        
        #endregion

    }
}
