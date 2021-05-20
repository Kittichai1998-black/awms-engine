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
    public class McConveyorManual : BaseMcRuntime
    {
        protected override McTypeEnum McType => McTypeEnum.CV;

        public McConveyorManual(acs_McMaster mcMst) : base(mcMst)
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
                    //Check dimention และ สแกนบาร์โค๊ด
                    writeEventLog("0. Check dimention และ สแกนบาร์โค๊ด");
                    if (this.McObj.DV_Pre_Status == 98)
                    {

                        this.rc8_2BaseObject = this.getRC8_2BaseObject();

                        if (this.rc8_2BaseObject != null && !String.IsNullOrWhiteSpace(this.rc8_2BaseObject.LabelData))
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
                        //Reject("0.2 Dimention Reject ");
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
                            if (this.McObj.DV_Pre_Status == 98)
                            {
                                writeEventLog("1. ตรวจสอบงานรับเข้า BuWork");
                                this.rc8_2BuWork = this.getRC8_2BuWork();

                                if (this.rc8_2BuWork == null)
                                {
                                    this.cmdReject = (int)McCommandType.CM_11;
                                    this.PassFlg = (int)PassFailFlag.Fail;

                                    //Reject("1.2 ไม่พบข้อมูลรับเข้า" + this.LabelData);
                                    writeEventLog("1.2 ไม่พบข้อมูลรับเข้า" + this.LabelData);
                                    this.StepTxt = "4.2";
                                    break;
                                }


                                this.disCharge = this.rc8_2BuWork.DisCharge;
                                this.BuWork_ID = this.rc8_2BuWork == null ? 0 : this.rc8_2BuWork.ID;

                                if (this.rc8_2BuWork != null && this.rc8_2BuWork.DisCharge == 0)
                                {
                                    this.cmdReject = (int)McCommandType.CM_15;
                                    this.PassFlg = (int)PassFailFlag.Fail;

                                    //Reject("1.3 ไม่พบข้อมูล Discharge งานรับเข้า " + this.LabelData + " BuWork ID " + this.BuWork_ID);
                                    writeEventLog("1.3 ไม่พบข้อมูล Discharge งานรับเข้า " + this.LabelData + " BuWork ID " + this.BuWork_ID);
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
                            //สร้างข้อมูลพาเลท BaseObject
                            if (this.rc8_2BuWork != null)
                            {
                                writeEventLog("2. Check ข้อมูลพาเลท BaseObject");
                                var bo = BaseObjectADO.GetInstant().GetByLabel(this.rc8_2BuWork.LabelData, this.Cur_Area.Warehouse_ID, this.BuVO);

                                if (bo != null && bo.EventStatus == BaseObjectEventStatus.TEMP)
                                {
                                    this.rc8_2BaseObject = bo;
                                    writeEventLog("2.1.1 ข้อมูลพาเลท BaseObject_ID " + this.rc8_2BaseObject.ID); ;
                                    this.StepTxt = "3.1";
                                    break;
                                }

                                if (bo != null)
                                {
                                    //this.rc8_2McWork = DataADO.GetInstant().SelectBy<act_McWork>(
                                    //                new SQLConditionCriteria[]
                                    //                {
                                    //                        new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN),
                                    //                        new SQLConditionCriteria("QueueType",  QueueType.QT_1, SQLOperatorType.EQUALS),
                                    //                        new SQLConditionCriteria("IOType",  IOType.INBOUND, SQLOperatorType.EQUALS),
                                    //                        new SQLConditionCriteria("BaseObject_ID",  this.rc8_2BaseObject.ID, SQLOperatorType.EQUALS),
                                    //                        new SQLConditionCriteria("EventStatus",  22, SQLOperatorType.NOTEQUALS),
                                    //                        new SQLConditionCriteria("Sou_Location_ID",this.McObj.Cur_Location_ID.GetValueOrDefault(), SQLOperatorType.EQUALS)
                                    //                }
                                    //            , this.BuVO).FirstOrDefault();

                                    this.rc8_2McWork = this.getRC8_2McWork(this.rc8_2BaseObject.ID);

                                    if (this.rc8_2McWork == null)
                                    {
                                        this.cmdReject = (int)McCommandType.CM_10;
                                        this.PassFlg = (int)PassFailFlag.Fail;
                                        //Reject("2.2.1 ข้อมูลพาเลทซ้ำ " + this.rc8_2BuWork.LabelData);
                                        writeEventLog("2.2.1 ข้อมูลพาเลทซ้ำ " + this.rc8_2BuWork.LabelData);
                                        this.StepTxt = "4.2";
                                        break;
                                    }
                                    else
                                    {
                                        writeEventLog("2.1.2 ข้อมูลพาเลท McWork " + this.rc8_2McWork.ID); ;
                                        this.StepTxt = "3.1";
                                        break;
                                    }
                                }

                                if (bo == null && (this.WarehouseID != 0 && this.WarehouseID != this.rc8_2BuWork.Des_Warehouse_ID))
                                {
                                    this.cmdReject = (int)McCommandType.CM_15;
                                    this.PassFlg = (int)PassFailFlag.Fail;
                                    //Reject("2.2.2 ข้อมูลของคลังอื่น ไม่สร้างข้อมูลพาเลท " + this.rc8_2BuWork.LabelData);
                                    writeEventLog("2.2.1 ข้อมูลพาเลทซ้ำ " + this.rc8_2BuWork.LabelData);
                                    this.StepTxt = "4.2";
                                    break;
                                }

                                if (bo == null && (this.WarehouseID == 0 || this.WarehouseID == this.rc8_2BuWork.Des_Warehouse_ID))
                                {
                                    string baseCode;
                                    do
                                    {
                                        baseCode = (DataADO.GetInstant().NextNum("base_no", false, this.BuVO) % (Math.Pow(10, 10))).ToString("0000000000");
                                    } while (DataADO.GetInstant().SelectByCodeActive<act_BaseObject>(baseCode, this.BuVO) != null);

                                    this.rc8_2BaseObject = new act_BaseObject()
                                    {
                                        ID = null,
                                        BuWork_ID = this.rc8_2BuWork == null ? null : this.rc8_2BuWork.ID,
                                        Code = baseCode,
                                        Model = "N/A",
                                        McObject_ID = this.McObj.ID,
                                        Warehouse_ID = this.Cur_Area == null ? 0 : this.Cur_Area.Warehouse_ID,
                                        Area_ID = this.Cur_Location == null ? 0 : this.Cur_Location.Area_ID,
                                        Location_ID = this.McObj != null && this.McObj.Cur_Location_ID != null ? this.McObj.Cur_Location_ID.GetValueOrDefault() : 0,
                                        LabelData = this.LabelData,
                                        DisCharge = this.rc8_2BuWork == null ? 0 : this.rc8_2BuWork.DisCharge,
                                        Customer = this.rc8_2BuWork == null ? null : this.rc8_2BuWork.Customer,
                                        SkuCode = this.rc8_2BuWork == null ? null : this.rc8_2BuWork.SkuCode,
                                        SkuGrade = this.rc8_2BuWork == null ? null : this.rc8_2BuWork.SkuGrade,
                                        SkuLot = this.rc8_2BuWork == null ? null : this.rc8_2BuWork.SkuLot,
                                        SkuItemNo = this.rc8_2BuWork == null ? null : this.rc8_2BuWork.ItemNo,
                                        SkuQty = this.rc8_2BuWork == null ? 0 : this.rc8_2BuWork.SkuQty,
                                        SkuUnit = this.rc8_2BuWork == null ? null : this.rc8_2BuWork.SkuUnit,
                                        SkuStatus = this.rc8_2BuWork == null ? null : this.rc8_2BuWork.SkuStatus,
                                        EventStatus = BaseObjectEventStatus.TEMP,
                                        Status = EntityStatus.ACTIVE
                                    };
                                    this.rc8_2BaseObject.ID = DataADO.GetInstant().Insert<act_BaseObject>(this.rc8_2BaseObject, this.BuVO);
                                    writeEventLog("2.1.3 สร้างข้อมูลพาเลท " + this.rc8_2BuWork.LabelData + " BaseObject_ID " + this.rc8_2BaseObject.ID);
                                    this.StepTxt = "3.1";
                                    break;
                                }



                            }

                            break;
                    }



                    break;

                case "3":
                    switch (this.StepTxt)
                    {
                        case "3.1":
                            if (this.rc8_2BuWork != null && this.rc8_2BaseObject != null)
                            {
                                this.rc8_2BaseObject.DisCharge = this.rc8_2BuWork == null ? 0 : this.rc8_2BuWork.DisCharge;
                                this.rc8_2BaseObject.Customer = this.rc8_2BuWork == null ? null : this.rc8_2BuWork.Customer;
                                this.rc8_2BaseObject.SkuCode = this.rc8_2BuWork == null ? null : this.rc8_2BuWork.SkuCode;
                                this.rc8_2BaseObject.SkuGrade = this.rc8_2BuWork == null ? null : this.rc8_2BuWork.SkuGrade;
                                this.rc8_2BaseObject.SkuLot = this.rc8_2BuWork == null ? null : this.rc8_2BuWork.SkuLot;
                                this.rc8_2BaseObject.SkuItemNo = this.rc8_2BuWork == null ? null : this.rc8_2BuWork.ItemNo;
                                this.rc8_2BaseObject.SkuQty = this.rc8_2BuWork == null ? 0 : this.rc8_2BuWork.SkuQty;
                                this.rc8_2BaseObject.SkuUnit = this.rc8_2BuWork == null ? null : this.rc8_2BuWork.SkuUnit;
                                this.rc8_2BaseObject.SkuStatus = this.rc8_2BuWork == null ? null : this.rc8_2BuWork.SkuStatus;

                                DataADO.GetInstant().UpdateBy<act_BaseObject>(this.rc8_2BaseObject, this.BuVO);
                                writeEventLog("3.1.1 Update ข้อมูลพาเลท จาก BuWork");
                            }

                            if (this.rc8_2BuWork != null && !string.IsNullOrWhiteSpace(this.rc8_2BuWork.LabelData) && this.rc8_2BaseObject != null && (this.cmdReject == 0 && this.errCode == 0))
                            {


                                this.PassFlg = (int)PassFailFlag.Pass;
                            }

                            if (this.PassFlg != 1)
                            {

                                writeEventLog("3.2 พบข้อผิดพลาด ให้ Reject");
                                this.StepTxt = "4.2";
                                break;
                            }

                            writeEventLog("3.1.2 สั่งให้ทำงานต่อ");
                            this.StepTxt = "4.1";

                            break;
                    }




                    break;

                case "4":
                    //สร้างคิวงาน McWork
                    switch (this.StepTxt)
                    {
                        case "4.1":
                            //Check คิวงาน McWork ยังไม่ถูกยกเลิก
                            //this.rc8_2McWork = DataADO.GetInstant().SelectBy<act_McWork>(
                            //                        new SQLConditionCriteria[]
                            //                        {
                            //                                new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN),
                            //                                new SQLConditionCriteria("IOType",  IOType.INBOUND, SQLOperatorType.EQUALS),
                            //                                new SQLConditionCriteria("QueueType",  QueueType.QT_1, SQLOperatorType.EQUALS),
                            //                                new SQLConditionCriteria("BaseObject_ID",  this.rc8_2BaseObject.ID, SQLOperatorType.EQUALS),
                            //                                new SQLConditionCriteria("EventStatus",  22, SQLOperatorType.NOTEQUALS),
                            //                                new SQLConditionCriteria("Sou_Location_ID",this.McObj.Cur_Location_ID.GetValueOrDefault(), SQLOperatorType.EQUALS)
                            //                        }
                            //                    , this.BuVO).FirstOrDefault();

                            this.rc8_2McWork = this.getRC8_2McWork(this.rc8_2BaseObject.ID);

                            //สร้างคิวงาน McWork
                            if (this.rc8_2BuWork == null || this.rc8_2BaseObject == null)
                            {
                                this.StepTxt = "0.0";
                                break;
                            }

                            if (this.rc8_2BuWork != null && this.rc8_2BaseObject != null && this.rc8_2McWork != null)
                            {
                                this.StepTxt = "5.1";
                                break;
                            }

                            if (this.rc8_2BuWork != null && this.rc8_2BaseObject != null && this.rc8_2McWork == null)
                            {
                                writeEventLog("4. Check คิวงาน McWork");

                                var bArea = StaticValueManager.GetInstant().GetArea(this.rc8_2BaseObject.Area_ID);
                                if (bArea == null)
                                {
                                    writeEventLog("4.2.1 ไม่พบข้อมูล Area " + this.rc8_2BaseObject.Area_ID);
                                    this.StepTxt = "0.0";
                                    break;

                                }

                                var bWh = StaticValueManager.GetInstant().GetWarehouse(bArea.Warehouse_ID);
                                if (bWh == null)
                                {
                                    writeEventLog("4.2.2 ไม่พบข้อมูล Warehouse " + bArea.Warehouse_ID);
                                    this.StepTxt = "0.0";
                                    break;

                                }

                                //หา Location ของ Mc
                                var bLocation = StaticValueManager.GetInstant().GetLocation(this.McObj.Cur_Location_ID.GetValueOrDefault());
                                if (bLocation == null)
                                {
                                    writeEventLog("4.2.3 ไม่พบข้อมูล Sou_Location_ID " + this.McObj.Cur_Location_ID);
                                    this.StepTxt = "0.0";
                                    break;

                                }

                                var desLoc = StaticValueManager.GetInstant().GetLocation(this.rc8_2BuWork.Des_Location_ID.Value);
                                if (desLoc == null)
                                {
                                    writeEventLog("4.2.4 ไม่พบข้อมูล Des_Location " + this.rc8_2BuWork.Des_Location_ID);
                                    this.StepTxt = "0.0";
                                    break;

                                }

                                var desArea = StaticValueManager.GetInstant().GetArea(this.rc8_2BuWork.Des_Area_ID.Value);
                                if (desArea == null)
                                {
                                    writeEventLog("4.2.5 ไม่พบข้อมูล Des_Area " + this.rc8_2BuWork.Des_Area_ID);
                                    this.StepTxt = "0.0";
                                    break;

                                }

                                var desWh = StaticValueManager.GetInstant().GetWarehouse(this.rc8_2BuWork.Des_Warehouse_ID.Value);
                                if (desWh == null)
                                {
                                    writeEventLog("4.2.6 ไม่พบข้อมูล Des_Warehouse " + this.rc8_2BuWork.Des_Warehouse_ID);
                                    this.StepTxt = "0.0";
                                    break;

                                }

                                this.rc8_2BaseObject.EventStatus = BaseObjectEventStatus.INBOUND;
                                this.rc8_2BaseObject.McObject_ID = this.McObj.ID;
                                DataADO.GetInstant().UpdateBy<act_BaseObject>(this.rc8_2BaseObject, this.BuVO);
                                writeEventLog("4.1.1 รับคิวงาน");

                                var _mcWork = DataADO.GetInstant().SelectBy<act_McWork>(
                                new SQLConditionCriteria[]
                                {
                                        new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN),
                                        new SQLConditionCriteria("QueueType",  QueueType.QT_1, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("EventStatus",  22, SQLOperatorType.NOTEQUALS),
                                        new SQLConditionCriteria("EventStatus",  32, SQLOperatorType.NOTEQUALS),
                                        new SQLConditionCriteria("Sou_Location_ID",this.McObj.Cur_Location_ID.GetValueOrDefault(), SQLOperatorType.EQUALS)
                                }
                            , this.BuVO).FirstOrDefault(x => x.QueueStatus <= 6);

                                if (_mcWork == null)
                                {
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

                                    writeEventLog("4.1.2 สร้างคิวงาน McWork");
                                }



                                this.rc8_2BuWork.Status = EntityStatus.ACTIVE;
                                this.rc8_2BuWork.WMS_WorkQueue_ID = this.rc8_2McWork.ID;
                                DataADO.GetInstant().UpdateBy<act_BuWork>(this.rc8_2BuWork, this.BuVO);

                                writeEventLog("4.1.3 อัพเดตคิวงาน BuWork");

                                this.StepTxt = "5.1";
                                break;

                            }

                            break;

                        case "4.2":
                            //สั่ง Reject
                            //var mcWork = DataADO.GetInstant().SelectBy<act_McWork>(
                            //                        new SQLConditionCriteria[]
                            //                        {
                            //                                new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN),
                            //                                new SQLConditionCriteria("QueueType",  QueueType.QT_1, SQLOperatorType.EQUALS),
                            //                                new SQLConditionCriteria("IOType",  IOType.INBOUND, SQLOperatorType.EQUALS),
                            //                                new SQLConditionCriteria("Sou_Location_ID",this.McObj.Cur_Location_ID.GetValueOrDefault(), SQLOperatorType.EQUALS)
                            //                        }
                            //                    , this.BuVO).FirstOrDefault();
                            if (this.rc8_2BaseObject == null)
                            {
                                this.rc8_2BaseObject = this.getRC8_2BaseObject();
                                if (this.rc8_2BaseObject == null)
                                {
                                    this.StepTxt = "0.0";
                                    break;
                                }
                            }

                            var mcWork = this.getRC8_2McWork(this.rc8_2BaseObject.ID);

                            if (mcWork == null)
                            {
                                //สั่ง Reject
                                this.PostCommand(McCommandType.CM_14);

                                if (this.rc8_2BaseObject != null)
                                {
                                    this.rc8_2BaseObject.Status = EntityStatus.REMOVE;
                                    DataADO.GetInstant().UpdateBy<act_BaseObject>(this.rc8_2BaseObject, this.BuVO);
                                }


                                mcWork.EventStatus = McWorkEventStatus.REMOVE_QUEUE;
                                mcWork.Status = EntityStatus.REMOVE;
                                DataADO.GetInstant().UpdateBy<act_McWork>(mcWork, this.BuVO);

                                writeEventLog("4.2 สั่ง Reject");
                            }
                            this.StepTxt = "0.0";
                            break;
                    }

                    if (this.McObj.DV_Pre_Status == 98)
                    {
                        writeEventLog("4. สั่งเริ่มงาน");
                    }

                    break;

                case "5":
                    //Check ความพร้อมคิวงาน
                    switch (this.StepTxt)
                    {
                        case "5.1":
                            //Check ความพร้อมคิวงาน
                            if (this.McObj.DV_Pre_Status == 98)
                            {
                                //this.rc8_2McWork = DataADO.GetInstant().SelectBy<act_McWork>(
                                //                    new SQLConditionCriteria[]
                                //                    {
                                //                            new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN),
                                //                            new SQLConditionCriteria("QueueType",  QueueType.QT_1, SQLOperatorType.EQUALS),
                                //                            new SQLConditionCriteria("IOType",  IOType.INBOUND, SQLOperatorType.EQUALS),
                                //                            new SQLConditionCriteria("BaseObject_ID",  this.rc8_2BaseObject.ID, SQLOperatorType.EQUALS),
                                //                            new SQLConditionCriteria("EventStatus",  22, SQLOperatorType.NOTEQUALS),
                                //                            new SQLConditionCriteria("Sou_Location_ID",this.McObj.Cur_Location_ID.GetValueOrDefault(), SQLOperatorType.EQUALS)
                                //                    }
                                //                , this.BuVO).FirstOrDefault();

                                if (this.rc8_2BaseObject == null)
                                {
                                    this.rc8_2BaseObject = this.getRC8_2BaseObject();
                                    if (this.rc8_2BaseObject == null)
                                    {
                                        this.StepTxt = "0.0";
                                        break;
                                    }
                                }

                                this.rc8_2McWork = this.getRC8_2McWork(this.rc8_2BaseObject.ID);

                                if (this.rc8_2McWork != null && this.rc8_2McWork.Des_Location_ID != null && this.rc8_2McWork.Des_Location_ID != 0
                                    && this.rc8_2McWork.Rec_McObject_ID != null && this.rc8_2McWork.Rec_McObject_ID != 0)
                                {
                                    writeEventLog("5.1 Check ความพร้อมคิวงาน ปลายทาง " + this.rc8_2McWork.Des_Location_ID + " Shuttle ID " + this.rc8_2McWork.Rec_McObject_ID);
                                    if (this.rc8_2McWork.QueueStatus >= 5)
                                    {
                                        if (this.rc8_2McWork.QueueStatus != 7)
                                        {
                                            writeEventLog(" คิวงาน พร้อมเก็บ");

                                            this.StepTxt = "6.1";
                                            break;
                                        }
                                        else
                                        {
                                            //พื้นที่จัดเก็บเต็ม
                                            writeEventLog("คิวงาน ไม่พร้อมเก็บ พื้นที่จัดเก็บเต็ม");

                                            this.StepTxt = "6.2";
                                            break;
                                        }
                                    }




                                }
                            }
                            break;

                        case "5.2":
                            //สั่ง Reject
                            break;
                    }

                    break;

                case "6":
                    switch (this.StepTxt)
                    {
                        case "6.1":
                            if (this.McObj.DV_Pre_Status == 98)
                            {
                                //this.rc8_2McWork = DataADO.GetInstant().SelectBy<act_McWork>(
                                //                    new SQLConditionCriteria[]
                                //                    {
                                //                            new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN),
                                //                            new SQLConditionCriteria("QueueType",  QueueType.QT_1, SQLOperatorType.EQUALS),
                                //                            new SQLConditionCriteria("IOType",  IOType.INBOUND, SQLOperatorType.EQUALS),
                                //                            new SQLConditionCriteria("BaseObject_ID",  this.rc8_2BaseObject.ID, SQLOperatorType.EQUALS),
                                //                            new SQLConditionCriteria("EventStatus",  22, SQLOperatorType.NOTEQUALS),
                                //                            new SQLConditionCriteria("Sou_Location_ID",this.McObj.Cur_Location_ID.GetValueOrDefault(), SQLOperatorType.EQUALS)
                                //                    }
                                //                , this.BuVO).FirstOrDefault();

                                if (this.rc8_2BaseObject == null)
                                {
                                    this.rc8_2BaseObject = this.getRC8_2BaseObject();
                                    if (this.rc8_2BaseObject == null)
                                    {
                                        this.StepTxt = "0.0";
                                        break;
                                    }
                                }

                                this.rc8_2McWork = this.getRC8_2McWork(this.rc8_2BaseObject.ID);

                                if (this.rc8_2McWork != null)
                                {
                                    this.rc8_2McWork.EventStatus = McWorkEventStatus.ACTIVE_WORKING;
                                    this.rc8_2McWork.ActualTime = DateTime.Now;
                                    DataADO.GetInstant().UpdateBy<act_McWork>(this.rc8_2McWork, this.BuVO);
                                    writeEventLog("6.1.1 เริ่มงาน");
                                }


                                if (this.rc8_2BaseObject != null)
                                {
                                    writeEventLog("6.1.2 BaseObject");
                                    var boCode = this.rc8_2BaseObject.Code;
                                    var boQty = this.rc8_2BaseObject.SkuQty;

                                    writeEventLog("6.1.2 BaseObject code " + boCode + " qty " + boQty + " cmd " + McCommandType.CM_1);

                                    if (boQty == 0)
                                    {
                                        boQty = 1500;
                                    }
                                    //สั่งให้ Conveyor เริ่มทำงานเก็บ
                                    writeEventLog("6.1.3 เริ่มงาน Conveyor");
                                    this.PostCommand(McCommandType.CM_1, 0, 0, 1, "A000000020", 1500, () => writeEventLog("6.1.3 สั่งให้ Conveyor เริ่มทำงานเก็บ"));

                                    this.StepTxt = "7.1";
                                    break;


                                }
                                this.StepTxt = "0.0";
                                break;



                            }

                            break;

                        case "6.2":
                            //Reject จากคิวงาน
                            //this.rc8_2McWork = DataADO.GetInstant().SelectBy<act_McWork>(
                            //                        new SQLConditionCriteria[]
                            //                        {
                            //                                new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN),
                            //                                new SQLConditionCriteria("QueueType",  QueueType.QT_1, SQLOperatorType.EQUALS),
                            //                                new SQLConditionCriteria("IOType",  IOType.INBOUND, SQLOperatorType.EQUALS),
                            //                                new SQLConditionCriteria("BaseObject_ID",  this.rc8_2BaseObject.ID, SQLOperatorType.EQUALS),
                            //                                new SQLConditionCriteria("EventStatus",  22, SQLOperatorType.NOTEQUALS),
                            //                                new SQLConditionCriteria("Sou_Location_ID",this.McObj.Cur_Location_ID.GetValueOrDefault(), SQLOperatorType.EQUALS)
                            //                        }
                            //                    , this.BuVO).FirstOrDefault();

                            if (this.rc8_2BaseObject == null)
                            {
                                this.rc8_2BaseObject = this.getRC8_2BaseObject();
                                if (this.rc8_2BaseObject == null)
                                {
                                    this.StepTxt = "0.0";
                                    break;
                                }
                            }

                            this.rc8_2McWork = this.getRC8_2McWork(this.rc8_2BaseObject.ID);


                            if (this.rc8_2McWork != null && this.rc8_2McWork.QueueStatus == 7)
                            {
                                this.PostCommand(McCommandType.CM_13);
                                writeEventLog("6.2.1 สั่ง Reject");

                                //Reject พื้นที่จัดเก็บเต็ม
                                if (this.rc8_2BaseObject != null)
                                {
                                    this.rc8_2BaseObject.Status = EntityStatus.REMOVE;
                                    DataADO.GetInstant().UpdateBy<act_BaseObject>(this.rc8_2BaseObject, this.BuVO);
                                    writeEventLog("6.2.2 Remove คิวงาน BaseObject");
                                }


                                this.rc8_2McWork.EventStatus = McWorkEventStatus.REMOVE_QUEUE;
                                this.rc8_2McWork.Status = EntityStatus.REMOVE;
                                DataADO.GetInstant().UpdateBy<act_McWork>(this.rc8_2McWork, this.BuVO);
                                writeEventLog("6.2.3 Remove คิวงาน McWork");

                                this.StepTxt = "0.0";
                                break;

                            }
                            break;
                    }

                    break;

                case "7":
                    //จบงาน
                    switch (this.StepTxt)
                    {
                        case "7.1":
                            if (this.McObj.DV_Pre_Status == 4 || this.McObj.DV_Pre_Status == 14)
                            {
                                //this.rc8_2McWork = DataADO.GetInstant().SelectBy<act_McWork>(
                                //                    new SQLConditionCriteria[]
                                //                    {
                                //                            new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN),
                                //                            new SQLConditionCriteria("QueueType",  QueueType.QT_1, SQLOperatorType.EQUALS),
                                //                            new SQLConditionCriteria("IOType",  IOType.INBOUND, SQLOperatorType.EQUALS),
                                //                            new SQLConditionCriteria("BaseObject_ID",  this.rc8_2BaseObject.ID, SQLOperatorType.EQUALS),
                                //                            new SQLConditionCriteria("EventStatus",  22, SQLOperatorType.NOTEQUALS),
                                //                            new SQLConditionCriteria("Sou_Location_ID",this.McObj.Cur_Location_ID.GetValueOrDefault(), SQLOperatorType.EQUALS)
                                //                    }
                                //                , this.BuVO).FirstOrDefault();

                                if (this.rc8_2BaseObject == null)
                                {
                                    this.rc8_2BaseObject = this.getRC8_2BaseObject();
                                    if (this.rc8_2BaseObject == null)
                                    {
                                        this.StepTxt = "0.0";
                                        break;
                                    }
                                }

                                this.rc8_2McWork = this.getRC8_2McWork(this.rc8_2BaseObject.ID);


                                if (this.rc8_2McWork != null && this.rc8_2McWork != null && this.rc8_2McWork.EventStatus == McWorkEventStatus.ACTIVE_WORKING)
                                {
                                    this.rc8_2McWork.EventStatus = McWorkEventStatus.ACTIVE_WORKED;
                                    this.rc8_2McWork.ActualTime = DateTime.Now;
                                    DataADO.GetInstant().UpdateBy<act_McWork>(this.rc8_2McWork, this.BuVO);
                                    writeEventLog("7.1.1 จบคิวงาน Conveyor");

                                    if (this.rc8_2BaseObject != null)
                                    {
                                        this.rc8_2BaseObject.Location_ID = this.McObj.Cur_Location_ID.GetValueOrDefault();
                                        DataADO.GetInstant().UpdateBy(this.rc8_2BaseObject, this.BuVO);
                                        writeEventLog("7.1.2 อัพเดต Location พาเลทสินค้า");
                                    }




                                    this.StepTxt = "0.0";
                                    break;
                                }
                            }
                            break;

                        case "7.2":
                            //สั่ง Reject
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
        private float? disCharge;
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

        //private void Reject(string detail)
        //{
        //    writeEventLog(detail + " : " + this.errCode);
        //    this.StepTxt = "4.2";
        //}

        private act_BaseObject getRC8_2BaseObject()
        {
            var _baseObject = ADO.WCSDB.DataADO.GetInstant()
                        .SelectBy<act_BaseObject>(
                            new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Warehouse_ID", this.Cur_Area.Warehouse_ID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("McObject_ID", this.ID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("EventStatus", BaseObjectEventStatus.IDLE, SQLOperatorType.NOTEQUALS),
                        new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN)
                            }, BuVO)
                            .OrderBy(x => x.ID)
                            .FirstOrDefault();

            return _baseObject;
        }

        private act_BuWork getRC8_2BuWork()
        {
            var _baseObject = this.getRC8_2BaseObject();
            var _LabelData = _baseObject != null ? _baseObject.LabelData : null;
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
