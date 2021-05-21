using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.Exception;
using AWCSEngine.Controller;
using AWCSEngine.Util;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AWCSEngine.Engine.McRuntime
{
    public class McConveyorManualInbound : BaseMcRuntime
    {
        protected override McTypeEnum McType => McTypeEnum.CV;

        public McConveyorManualInbound(acs_McMaster mcMst) : base(mcMst)
        {
        }

        private static object _single_thread = new object();


        protected override void OnRun()
        {
            //this.clear();
            writeEventLog(this.StepTxt + " Status " + this.McObj.DV_Pre_Status);
            this.mainStep = this.StepTxt.Substring(0, 1);
            switch (this.mainStep)
            {
                case "0":
                    //ถ้ารอส่งสินค้าให้สถานีถัดไป status 4
                    if (cvWorked.Contains(this.McObj.DV_Pre_Status))
                    {
                        break;
                    }

                    ////------ตรวจสอบมีคิวงานค้างอยู่
                    //string aCmd = " select * from act_McWork " +
                    //               " where QueueType = 1 " +
                    //               " and Status in (0, 1) " +
                    //                " and QueueStatus <= 5 " +
                    //                " and Sou_Location_ID = " + this.McObj.Cur_Location_ID.GetValueOrDefault();

                    //this.rc8_2McWork = DataADO.GetInstant().QueryString<act_McWork>(aCmd, null, this.BuVO).FirstOrDefault();

                    ////----มีคิวงานแล้ว
                    //if (this.rc8_2McWork != null)
                    //{
                    //    this.rc8_2BaseObject = BaseObjectADO.GetInstant().GetByID(this.rc8_2McWork.BaseObject_ID, this.BuVO);
                    //    writeEventLog(" >> มีคิวงานค้างอยู่ ข้ามไป step 4 .1");
                    //    this.StepTxt = "4.1";
                    //    break;
                    //}


                    //Check dimention และ สแกนบาร์โค๊ด
                    writeEventLog("0. Status " + this.McObj.DV_Pre_Status);
                    if (this.McObj.DV_Pre_Status == 98)
                    {

                        this.rc8_2BaseObject = this.getRC8_2BaseObject();

                        if (this.rc8_2BaseObject != null)
                        {
                            this.LabelData = this.rc8_2BaseObject.LabelData;
                            writeEventLog("0.1 Label " + this.LabelData + " McObject_ID" + this.ID);
                            this.StepTxt = "1.1";
                            break;
                        }

                        this.StepTxt = "0.0";
                        break;
                    }

                    if (dimentionErr.Contains(this.McObj.DV_Pre_Status))
                    {
                        this.errCode = this.McObj.DV_Pre_Status;
                        this.cmdReject = (int)McCommandType.CM_14;
                        this.PassFlg = (int)PassFailFlag.Fail;
                        if (this.rc8_2BaseObject != null)
                        {
                            this.rc8_2BaseObject.ErrorCode = this.errCode;
                            this.rc8_2BaseObject.PassFlg = this.PassFlg == 0 ? "N" : "Y";
                            DataADO.GetInstant().UpdateBy<act_BaseObject>(this.rc8_2BaseObject, this.BuVO);
                        }

                        writeEventLog("0.2 Dimention Reject " + " : " + this.errCode);
                        this.StepTxt = "4.2";
                        break;
                    }

                    break;

                case "1":
                    switch (this.StepTxt)
                    {
                        case "1.1":
                            //ตรวจสอบงานรับเข้า BuWork
                            writeEventLog("1. ตรวจสอบงานรับเข้า BuWork , Status " + this.McObj.DV_Pre_Status + " Label " + this.LabelData);
                            if (this.McObj.DV_Pre_Status == 98)
                            {
                                this.LabelData = (this.rc8_2BaseObject != null) ? this.rc8_2BaseObject.LabelData : null;
                                this.LabelData = (this.rc8_2BaseObject != null) ? this.rc8_2BaseObject.LabelData : null;
                                //writeEventLog("1. ตรวจสอบงานรับเข้า BuWork , Label " + this.LabelData);
                                this.rc8_2BuWork = this.getRC8_2BuWork(this.LabelData);

                                this.disCharge = this.rc8_2BuWork == null ? "0" : this.rc8_2BuWork.DisCharge;
                                this.BuWork_ID = this.rc8_2BuWork == null ? 0 : this.rc8_2BuWork.ID;

                                if (this.rc8_2BuWork == null || (this.rc8_2BuWork != null && (this.rc8_2BuWork.DisCharge == "0" || String.IsNullOrWhiteSpace(this.rc8_2BuWork.DisCharge))))
                                {
                                    this.cmdReject = (int)McCommandType.CM_11;
                                    this.PassFlg = (int)PassFailFlag.Fail;

                                    if (this.rc8_2BaseObject != null)
                                    {
                                        this.rc8_2BaseObject.ErrorCode = 111;
                                        this.rc8_2BaseObject.PassFlg = this.PassFlg == 0 ? "N" : "Y";
                                        DataADO.GetInstant().UpdateBy<act_BaseObject>(this.rc8_2BaseObject, this.BuVO);
                                    }

                                    writeEventLog(" >> 1.1.1 ไม่พบข้อมูลรับเข้า ข้ามไป step 4 .2 , Label" + this.LabelData + " DisCharge " + this.disCharge);
                                    this.StepTxt = "4.2";
                                    break;
                                }


                                writeEventLog("1.1 ข้อมูลรับเข้า BuWork ID " + this.BuWork_ID);
                                this.StepTxt = "2.1";
                                break;


                            }

                            break;
                    }


                    break;

                case "2":
                    switch (this.StepTxt)
                    {
                        case "2.1":


                            //------เช็คพาเลทซ้ำ
                            var _BaseObject = ADO.WCSDB.DataADO.GetInstant()
                                       .SelectBy<act_BaseObject>(
                                           new SQLConditionCriteria[] {
                                        new SQLConditionCriteria("Warehouse_ID", this.Cur_Area.Warehouse_ID, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("LabelData", this.rc8_2BaseObject.LabelData, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("Status", new int[] { 0, 1 }, SQLOperatorType.IN)
                                           }, this.BuVO)
                                           .FirstOrDefault(x => x.ID != this.rc8_2BaseObject.ID);

                            if (_BaseObject != null)
                            {
                                this.rc8_2McWork = this.getRC8_2McWork(_BaseObject.ID);
                                if (this.rc8_2McWork == null)
                                {
                                    this.cmdReject = (int)McCommandType.CM_10;
                                    this.PassFlg = (int)PassFailFlag.Fail;

                                    if (this.rc8_2BaseObject != null)
                                    {
                                        this.rc8_2BaseObject.ErrorCode = 110;
                                        this.rc8_2BaseObject.PassFlg = this.PassFlg == 0 ? "N" : "Y";
                                        DataADO.GetInstant().UpdateBy<act_BaseObject>(this.rc8_2BaseObject, this.BuVO);
                                    }

                                    writeEventLog(" >> 2.2.1 ข้อมูลพาเลทซ้ำ " + this.rc8_2BuWork.LabelData);
                                    this.StepTxt = "4.2";
                                    break;
                                }
                            }


                            //--------Pass
                            this.cmdReject = 0;
                            this.PassFlg = 1;
                            this.errCode = 0;

                            if (this.rc8_2BaseObject != null)
                            {
                                this.rc8_2BaseObject.ErrorCode = this.errCode;
                                this.rc8_2BaseObject.PassFlg = this.PassFlg == 0 ? "N" : "Y";
                                DataADO.GetInstant().UpdateBy<act_BaseObject>(this.rc8_2BaseObject, this.BuVO);
                            }

                            writeEventLog(" >> สร้างคิวงาน ข้ามไป step 3 ");
                            this.StepTxt = "3.1";
                            break;


                    }



                    break;

                case "3":
                    switch (this.StepTxt)
                    {
                        case "3.1":
                            //---- Check คิวงานเครื่องจักรค้าง
                            var _mcWork = DataADO.GetInstant().SelectBy<act_McWork>(
                               new SQLConditionCriteria[]
                               {
                                        new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN),
                                        new SQLConditionCriteria("QueueType",  QueueType.QT_1, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("EventStatus",  new int[]{ 22,32}, SQLOperatorType.NOTIN),
                                        new SQLConditionCriteria("Sou_Location_ID",this.McObj.Cur_Location_ID.GetValueOrDefault(), SQLOperatorType.EQUALS)
                               }
                           , this.BuVO).FirstOrDefault(x => x.QueueStatus <= 6);

                            if (_mcWork != null)
                            {
                                writeEventLog("3.1.0 กำลังทำคิวงาน " + _mcWork.ID + " Type " + _mcWork.QueueType + " Status " + _mcWork.QueueStatus);
                            }


                            if (this.rc8_2BuWork != null && this.rc8_2BaseObject != null && _mcWork == null)
                            {

                                var bArea = StaticValueManager.GetInstant().GetArea(this.rc8_2BaseObject.Area_ID);
                                var bWh = StaticValueManager.GetInstant().GetWarehouse(bArea.Warehouse_ID);

                                //หา Location ของ Mc
                                var bLocation = StaticValueManager.GetInstant().GetLocation(this.McObj.Cur_Location_ID.GetValueOrDefault());

                                var desLoc = StaticValueManager.GetInstant().GetLocation(this.rc8_2BuWork.Des_Location_ID.Value);
                                var desArea = StaticValueManager.GetInstant().GetArea(this.rc8_2BuWork.Des_Area_ID.Value);
                                var desWh = StaticValueManager.GetInstant().GetWarehouse(this.rc8_2BuWork.Des_Warehouse_ID.Value);

                                this.rc8_2BaseObject.EventStatus = BaseObjectEventStatus.INBOUND;
                                this.rc8_2BaseObject.McObject_ID = this.McObj.ID;
                                DataADO.GetInstant().UpdateBy<act_BaseObject>(this.rc8_2BaseObject, this.BuVO);
                                writeEventLog("3.1.1 รับคิวงาน");

                                this.rc8_2McWork = new act_McWork()
                                {
                                    ID = null,
                                    IOType = IOType.INBOUND,
                                    QueueType = (int)QueueType.QT_1,
                                    WMS_WorkQueue_ID = this.rc8_2BuWork.ID.Value,
                                    BuWork_ID = this.rc8_2BuWork.ID.Value,
                                    TrxRef = this.rc8_2BuWork.TrxRef,

                                    Priority = this.rc8_2BuWork.Priority,
                                    SeqGroup = this.rc8_2BuWork.SeqGroup,
                                    SeqItem = this.rc8_2BuWork.SeqIndex,

                                    BaseObject_ID = rc8_2BaseObject.ID.Value,
                                    //Rec_McObject_ID = this.ID,
                                    Rec_McObject_ID = null,
                                    Cur_McObject_ID = null,

                                    Cur_Warehouse_ID = bWh.ID.Value,
                                    Cur_Area_ID = this.rc8_2BaseObject.Area_ID,
                                    Cur_Location_ID = this.rc8_2BaseObject.Location_ID,

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
                                this.rc8_2McWork.ID = ADO.WCSDB.DataADO.GetInstant().Insert<act_McWork>(this.rc8_2McWork, this.BuVO);

                                writeEventLog("3.1.2 สร้างคิวงาน McWork");



                                this.rc8_2BuWork.Status = EntityStatus.ACTIVE;
                                this.rc8_2BuWork.WMS_WorkQueue_ID = this.rc8_2McWork.ID;
                                DataADO.GetInstant().UpdateBy<act_BuWork>(this.rc8_2BuWork, this.BuVO);

                                writeEventLog("3.1.3 อัพเดตคิวงาน BuWork");

                                this.StepTxt = "4.1";
                                break;
                            }
                            break;


                    }




                    break;

                case "4":
                    //Check สถานะคิวงาน McWork
                    switch (this.StepTxt)
                    {
                        case "4.1":
                            //------ตรวจสอบมีคิวงานค้างอยู่
                            string aCmd1 = " select * from act_McWork " +
                                           " where QueueType = 1 " +
                                           " and Status in (0, 1) " +
                                            " and QueueStatus in (5,7,14)" +
                                            " and Sou_Location_ID = " + this.McObj.Cur_Location_ID.GetValueOrDefault();

                            this.rc8_2McWork = DataADO.GetInstant().QueryString<act_McWork>(aCmd1, null, this.BuVO).FirstOrDefault();
                            if (this.rc8_2McWork != null)
                            {
                                if (this.rc8_2McWork.QueueStatus == 5 || this.rc8_2McWork.QueueStatus == 14) //---สั่งยก
                                {
                                    this.StepTxt = "5.1";
                                    break;
                                }
                                else if (this.rc8_2McWork.QueueStatus == 7) // --- Reject ของเต็ม
                                {
                                    this.StepTxt = "5.2";
                                    break;
                                }
                                else
                                {
                                    //this.StepTxt = "0.0";
                                    //break;
                                }
                            }
                            break;



                        case "4.2":
                            var mcWork = this.getRC8_2McWork(this.rc8_2BaseObject.ID);
                            if (this.rc8_2BaseObject != null && mcWork == null)
                            {
                                if (this.cmdReject == 0)
                                {
                                    this.PostCommand(McCommandType.CM_14);
                                }
                                else
                                {
                                    McCommandType cmd = (McCommandType)this.cmdReject;
                                    this.PostCommand(cmd);
                                }

                                this.rc8_2BaseObject.Status = EntityStatus.REMOVE;
                                DataADO.GetInstant().UpdateBy<act_BaseObject>(this.rc8_2BaseObject, this.BuVO);

                                writeEventLog("4.2.1 Reject จากข้อมูลรับเข้า " + this.LabelData);
                                this.StepTxt = "0.0";
                                //this.StepTxt = "6.1";
                                break;
                            }
                            break;


                    }
                    break;

                case "5":

                    switch (this.StepTxt)
                    {
                        case "5.1":

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
                                writeEventLog("5.1 สั่งให้ Conveyor เริ่มทำงานเก็บ");

                                if (this.rc8_2McWork != null)
                                {
                                    this.rc8_2McWork.ActualTime = DateTime.Now;
                                    DataADO.GetInstant().UpdateBy<act_McWork>(this.rc8_2McWork, this.BuVO);
                                }

                                this.StepTxt = "0.0";
                                break;



                            }

                            break;

                        case "5.2":
                            if (this.rc8_2McWork != null && this.rc8_2McWork.QueueStatus == 7)
                            {
                                this.PostCommand(McCommandType.CM_13);

                                this.rc8_2McWork.EventStatus = McWorkEventStatus.REMOVE_QUEUE;
                                this.rc8_2McWork.Status = EntityStatus.REMOVE;
                                DataADO.GetInstant().UpdateBy<act_McWork>(this.rc8_2McWork, this.BuVO);

                                if (this.rc8_2BaseObject != null)
                                {
                                    this.rc8_2BaseObject.Status = EntityStatus.REMOVE;
                                    DataADO.GetInstant().UpdateBy<act_BaseObject>(this.rc8_2BaseObject, this.BuVO);
                                }
                                writeEventLog(" 5.2 Reject พื้นที่จัดเก็บเต็ม");
                                this.StepTxt = "0.0";

                                //this.StepTxt = "6.1";
                                break;
                            }
                            break;
                    }
                    break;

                case "6":
                    switch (this.StepTxt)
                    {
                        case "6.1":
                            if (this.McObj.DV_Pre_Status == 1)
                            {
                                this.StepTxt = "0.0";
                            }
                            break;

                        case "6.2":
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

        #region Declare variable
        private act_McWork rc8_2McWork;
        private acs_McMaster srmMcMaster;
        private act_BuWork rc8_2BuWork;
        private act_BaseObject rc8_2BaseObject;
        private int errCode;
        private int cmdReject;
        private int PassFlg;
        private long? BuWork_ID;
        private long? BaseObject_ID;
        private string disCharge;
        private string mainStep;
        private int[] dimentionErr = new int[] { 104, 105, 106, 107, 108, 109 };
        private string LabelData;
        private int[] cvWorked = new int[] { 4, 14 };
        int WarehouseID = InboundUtil.AppWHID; // For Test 1
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


        private act_BaseObject getRC8_2BaseObject()
        {
            var _baseObject = ADO.WCSDB.DataADO.GetInstant()
                        .SelectBy<act_BaseObject>(
                            new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Warehouse_ID", this.Cur_Area.Warehouse_ID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("McObject_ID", this.ID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN)
                            }, BuVO)
                            .OrderBy(x => x.ID)
                            .FirstOrDefault();

            return _baseObject;
        }

        private act_BuWork getRC8_2BuWork(string _LabelData)
        {
            //var _baseObject = this.getRC8_2BaseObject();
            //var _LabelData = _baseObject != null ? _baseObject.LabelData : null;
            var _buWork = DataADO.GetInstant().SelectBy<act_BuWork>(
                               new SQLConditionCriteria[]
                               {
                                    new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN),
                                    new SQLConditionCriteria("Des_Warehouse_ID",  this.Cur_Area.Warehouse_ID, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("IOType",  IOType.INBOUND, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("LabelData", _LabelData, SQLOperatorType.EQUALS)
                               }
                                , this.BuVO).FirstOrDefault();
            return _buWork;

        }

        private act_McWork getRC8_2McWork(long? BaseObject_ID)
        {
            var rc8_2McWork = DataADO.GetInstant().SelectBy<act_McWork>(
                                new SQLConditionCriteria[]
                                {
                                        new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN),
                                        new SQLConditionCriteria("QueueType",  QueueType.QT_1, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("IOType",  IOType.INBOUND, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("BaseObject_ID",  BaseObject_ID, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("EventStatus",  22, SQLOperatorType.NOTEQUALS),
                                        new SQLConditionCriteria("Sou_Location_ID",this.McObj.Cur_Location_ID.GetValueOrDefault(), SQLOperatorType.EQUALS)
                                }
                            , this.BuVO).FirstOrDefault();

            return rc8_2McWork;
        }

        #endregion
    }

}
