using ADO.WCSDB;
using AMSModel.Constant.EnumConst;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
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
    public class McOldRollerConveyorInbound : BaseMcRuntime
    {
        protected override McTypeEnum McType => McTypeEnum.CV;

        public McOldRollerConveyorInbound(acs_McMaster mcMst) : base(mcMst)
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
                    //Check dimention และ สแกนบาร์โค๊ด
                    writeEventLog("0. Check dimention และ สแกนบาร์โค๊ด");
                    switch (this.McObj.DV_Pre_Status)
                    {
                        case 104:
                        case 105:
                        case 106:
                        case 107:
                        case 108:
                        case 109:
                            //Dimention Reje
                            this.errCode = this.McObj.DV_Pre_Status;
                            this.cmdReject = (int)McCommandType.CM_15;
                            this.PassFlg = (int)PassFailFlag.Fail;
                            Reject("0.2.1 Dimention Reject ");
                            break;

                        case 110:
                        case 111:
                            // Eject by Computer
                            this.errCode = this.McObj.DV_Pre_Status;
                            this.cmdReject = (int)McCommandType.CM_15;
                            this.PassFlg = (int)PassFailFlag.Fail;
                            Reject("0.2.2 Eject by Computer ");
                            break;

                        case 137:
                            //Barcode scan Reject
                            this.errCode = this.McObj.DV_Pre_Status;
                            this.cmdReject = (int)McCommandType.CM_15;
                            this.PassFlg = (int)PassFailFlag.Fail;
                            Reject("0.2.3 Eject by Barcode scan ");
                            break;

                        case 98:
                            //อ่าน Barcode ได้
                            if (!string.IsNullOrWhiteSpace(this.McObj.DV_Pre_BarProd))
                            {
                                writeEventLog("Label " + this.McObj.DV_Pre_BarProd);
                                this.StepTxt = "1.1";
                                break;
                            }
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

                                this.rco5_3BuWork = DataADO.GetInstant().SelectBy<act_BuWork>(
                                new SQLConditionCriteria[]
                                {
                                    new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN),
                                    new SQLConditionCriteria("Des_Warehouse_ID",  this.Cur_Area.Warehouse_ID, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("IOType",  IOType.INBOUND, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("LabelData",this.McObj.DV_Pre_BarProd, SQLOperatorType.EQUALS)
                                }
                                , this.BuVO).FirstOrDefault();

                                if (this.rco5_3BuWork == null)
                                {
                                    this.cmdReject = (int)McCommandType.CM_11;
                                    this.PassFlg = (int)PassFailFlag.Fail;

                                    Reject("1.2.1 ไม่พบข้อมูลรับเข้า" + this.McObj.DV_Pre_BarProd);
                                    break;
                                }

                                this.BuWork_ID = this.rco5_3BuWork != null ? this.rco5_3BuWork.ID : 0;
                                this.disCharge = this.rco5_3BuWork == null ? this.rco5_3BuWork.DisCharge : 0;

                                if (this.rco5_3BuWork != null && this.rco5_3BuWork.DisCharge == 0)
                                {
                                    this.cmdReject = (int)McCommandType.CM_15;
                                    this.PassFlg = (int)PassFailFlag.Fail;

                                    Reject("1.2.2 ไม่พบข้อมูล Discharge งานรับเข้า " + this.McObj.DV_Pre_BarProd + " BuWork ID " + this.BuWork_ID);
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
                            if (this.rco5_3BuWork != null)
                            {
                                writeEventLog("2. Check ข้อมูลพาเลท BaseObject");
                                var bo = BaseObjectADO.GetInstant().GetByLabel(this.McObj.DV_Pre_BarProd, this.Cur_Area.Warehouse_ID, this.BuVO);

                                if (bo != null && bo.EventStatus == BaseObjectEventStatus.TEMP)
                                {
                                    this.rco5_3BaseObject = bo;
                                    writeEventLog("2.1.1 ข้อมูลพาเลท BaseObject_ID " + this.rco5_3BaseObject.ID); ;
                                    this.StepTxt = "3.1";
                                    break;
                                }

                                if (bo != null)
                                {
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
                                        this.cmdReject = (int)McCommandType.CM_10;
                                        this.PassFlg = (int)PassFailFlag.Fail;
                                        Reject("2.2.1 ข้อมูลพาเลทซ้ำ " + this.McObj.DV_Pre_BarProd);
                                        break;
                                    }
                                }

                                if (bo == null && (this.WarehouseID != 0 && this.WarehouseID != this.rco5_3BuWork.Des_Warehouse_ID))
                                {
                                    this.cmdReject = (int)McCommandType.CM_15;
                                    this.PassFlg = (int)PassFailFlag.Fail;
                                    Reject("2.2.2 ข้อมูลของคลังอื่น ไม่สร้างข้อมูลพาเลท " + this.McObj.DV_Pre_BarProd);
                                    break;
                                }

                                if (bo == null && (this.WarehouseID == 0 || this.WarehouseID == this.rco5_3BuWork.Des_Warehouse_ID))
                                {
                                    string baseCode;
                                    do
                                    {
                                        baseCode = (DataADO.GetInstant().NextNum("base_no", false, this.BuVO) % (Math.Pow(10, 10))).ToString("0000000000");
                                    } while (DataADO.GetInstant().SelectByCodeActive<act_BaseObject>(baseCode, this.BuVO) != null);

                                    this.rco5_3BaseObject = new act_BaseObject()
                                    {
                                        ID = null,
                                        BuWork_ID = this.rco5_3BuWork == null ? null : this.rco5_3BuWork.ID,
                                        Code = baseCode,
                                        Model = "N/A",
                                        McObject_ID = this.McObj.ID,
                                        Warehouse_ID = this.Cur_Area == null ? 0 : this.Cur_Area.Warehouse_ID,
                                        Area_ID = this.Cur_Location == null ? 0 : this.Cur_Location.Area_ID,
                                        Location_ID = this.McObj != null && this.McObj.Cur_Location_ID != null ? this.McObj.Cur_Location_ID.GetValueOrDefault() : 0,
                                        LabelData = this.McObj.DV_Pre_BarProd,
                                        DisCharge = this.rco5_3BuWork == null ? 0 : this.rco5_3BuWork.DisCharge,
                                        Customer = this.rco5_3BuWork == null ? null : this.rco5_3BuWork.Customer,
                                        SkuCode = this.rco5_3BuWork == null ? null : this.rco5_3BuWork.SkuCode,
                                        SkuGrade = this.rco5_3BuWork == null ? null : this.rco5_3BuWork.SkuGrade,
                                        SkuLot = this.rco5_3BuWork == null ? null : this.rco5_3BuWork.SkuLot,
                                        SkuItemNo = this.rco5_3BuWork == null ? null : this.rco5_3BuWork.ItemNo,
                                        SkuQty = this.rco5_3BuWork == null ? 0 : this.rco5_3BuWork.SkuQty,
                                        SkuUnit = this.rco5_3BuWork == null ? null : this.rco5_3BuWork.SkuUnit,
                                        SkuStatus = this.rco5_3BuWork == null ? null : this.rco5_3BuWork.SkuStatus,
                                        EventStatus = BaseObjectEventStatus.TEMP,
                                        Status = EntityStatus.ACTIVE
                                    };
                                    this.rco5_3BaseObject.ID = DataADO.GetInstant().Insert<act_BaseObject>(this.rco5_3BaseObject, this.BuVO);
                                    writeEventLog("2.1.2 สร้างข้อมูลพาเลท " + this.McObj.DV_Pre_BarProd + " BaseObject_ID " + this.rco5_3BaseObject.ID);
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
                            //สร้างคิวงาน McWork
                            if (!string.IsNullOrWhiteSpace(this.McObj.DV_Pre_BarProd) && this.rco5_3BuWork != null && this.rco5_3BaseObject != null && (this.cmdReject == 0 && this.errCode == 0))
                            {
                                this.PassFlg = (int)PassFailFlag.Pass;
                            }

                            if (this.PassFlg != 1)
                            {
                                
                                writeEventLog("3.2 พบข้อผิดพลาด ให้ Reject");
                                this.StepTxt = "4.2";
                                break;
                            }

                            writeEventLog("3.1 สั่งให้ทำงานต่อ");
                            this.StepTxt = "4.1";
                            break;
                    }
                    
                    


                    break;

                case "4":
                    //เริ่มทำงาน
                    switch (this.StepTxt)
                    {
                        case "4.1":
                            //สั่งเริ่มงาน
                            if (this.McObj.DV_Pre_Status == 98)
                            {
                                var bo = BaseObjectADO.GetInstant().GetByLabel(this.McObj.DV_Pre_BarProd, this.Cur_Area.Warehouse_ID, this.BuVO);
                                if(bo != null)
                                {
                                    this.PostCommand(McCommandType.CM_1, ListKeyValue<string, object>
                                    .New("Set_PalletID", bo.Code)
                                    .Add("Set_Comm", 1));
                                    writeEventLog("4. สั่งเริ่มงาน");
                                    this.StepTxt = "0.0";
                                    break;
                                }
                                
                            }
                            break;

                        case "4.2":
                            //สั่ง Reject
                            if(this.PassFlg != 1)
                            {
                                var mcWork = DataADO.GetInstant().SelectBy<act_McWork>(
                                                    new SQLConditionCriteria[]
                                                    {
                                                            new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN),
                                                            new SQLConditionCriteria("QueueType",  QueueType.QT_1, SQLOperatorType.EQUALS),
                                                            new SQLConditionCriteria("IOType",  IOType.INBOUND, SQLOperatorType.EQUALS),
                                                            new SQLConditionCriteria("Sou_Location_ID",this.McObj.Cur_Location_ID.GetValueOrDefault(), SQLOperatorType.EQUALS)
                                                    }
                                                , this.BuVO).FirstOrDefault();

                                if(mcWork == null)
                                {
                                    if (this.cmdReject != 0)
                                    {
                                        McCommandType cmd = (McCommandType)this.cmdReject;
                                        this.PostCommand(cmd);
                                        this.PostCommand(McCommandType.CM_15);
                                    }
                                    else
                                    {
                                        this.PostCommand(McCommandType.CM_15);
                                    }
                                    writeEventLog("4.2 สั่ง Reject");
                                }
                                this.StepTxt = "0.0";
                                break;
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

        #region Declare variable
        private int dimentionEjectStatus;
        private bool dimentionEjectFlg;
        private float disCharge;
        private int errCode;
        private int cmdReject;
        private string LabelData;
        private act_BuWork rco5_3BuWork;
        private act_BaseObject rco5_3BaseObject;
        private int PassFlg;
        private long? BuWork_ID;
        private long? BaseObject_ID;
        private string BarProd;
        int WarehouseID = 1; // For Test
        string mainStep;
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

        private void Reject(string detail)
        {
            writeEventLog(detail + " : " + this.errCode);
            this.StepTxt = "4.2";
        }
        #endregion

    }
}
