using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria;
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
            this.clear();
            writeEventLog(this.StepTxt + " Status " + this.McObj.DV_Pre_Status);
            this.mainStep = this.StepTxt.Substring(0, 1);
            switch (this.mainStep)
            {


                case "0":
                        //ถ้ารอส่งสินค้า
                        if (cvWorked.Contains(this.McObj.DV_Pre_Status))
                        {
                            break;
                        }

                        //------ตรวจสอบมีคิวงานค้างอยู่
                        string aCmd = " select * from act_McWork " +
                                       " where QueueType = 1 " +
                                       " and Status in (0, 1) " +
                                        " and QueueStatus <= 5 " +
                                        " and Sou_Location_ID = " + this.McObj.Cur_Location_ID.GetValueOrDefault();

                        this.rc8_1McWork= DataADO.GetInstant().QueryString<act_McWork>(aCmd, null, this.BuVO).FirstOrDefault();

                        if (this.rc8_1McWork != null)
                        {
                            writeEventLog("มีคิวงานค้างอยู่ ข้ามไป step 2 ");
                            this.StepTxt = "2.1";
                            break;
                        }

                        //หา baseObject ลำดับแรกที่ถูกสร้างจาก RCO5-3
                        var _mcRCO_McObjID = this.CheckingID();
                        //writeEventLog("0. สแกนบาร์โค๊ดจาก " + McChecking + " McObj.ID " + _mcRCO_McObjID + "  Status " + this.McObj.DV_Pre_Status);
                        if (this.McObj.DV_Pre_Status == 98)
                        {
                            this.rc8_1BaseObject = ADO.WCSDB.DataADO.GetInstant()
                                            .SelectBy<act_BaseObject>(
                                            new SQLConditionCriteria[] {
                                                new SQLConditionCriteria("Warehouse_ID", this.Cur_Area.Warehouse_ID, SQLOperatorType.EQUALS),
                                                new SQLConditionCriteria("McObject_ID", _mcRCO_McObjID, SQLOperatorType.EQUALS),
                                                new SQLConditionCriteria("EventStatus", BaseObjectEventStatus.IDLE, SQLOperatorType.NOTEQUALS),
                                                new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN)
                                            }, BuVO)
                                            .OrderBy(x => x.ID)
                                            .FirstOrDefault();

                            if (this.rc8_1BaseObject != null)
                            {
                                if (this.rc8_1BaseObject.PassFlg.Equals("Y"))
                                {
                                    writeEventLog("1.1 Pass " + this.rc8_1BaseObject.ID);
                                    this.StepTxt = "1.1"; //// สร้าง MCwork
                                    break;
                                }
                                else
                                {
                                    writeEventLog("2.2 สั่ง Reject");
                                    this.StepTxt = "2.2"; /// Reject
                                    break;
                                }

                            }
                        }

                        break;

                case "1":

                    switch (this.StepTxt)
                    {
                        case "1.1": //// สร้าง MCwork
                            if (this.rc8_1BaseObject == null)
                            {
                                writeEventLog(" ไม่พบ BaseObject");
                                this.StepTxt = "0.0";
                                break;
                            }

                            this.rc8_1BuWorkk = DataADO.GetInstant().SelectBy<act_BuWork>(
                               new SQLConditionCriteria[]
                               {
                                    new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN),
                                    new SQLConditionCriteria("ID",this.rc8_1BaseObject.BuWork_ID, SQLOperatorType.EQUALS)
                               }
                               , this.BuVO).FirstOrDefault();                          


                            if (this.rc8_1McWork == null)
                            {

                                var bArea = StaticValueManager.GetInstant().GetArea(this.rc8_1BaseObject.Area_ID);
                                if (bArea == null)
                                {
                                    writeEventLog("3.2.1 ไม่พบข้อมูล Area " + this.rc8_1BaseObject.Area_ID);
                                    this.StepTxt = "0.0";
                                    break;

                                }

                                var bWh = StaticValueManager.GetInstant().GetWarehouse(bArea.Warehouse_ID);
                                if (bWh == null)
                                {
                                    writeEventLog("3.2.2 ไม่พบข้อมูล Warehouse " + bArea.Warehouse_ID);
                                    this.StepTxt = "0.0";
                                    break;

                                }

                                //หา Location ของ Mc
                                var bLocation = StaticValueManager.GetInstant().GetLocation(this.McObj.Cur_Location_ID.GetValueOrDefault());
                                if (bLocation == null)
                                {
                                    writeEventLog("3.2.3 ไม่พบข้อมูล Sou_Location_ID " + this.McObj.Cur_Location_ID);
                                    this.StepTxt = "0.0";
                                    break;

                                }

                                var desLoc = StaticValueManager.GetInstant().GetLocation(this.rc8_1BuWorkk.Des_Location_ID.Value);
                                if (desLoc == null)
                                {
                                    writeEventLog("3.2.4 ไม่พบข้อมูล Des_Location " + this.rc8_1BuWorkk.Des_Location_ID);
                                    this.StepTxt = "0.0";
                                    break;

                                }

                                var desArea = StaticValueManager.GetInstant().GetArea(this.rc8_1BuWorkk.Des_Area_ID.Value);
                                if (desArea == null)
                                {
                                    writeEventLog("3.2.5 ไม่พบข้อมูล Des_Area " + this.rc8_1BuWorkk.Des_Area_ID);
                                    this.StepTxt = "0.0";
                                    break;

                                }

                                var desWh = StaticValueManager.GetInstant().GetWarehouse(this.rc8_1BuWorkk.Des_Warehouse_ID.Value);
                                if (desWh == null)
                                {
                                    writeEventLog("3.2.6 ไม่พบข้อมูล Des_Warehouse " + this.rc8_1BuWorkk.Des_Warehouse_ID);
                                    this.StepTxt = "0.0";
                                    break;

                                }

                                if (this.rc8_1BaseObject != null)
                                {
                                    this.rc8_1BaseObject.EventStatus = BaseObjectEventStatus.INBOUND;
                                    this.rc8_1BaseObject.McObject_ID = this.McObj.ID;
                                    DataADO.GetInstant().UpdateBy<act_BaseObject>(this.rc8_1BaseObject, this.BuVO);
                                    writeEventLog("1.1 รับคิวงาน");
                                }

                                this.rc8_1McWork = new act_McWork()
                                {
                                    ID = null,
                                    IOType = IOType.INBOUND,
                                    QueueType = (int)QueueType.QT_1,
                                    WMS_WorkQueue_ID = this.rc8_1BuWorkk.ID.Value,
                                    BuWork_ID = this.rc8_1BuWorkk.ID.Value,
                                    TrxRef = this.rc8_1BuWorkk.TrxRef,

                                    Priority = this.rc8_1BuWorkk.Priority,
                                    SeqGroup = this.rc8_1BuWorkk.SeqGroup,
                                    SeqItem = this.rc8_1BuWorkk.SeqIndex,

                                    BaseObject_ID = rc8_1BaseObject.ID.Value,
                                    //Rec_McObject_ID = this.ID,
                                    Rec_McObject_ID = null,
                                    Cur_McObject_ID = null,

                                    Cur_Warehouse_ID = bWh.ID.Value,
                                    Cur_Area_ID = this.rc8_1BaseObject.Area_ID,
                                    Cur_Location_ID = this.rc8_1BaseObject.Location_ID,

                                    Sou_Area_ID = bArea.ID.Value,
                                    Sou_Location_ID = bLocation.ID.Value,

                                    Des_Area_ID = desArea.ID.Value,

                                    ActualTime = DateTime.Now,
                                    StartTime = DateTime.Now,
                                    EndTime = null,
                                    EventStatus = McWorkEventStatus.ACTIVE_RECEIVE,
                                    Status = EntityStatus.ACTIVE,

                                    MixLot = "Y",

                                    TreeRoute = "{}"
                                };
                                this.rc8_1McWork.ID = ADO.WCSDB.DataADO.GetInstant().Insert<act_McWork>(this.rc8_1McWork, this.BuVO);

                                writeEventLog("1.2 สร้างคิวงาน McWork");

                                this.rc8_1BuWorkk.Status = EntityStatus.ACTIVE;
                                this.rc8_1BuWorkk.WMS_WorkQueue_ID = this.rc8_1McWork.ID;
                                DataADO.GetInstant().UpdateBy<act_BuWork>(this.rc8_1BuWorkk, this.BuVO);

                                writeEventLog("1.3 อัพเดตคิวงาน BuWork");
                                this.StepTxt = "0.0";
                                break;

                            }





                            break;

                        case "1.2":
                            break;
                    }

                    break;

                case "2":
                    switch (this.StepTxt)
                    {
                        case "2.1":
                            if (this.rc8_1McWork != null)
                            {
                                if (this.rc8_1McWork.QueueStatus == 5) //---สั่งยก
                                {
                                    this.StepTxt = "3.1";
                                    break;
                                }
                                else if (this.rc8_1McWork.QueueStatus == 7) // --- Reject ของเต็ม
                                {
                                    this.StepTxt = "3.2";
                                    break;
                                }
                                else
                                {
                                    this.StepTxt = "0.0";
                                    break;
                                }
                            }
                                break;

                        case "2.2":
                            

                            if (this.rc8_1BaseObject != null)
                            {
                                this.PostCommand(McCommandType.CM_14);
                                this.rc8_1BaseObject.Status = EntityStatus.REMOVE;
                                DataADO.GetInstant().UpdateBy<act_BaseObject>(this.rc8_1BaseObject, this.BuVO);


                                writeEventLog("4.1 Reject จากจุดซ้อนพาเลท");
                                this.StepTxt = "4.1";
                                break;
                            }
                            

                            break;
                    }


                    break;
                     
                case "3":

                    switch (this.StepTxt)
                    {
                        case "3.1":

                            if (this.McObj.DV_Pre_Status == 98)
                            {

                                //สั่งให้ Conveyor เริ่มทำงานเก็บ
                                this.PostCommand(McCommandType.CM_1, ListKeyValue<string, object>
                                .New("Set_SouLoc", 0)
                                .Add("Set_DesLoc", 0)
                                .Add("Set_Unit", 1)
                                .Add("Set_PalletID", "A000000020")
                                .Add("Set_Weigh", 1500)
                                .Add("Set_Comm", 1));
                                writeEventLog("3.1 สั่งให้ Conveyor เริ่มทำงานเก็บ");

                                if (this.rc8_1McWork != null)
                                {
                                    this.rc8_1McWork.EventStatus = McWorkEventStatus.ACTIVE_WORKING;
                                    this.rc8_1McWork.ActualTime = DateTime.Now;
                                    DataADO.GetInstant().UpdateBy<act_McWork>(this.rc8_1McWork, this.BuVO);
                                }

                                this.StepTxt = "0.0";
                                break;


                                //if (this.PostCommand(McCommandType.CM_1, 0, 0, 1, "A000000020", 1500, (mc) =>
                                //{
                                //    if (mc.McObj.DV_Pre_Status == 1)
                                //    {
                                //        this.StepTxt = "0.0";
                                //        return LoopResult.Break;
                                //    }
                                //    return LoopResult.Continue;
                                //}))
                                //{
                                //    //this.StepTxt = "2.3";
                                //}

                            } 

                            break;

                        case "3.2":
                            if (this.rc8_1McWork != null && this.rc8_1McWork.QueueStatus == 7)
                            {
                                this.PostCommand(McCommandType.CM_13);

                                this.rc8_1McWork.EventStatus = McWorkEventStatus.REMOVE_QUEUE;
                                this.rc8_1McWork.Status = EntityStatus.REMOVE;
                                DataADO.GetInstant().UpdateBy<act_McWork>(this.rc8_1McWork, this.BuVO);
                                writeEventLog(" 3.2 Reject พื้นที่จัดเก็บเต็ม");

                                this.StepTxt = "4.1";
                                break;
                            }
                            break;
                    } 
                    break;

                case "4":
                    switch (this.StepTxt)
                    {
                        case "4.1":
                            if (this.McObj.DV_Pre_Status == 1)
                            {
                                this.StepTxt = "0.0";
                            }
                            break;

                        case "4.2":
                            break;
                    }
                    break;






            }
        }
        protected override void OnStart()
        {
            this.StepTxt = "0.0";
        }
        protected override void OnEnd()
        {
        }

        #region Declare variable;
        private act_McWork rc8_1McWork;
        private acs_McMaster rc8_1McMaster;
        private act_BuWork rc8_1BuWorkk;
        private act_BaseObject rc8_1BaseObject;
        private BaseMcRuntime rco5_3McRunTime;
        private string LabelData { get; set; }
        string McChecking = InboundUtil.AppWHAutoChecking ; // Test "RCO5-3"
        string mainStep;
        private long? BuWork_ID;
        private long? BaseObject_ID;
        private float disCharge;
        private int[] cvWorked = new int[] { 4, 14 };
        //string McChecking = PropertyFileManager.GetInstant().Get(PropertyConst.APP_KEY_machine_checking)[PropertyConst.APP_KEY_machine_checking];
        #endregion

        #region Methods
        private void writeEventLog(string _msg)
        {
            string msg = " > Working step " + this.StepTxt + " | Message =" + _msg;

            DisplayController.Events_Write(this.Code, msg);
        }

        private void clear()
        {
            if (this.McObj.DV_Pre_Status == 96)
            {
                //คำสั่งงานล่าสุดยังไม่เรียบร้อย
                writeEventLog(" ทำคำสั่งงานล่าสุดที่ยังไม่เรียบร้อย");
                this.PostCommand(McCommandType.CM_3);

            }
            else if (this.McObj.DV_Pre_Status == 99)
            {
                //ทำงานเสร็จแล้ว ยืนยันจบงาน
                writeEventLog(" ยืนยันจบงาน");
                this.PostCommand(McCommandType.CM_99);

            }
        }

        private long? CheckingID()
        {
            //หา baseObject ลำดับแรกที่ถูกสร้างจาก RCO5-3
            this.rco5_3McRunTime = McRuntimeController.GetInstant().GetMcRuntime(McChecking);
            var _mcRCO_McObjID = this.rco5_3McRunTime != null ? this.rco5_3McRunTime.McObj.ID : 0;

            //writeEventLog("สแกนบาร์โค๊ดจาก " + McChecking + " McObj.ID " + _mcRCO_McObjID);

            return _mcRCO_McObjID;
        }

        private act_BaseObject getRC8_1BaseObject(long? _mcRCO_McObjID)
        {
            var rc8_1BaseObject = ADO.WCSDB.DataADO.GetInstant()
                                        .SelectBy<act_BaseObject>(
                                        new SQLConditionCriteria[] {
                                            new SQLConditionCriteria("Warehouse_ID", this.Cur_Area.Warehouse_ID, SQLOperatorType.EQUALS),
                                            new SQLConditionCriteria("McObject_ID", _mcRCO_McObjID, SQLOperatorType.EQUALS),
                                            new SQLConditionCriteria("EventStatus", BaseObjectEventStatus.IDLE, SQLOperatorType.NOTEQUALS),
                                            new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN)
                                        }, BuVO)
                                        .OrderBy(x => x.ID)
                                        .FirstOrDefault();

            return rc8_1BaseObject;
        }

        private act_BuWork getRC8_1BuWork(string _labelData)
        {
           var rc8_1BuWorkk = DataADO.GetInstant().SelectBy<act_BuWork>(
                                new SQLConditionCriteria[]
                                {
                                    new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN),
                                    new SQLConditionCriteria("Des_Warehouse_ID",  this.Cur_Area.Warehouse_ID, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("IOType",  IOType.INBOUND, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("LabelData",_labelData, SQLOperatorType.EQUALS)
                                }
                                , this.BuVO).FirstOrDefault();

            return rc8_1BuWorkk;
        }

        private act_McWork getRC8_1McWork(long? BaseObject_ID)
        {
            var rc8_1McWork = DataADO.GetInstant().SelectBy<act_McWork>(
                            new SQLConditionCriteria[]
                            {
                                    new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN),
                                    new SQLConditionCriteria("IOType",  IOType.INBOUND, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("QueueType",  QueueType.QT_1, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("BaseObject_ID",  BaseObject_ID, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("EventStatus",  22, SQLOperatorType.NOTEQUALS),
                                    new SQLConditionCriteria("Sou_Location_ID",this.McObj.Cur_Location_ID.GetValueOrDefault(), SQLOperatorType.EQUALS)
                            }
                        , this.BuVO).FirstOrDefault();

            return rc8_1McWork;
        }


        #endregion

    }
}
