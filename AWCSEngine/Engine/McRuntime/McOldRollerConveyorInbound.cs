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
        private int dimentionEjectStatus { get; set; }
        private bool dimentionEjectFlg { get; set; }
        private float disCharge { get; set; }
        private int errCode { get; set; }
        private int cmdReject { get; set; }
        private string labelData { get; set; }
        private act_BuWork buWork { get; set; }
        private act_BaseObject baseObj { get; set; }
        private int PassFlg { get; set; }
        private long? BuWork_ID { get; set; }
        private long? BaseObject_ID { get; set; }
        private string McNextStep { get; set; }
        private string BarProd { get; set; }
        string WarehouseID = PropertyFileManager.GetInstant().Get(PropertyConst.APP_KEY_warehouse_id)[PropertyConst.APP_KEY_warehouse_id];
        #endregion

        #region Methods
        private void Mc_OnRun()
        {
            switch (this.McNextStep)
            {
                case "0":
                    //Check pallet qr and dimention
                    step0();
                    break;
                case "1":
                    //สร้าง base Object
                    step1();
                    break;

                case "2":
                    //Update ข้อมูลพาเลทสินค้า
                    step2();
                    break;

                case "3":
                    //เช็ค base Object
                    step3();
                    break;

                case "3.1":
                    //สั่งทำงานต่อ
                    step3_1();
                    break;

                case "3.2":
                    //Reject
                    step3_2();
                    break;

                default:
                    //กำหนดให้ Step ถัดไป = Step ปัจจุบัน
                    this.McNextStep = this.StepTxt;
                    break;
            }

        }

        private void reset()
        {
            this.StepTxt = "0";
            this.McNextStep = "0";
        }


        /// <summary>
        /// Check dimention , barcode pallet , reject
        /// </summary>
        private void step0()
        {
            
                switch (this.McObj.DV_Pre_Status)
                {
                    case 104:
                    case 105:
                    case 106:
                    case 107:
                    case 108:
                    case 109:
                        //Dimention Reject
                        this.dimentionEjectStatus = this.McObj.DV_Pre_Status;
                        this.dimentionEjectFlg = true;
                        this.errCode = this.McObj.DV_Pre_Status;
                        this.cmdReject = (int)McCommandType.CM_15;
                        this.PassFlg = (int)PassFailFlag.Fail;
                        break;

                    case 110:
                    case 111:
                        // Eject by Computer
                        this.errCode = this.McObj.DV_Pre_Status;
                        this.cmdReject = (int)McCommandType.CM_15;
                        this.PassFlg = (int)PassFailFlag.Fail;
                        break;

                    case 137:
                        //Barcode scan Reject
                        this.errCode = this.McObj.DV_Pre_Status;
                        this.cmdReject = (int)McCommandType.CM_15;
                        this.PassFlg = (int)PassFailFlag.Fail;
                        break;

                    case 96:
                        this.PostCommand(McCommandType.CM_3);
                        break;

                    case 98:
                        //อ่าน Barcode ได้
                        if (!string.IsNullOrWhiteSpace(this.McObj.DV_Pre_BarProd))
                        {
                            //ตรวจสอบข้อมูลรับเข้า

                            //this.buWork = InboundUtil.GetBuWorkByLabel(this.McObj, this.Cur_Area, this.BuVO);
                            this.buWork  =
                            DataADO.GetInstant().SelectBy<act_BuWork>(
                                new SQLConditionCriteria[]
                                {
                                    new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN),
                                    new SQLConditionCriteria("Des_Warehouse_ID",  this.Cur_Area.Warehouse_ID, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("IOType",  IOType.INBOUND, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("LabelData",this.McObj.DV_Pre_BarProd, SQLOperatorType.EQUALS)
                                }
                            , this.BuVO).FirstOrDefault();

                            DisplayController.Events_Write("Label " + (this.buWork != null ?this.buWork.LabelData : this.McObj.DV_Pre_BarProd));

                            if (this.buWork == null)
                            {
                                this.cmdReject = (int)McCommandType.CM_11;
                                this.PassFlg = (int)PassFailFlag.Fail;
                            }
                            else
                            {
                                //ตรวจสอบข้อมูลพาเลทซ้ำ
                                var bo = BaseObjectADO.GetInstant().GetByLabel(this.McObj.DV_Pre_BarProd, this.Cur_Area.Warehouse_ID, this.BuVO);
                                if (bo != null)
                                {
                                    if (bo.EventStatus == BaseObjectEventStatus.TEMP)
                                    {
                                        this.baseObj = bo;
                                    }
                                    else
                                    {
                                        this.cmdReject = (int)McCommandType.CM_10;
                                        this.PassFlg = (int)PassFailFlag.Fail;
                                    }
                                }

                                this.disCharge = this.buWork == null ? this.buWork.DisCharge : 0;
                                this.BuWork_ID = this.buWork == null ? 0 : this.buWork.ID;
                            }


                        }
                        break;

                    case 99:
                        this.PostCommand(McCommandType.CM_99);
                        break;
                }

                //ตรวจสอบ Discharge
                if (this.disCharge == 0)
                {
                    this.cmdReject = (int)McCommandType.CM_15;
                    this.PassFlg = (int)PassFailFlag.Fail;
                }


                if (!string.IsNullOrWhiteSpace(this.McObj.DV_Pre_BarProd) && this.buWork != null && (this.cmdReject == 0 && this.errCode == 0))
                {
                    this.PassFlg = (int)PassFailFlag.Pass;
                }


            //writeEventLog(baseObj, buWork, "Check Pallet Barcode and dimention");
            this.StepTxt = "0";
            if (this.McObj.DV_Pre_Status == 98)
            {
                if ((!string.IsNullOrWhiteSpace(this.McObj.DV_Pre_BarProd)) && this.buWork != null && WarehouseID == this.buWork.Des_Warehouse_ID.ToString())
                {
                    this.McNextStep = "1";
                }
                else
                {

                    this.McNextStep = "3";
                }

            }




        }

        /// <summary>
        /// สร้าง base Object
        /// </summary>
        private void step1()
        {
            this.StepTxt = "1";
            
                //ถ้าสแกนครั้งแรก สร้างข้อมูลรับเข้าพาเลทสินค้า
                if (this.baseObj == null)
                {
                    //this.baseObj = InboundUtil.createBaseObject(this.McObj, this.buWork, this.Cur_Area, this.Cur_Location, this.BuVO);

                    string baseCode;
                    do
                    {
                        baseCode = (DataADO.GetInstant().NextNum("base_no", false, this.BuVO) % (Math.Pow(10, 10))).ToString("0000000000");
                    } while (DataADO.GetInstant().SelectByCodeActive<act_BaseObject>(baseCode, this.BuVO) != null);

                    this.baseObj = new act_BaseObject()
                    {
                        ID = null,
                        BuWork_ID = this.buWork == null ? null : this.buWork.ID,
                        Code = baseCode,
                        Model = "N/A",
                        McObject_ID = this.McObj.ID,
                        Warehouse_ID = this.Cur_Area == null ? 0 : this.Cur_Area.Warehouse_ID,
                        Area_ID = this.Cur_Location == null ? 0 : this.Cur_Location.Area_ID,
                        Location_ID = this.McObj != null && this.McObj.Cur_Location_ID != null ? this.McObj.Cur_Location_ID.GetValueOrDefault() : 0,
                        LabelData = this.McObj.DV_Pre_BarProd,
                        DisCharge = this.buWork == null ? 0 : this.buWork.DisCharge,
                        Customer = this.buWork == null ? null : this.buWork.Customer,
                        SkuCode = this.buWork == null ? null : this.buWork.SkuCode,
                        SkuGrade = this.buWork == null ? null : this.buWork.SkuGrade,
                        SkuLot = this.buWork == null ? null : this.buWork.SkuLot,
                        SkuItemNo = this.buWork == null ? null : this.buWork.ItemNo,
                        SkuQty = this.buWork == null ? 0 : this.buWork.SkuQty,
                        SkuUnit = this.buWork == null ? null : this.buWork.SkuUnit,
                        SkuStatus = this.buWork == null ? null : this.buWork.SkuStatus,
                        EventStatus = BaseObjectEventStatus.TEMP,
                        Status = EntityStatus.ACTIVE
                    };
                    this.baseObj.ID = DataADO.GetInstant().Insert<act_BaseObject>(this.baseObj, this.BuVO);
                    //writeEventLog(baseObj, buWork, "สร้าง BaseObject ");
                }                

                this.McNextStep = "2";
            
            

            
        }

        /// <summary>
        /// Update ข้อมูลพาเลทสินค้า
        /// </summary>
        private void step2()
        {
            this.StepTxt = "2";
            

                //Update ข้อมูลพาเลทสินค้า
                if (this.baseObj != null && this.baseObj.EventStatus == BaseObjectEventStatus.TEMP)
                {
                    this.baseObj.BuWork_ID = this.buWork == null ? null : this.buWork.ID;
                    this.baseObj.DisCharge = this.buWork == null ? 0 : this.buWork.DisCharge;
                    this.baseObj.ErrorCode = this.errCode;
                    this.baseObj.PassFlg = this.PassFlg == 0 ? "N" : "Y";
                    this.baseObj.EventStatus = BaseObjectEventStatus.INBOUND;
                    this.baseObj.Status = EntityStatus.ACTIVE;
                    DataADO.GetInstant().UpdateBy<act_BaseObject>(this.baseObj, this.BuVO);
                }

                this.BaseObject_ID = this.baseObj != null ? this.baseObj.ID : null;
                //writeEventLog(baseObj, buWork, "อัพเดตรายละเอียด BaseObject จาก BuWork");

                this.McNextStep = "3";
           
        }

        /// <summary>
        /// ตรวจสอบข้อผิดพลาด
        /// </summary>
        private void step3()
        {
            this.StepTxt = "3";
            
                //ถ้าไม่พบข้อผิดพลาด สั่งให้ทำงานต่อ
                if (this.PassFlg == 1)
                {
                    writeEventLog(baseObj, buWork, "ไม่พบข้อผิดพลาด สั่งให้ทำงานต่อ");
                    this.McNextStep = "3.1";
                }
                else
                {
                    //ถ้าพบข้อผิดพลาด ให้ Reject
                    writeEventLog(baseObj, buWork, "พบข้อผิดพลาด ให้ Reject");
                    this.McNextStep = "3.2";
                }
                       

            
        }

        /// <summary>
        /// สั่ง RCO ทำงานต่อ
        /// </summary>
        private void step3_1()
        {
            this.StepTxt = "3_1";
           
                //this.PostCommand(McCommandType.CM_1);
                //this.PostCommand(McCommandType.CM_1, 0, 0, 1, baseObj.Code, (int)baseObj.SkuQty, () => writeEventLog(baseObj, buWork, "สั่ง RCO ทำงานต่อ"));
                this.PostCommand(McCommandType.CM_1, ListKeyValue<string, object>   
                                    .New("Set_PalletID", baseObj.Code)
                                    .Add("Set_Comm", 1));
            

            this.McNextStep = "0";
        }

        /// <summary>
        /// Reject
        /// </summary>
        private void step3_2()
        {
            this.StepTxt = "3_2";
            
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
                //writeEventLog(baseObj, buWork, "Reject");
            

            this.McNextStep = "0";
        }

        private void writeEventLog(act_BaseObject _bo, act_BuWork _bu, string _msg)
        {
            string msg = this.Code + " > Working step " + this.StepTxt + " | Message =" + _msg;
            msg += " | LABEL =" + this.McObj.DV_Pre_BarProd + " | DisCharge =" + (_bo != null ? _bo.DisCharge : "");
            msg += " | Checking Status =" + (_bo != null ? _bo.PassFlg : this.PassFlg) + " | Command reject =" + (McCommandType)this.cmdReject + " | Error =" + this.errCode;
            msg += " | Warehouse =" + this.Cur_Area.Warehouse_ID;
            msg += " | BuWork_ID =" + (_bo != null ? _bo.BuWork_ID : "") + " | BaseObject_ID =" + (_bo != null ? _bo.ID : "") ;
           // msg += " | WorkQueue_ID =" + (_bo != null ? _bu.WMS_WorkQueue_ID : "") ;

            DisplayController.Events_Write(msg);
        }
        #endregion

    }
}
