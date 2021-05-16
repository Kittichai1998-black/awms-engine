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

            this.mainStep = this.StepTxt.Substring(0, 1);
            switch (this.mainStep)
            {
                case "0":
                    //Check สแกนบาร์โค๊ด
                    writeEventLog("0. Check พาเลท และ สแกนบาร์โค๊ด Status " + this.McObj.DV_Pre_Status);
                    if (this.McObj.DV_Pre_Status == 98)
                    {
                        //หา baseObject ลำดับแรกที่ถูกสร้างจาก RCO5-3
                        this.rco5_3McRunTime = McRuntimeController.GetInstant().GetMcRuntime(McChecking);
                        var _mcRCO_McObjID = this.rco5_3McRunTime != null ? this.rco5_3McRunTime.McObj.ID : 0;

                        writeEventLog("0.2.0 สแกนบาร์โค๊ดจาก " + McChecking + " McObj.ID " + _mcRCO_McObjID);

                        if (_mcRCO_McObjID == 0)
                        {
                            writeEventLog("0.2.1 ไม่พบจุดสแกนบาร์โค๊ด");
                            this.StepTxt = "0.0";
                            break;
                        }

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

                        if (this.rc8_1BaseObject == null)
                        {
                            writeEventLog("0.2.2 ไม่พบข้อมูลพาเลทสินค้า");
                            this.StepTxt = "0.0";
                            break;
                        }

                        this.LabelData = this.rc8_1BaseObject.LabelData;
                        writeEventLog(" พบ Label สินค้า" + this.LabelData);

                        if (String.IsNullOrWhiteSpace(this.LabelData))
                        {
                            writeEventLog("0.2.3 ไม่พบ Label สินค้า");
                            this.StepTxt = "0.0";
                            break;
                        }

                        writeEventLog(" พบ PassFlg" + this.rc8_1BaseObject.PassFlg);

                        if (!String.IsNullOrWhiteSpace(this.rc8_1BaseObject.PassFlg) && this.rc8_1BaseObject.PassFlg == "N")
                        {
                            writeEventLog("0.2.4 พบ Reject จากจุดซ้อนพาเลท");
                            this.StepTxt = "4.2";
                            break;
                        }

                        writeEventLog("0.1 พบพาเลทสินค้า " + this.LabelData);
                        this.StepTxt = "1.1";
                        break;


                    }


                    break;

                case "1":
                    switch (this.StepTxt)
                    {
                        case "1.1":
                            //ตรวจสอบงานรับเข้า BuWork
                            if (this.McObj.DV_Pre_Status == 98)
                            {
                                writeEventLog("1. ตรวจสอบงานรับเข้า BuWork");

                                this.rc8_1BuWorkk = DataADO.GetInstant().SelectBy<act_BuWork>(
                                new SQLConditionCriteria[]
                                {
                                    new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN),
                                    new SQLConditionCriteria("Des_Warehouse_ID",  this.Cur_Area.Warehouse_ID, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("IOType",  IOType.INBOUND, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("LabelData",this.LabelData, SQLOperatorType.EQUALS)
                                }
                                , this.BuVO).FirstOrDefault();

                                if (this.rc8_1BuWorkk == null)
                                {
                                    writeEventLog("1.2 ไม่พบข้อมูลรับเข้า " + this.LabelData);
                                    this.StepTxt = "0.0";
                                    break;
                                }

                                this.BuWork_ID = this.rc8_1BuWorkk != null ? this.rc8_1BuWorkk.ID : 0;
                                this.disCharge = this.rc8_1BuWorkk == null ? this.rc8_1BuWorkk.DisCharge : 0;

                                writeEventLog("1.1 ข้อมูลรับเข้า BuWork ID " + this.BuWork_ID);
                                this.StepTxt = "3.1";
                                break;

                            }

                            break;
                    }


                    break;

                case "2":
                    switch (this.StepTxt)
                    {
                        case "2.1":
                            //สร้างข้อมูลพาเลท BaseObject
                            if (this.rc8_1BuWorkk != null && this.rc8_1BaseObject == null)
                            {
                                writeEventLog("2. สร้างข้อมูลพาเลท BaseObject");
                            }
                            this.StepTxt = "0.0";

                            break;
                    }



                    break;

                case "3":
                    switch (this.StepTxt)
                    {
                        case "3.1":
                            //สร้างคิวงาน McWork
                            if (this.rc8_1BuWorkk == null || this.rc8_1BaseObject == null)
                            {
                                this.StepTxt = "0.0";
                                break;
                            }

                            this.rc8_1BaseObject.DisCharge = this.rc8_1BuWorkk == null ? 0 : this.rc8_1BuWorkk.DisCharge;
                            this.rc8_1BaseObject.Customer = this.rc8_1BuWorkk == null ? null : this.rc8_1BuWorkk.Customer;
                            this.rc8_1BaseObject.SkuCode = this.rc8_1BuWorkk == null ? null : this.rc8_1BuWorkk.SkuCode;
                            this.rc8_1BaseObject.SkuGrade = this.rc8_1BuWorkk == null ? null : this.rc8_1BuWorkk.SkuGrade;
                            this.rc8_1BaseObject.SkuLot = this.rc8_1BuWorkk == null ? null : this.rc8_1BuWorkk.SkuLot;
                            this.rc8_1BaseObject.SkuItemNo = this.rc8_1BuWorkk == null ? null : this.rc8_1BuWorkk.ItemNo;
                            this.rc8_1BaseObject.SkuQty = this.rc8_1BuWorkk == null ? 0 : this.rc8_1BuWorkk.SkuQty;
                            this.rc8_1BaseObject.SkuUnit = this.rc8_1BuWorkk == null ? null : this.rc8_1BuWorkk.SkuUnit;
                            this.rc8_1BaseObject.SkuStatus = this.rc8_1BuWorkk == null ? null : this.rc8_1BuWorkk.SkuStatus;

                            DataADO.GetInstant().UpdateBy<act_BaseObject>(this.rc8_1BaseObject, this.BuVO);
                            writeEventLog("3.1.1 Update ข้อมูลพาเลท จาก BuWork");

                            //Check คิวงาน McWork
                            this.rc8_1McWork = DataADO.GetInstant().SelectBy<act_McWork>(
                            new SQLConditionCriteria[]
                            {
                                    new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN),
                                    new SQLConditionCriteria("IOType",  IOType.INBOUND, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("QueueType",  QueueType.QT_1, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("BaseObject_ID",  this.rc8_1BaseObject.ID, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("EventStatus",  22, SQLOperatorType.NOTEQUALS),
                                    new SQLConditionCriteria("Sou_Location_ID",this.McObj.Cur_Location_ID.GetValueOrDefault(), SQLOperatorType.EQUALS)
                            }
                        , this.BuVO).FirstOrDefault();

                            if (this.rc8_1BuWorkk != null && this.rc8_1BaseObject != null && this.rc8_1McWork != null)
                            {
                                this.StepTxt = "4.1";
                                break;
                            }

                            if (this.rc8_1BuWorkk != null && this.rc8_1BaseObject != null && this.rc8_1McWork == null)
                            {
                                writeEventLog("3. Check คิวงาน McWork");

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

                                

                                this.rc8_1BaseObject.EventStatus = BaseObjectEventStatus.INBOUND;
                                this.rc8_1BaseObject.McObject_ID = this.McObj.ID;
                                DataADO.GetInstant().UpdateBy<act_BaseObject>(this.rc8_1BaseObject, this.BuVO);
                                writeEventLog("3.1.2 รับคิวงาน");

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

                                writeEventLog("3.1.3 สร้างคิวงาน McWork");

                                this.rc8_1BuWorkk.Status = EntityStatus.ACTIVE;
                                this.rc8_1BuWorkk.WMS_WorkQueue_ID = this.rc8_1McWork.ID;
                                DataADO.GetInstant().UpdateBy<act_BuWork>(this.rc8_1BuWorkk, this.BuVO);

                                writeEventLog("3.1.3 อัพเดตคิวงาน BuWork");

                                this.StepTxt = "4.1";
                                break;

                            }

                            break;
                    }




                    break;

                case "4":
                    //Check ความพร้อมคิวงาน
                    switch (this.StepTxt)
                    {
                        case "4.1":
                            //Check ความพร้อมคิวงาน
                            if (this.McObj.DV_Pre_Status == 98)
                            {
                                this.rc8_1McWork = DataADO.GetInstant().SelectBy<act_McWork>(
                                                    new SQLConditionCriteria[]
                                                    {
                                                            new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN),
                                                            new SQLConditionCriteria("QueueType",  QueueType.QT_1, SQLOperatorType.EQUALS),
                                                            new SQLConditionCriteria("IOType",  IOType.INBOUND, SQLOperatorType.EQUALS),
                                                            new SQLConditionCriteria("BaseObject_ID",  this.rc8_1BaseObject.ID, SQLOperatorType.EQUALS),
                                                            new SQLConditionCriteria("EventStatus",  22, SQLOperatorType.NOTEQUALS),
                                                            new SQLConditionCriteria("Sou_Location_ID",this.McObj.Cur_Location_ID.GetValueOrDefault(), SQLOperatorType.EQUALS)
                                                    }
                                                , this.BuVO).FirstOrDefault();

                                if (this.rc8_1McWork != null && this.rc8_1McWork.Des_Location_ID != 0 && this.rc8_1McWork.Rec_McObject_ID != 0)
                                {
                                    writeEventLog("4.1 Check ความพร้อมคิวงาน ปลายทาง " + this.rc8_1McWork.Des_Location_ID + " Shuttle ID " + this.rc8_1McWork.Rec_McObject_ID);
                                    if (this.rc8_1McWork.QueueStatus >= 5)
                                    {
                                        if (this.rc8_1McWork.QueueStatus != 7)
                                        {
                                            writeEventLog(" คิวงาน พร้อมเก็บ");

                                            this.StepTxt = "5.1";
                                            break;
                                        }
                                        else
                                        {
                                            //พื้นที่จัดเก็บเต็ม
                                            writeEventLog("คิวงาน ไม่พร้อมเก็บ พื้นที่จัดเก็บเต็ม");

                                            this.StepTxt = "5.2";
                                            break;
                                        }
                                    }


                                    

                                }
                            }
                            break;

                        case "4.2":
                            //Reject จากจุดซ้อนพาเลท
                            var mcWork = DataADO.GetInstant().SelectBy<act_McWork>(
                                                    new SQLConditionCriteria[]
                                                    {
                                                            new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN),
                                                            new SQLConditionCriteria("QueueType",  QueueType.QT_1, SQLOperatorType.EQUALS),
                                                            new SQLConditionCriteria("IOType",  IOType.INBOUND, SQLOperatorType.EQUALS),
                                                            new SQLConditionCriteria("Sou_Location_ID",this.McObj.Cur_Location_ID.GetValueOrDefault(), SQLOperatorType.EQUALS)
                                                    }
                                                , this.BuVO).FirstOrDefault();

                            if (mcWork == null)
                            {
                                //สั่ง Reject
                                this.PostCommand(McCommandType.CM_14);

                                if (this.rc8_1BaseObject != null)
                                {
                                    this.rc8_1BaseObject.Status = EntityStatus.REMOVE;
                                    DataADO.GetInstant().UpdateBy<act_BaseObject>(this.rc8_1BaseObject, this.BuVO);
                                }


                                mcWork.EventStatus = McWorkEventStatus.REMOVE_QUEUE;
                                mcWork.Status = EntityStatus.REMOVE;
                                DataADO.GetInstant().UpdateBy<act_McWork>(mcWork, this.BuVO);

                                writeEventLog("4.2 สั่ง Reject");
                            }
                            this.StepTxt = "0.0";
                            break;
                    }



                    break;

                case "5":
                    //เริ่มทำงาน
                    switch (this.StepTxt)
                    {
                        case "5.1":
                            if (this.McObj.DV_Pre_Status == 98)
                            {
                                if(this.rc8_1McWork != null)
                                {
                                    this.rc8_1McWork.EventStatus = McWorkEventStatus.ACTIVE_WORKING;
                                    this.rc8_1McWork.ActualTime = DateTime.Now;
                                    DataADO.GetInstant().UpdateBy<act_McWork>(this.rc8_1McWork, this.BuVO);
                                    writeEventLog("5.1.1 เริ่มงาน");
                                }


                                if(this.rc8_1BaseObject != null)
                                {
                                    var boCode = this.rc8_1BaseObject.Code;
                                    var boQty = this.rc8_1BaseObject.SkuQty;
                                    writeEventLog("BaseObject code " + boCode + " qty " + boQty + " cmd " + McCommandType.CM_1);

                                    if (boQty == 0)
                                    {
                                        boQty = 1500;
                                    }

                                    //สั่งให้ Conveyor เริ่มทำงานเก็บ
                                    this.PostCommand(McCommandType.CM_1, 0, 0, 1, boCode, 1500, () => writeEventLog("5.1.2 สั่งให้ Conveyor เริ่มทำงานเก็บ"));

                                    this.StepTxt = "6.1";
                                    break;

                                    
                                }
                                this.StepTxt = "0.0";
                                break;



                            }
                            
                            break;

                        case "5.2":
                            //Reject จากคิวงาน
                            if (this.rc8_1McWork != null && this.rc8_1McWork.QueueStatus == 7)
                            {
                                this.PostCommand(McCommandType.CM_13);
                                writeEventLog("5.2.1 สั่ง Reject");

                                //Reject พื้นที่จัดเก็บเต็ม
                                if (this.rc8_1BaseObject != null)
                                {
                                    this.rc8_1BaseObject.Status = EntityStatus.REMOVE;
                                    DataADO.GetInstant().UpdateBy<act_BaseObject>(this.rc8_1BaseObject, this.BuVO);
                                    writeEventLog("5.2.2 Remove คิวงาน BaseObject");
                                }
                                    

                                this.rc8_1McWork.EventStatus = McWorkEventStatus.REMOVE_QUEUE;
                                this.rc8_1McWork.Status = EntityStatus.REMOVE;
                                DataADO.GetInstant().UpdateBy<act_McWork>(this.rc8_1McWork, this.BuVO);
                                writeEventLog("5.2.3 Remove คิวงาน McWork");

                                this.StepTxt = "0.0";
                                break;

                            }
                            
                            break;
                    }
                    break;

                case "6":
                    //จบงาน
                    switch (this.StepTxt)
                    {
                        case "6.1":
                            if (this.McObj.DV_Pre_Status == 4 || this.McObj.DV_Pre_Status == 14)
                            {
                                if (this.rc8_1McWork != null && this.rc8_1McWork != null && this.rc8_1McWork.EventStatus == McWorkEventStatus.ACTIVE_WORKING)
                                {
                                    this.rc8_1McWork.EventStatus = McWorkEventStatus.ACTIVE_WORKED;
                                    this.rc8_1McWork.ActualTime = DateTime.Now;
                                    DataADO.GetInstant().UpdateBy<act_McWork>(this.rc8_1McWork, this.BuVO);
                                    writeEventLog("6.1.1 จบคิวงาน Conveyor");

                                    if (this.rc8_1BaseObject != null)
                                    {
                                        this.rc8_1BaseObject.Location_ID = this.McObj.Cur_Location_ID.GetValueOrDefault();
                                        DataADO.GetInstant().UpdateBy(this.rc8_1BaseObject, this.BuVO);
                                        writeEventLog("6.1.2 อัพเดต Location พาเลทสินค้า");
                                    }

                                    

                                    
                                    this.StepTxt = "0.0";
                                    break;
                                }
                            }

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
        private string LabelData;
        string McChecking = "RCO5-3";
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

        #endregion

    }
}
