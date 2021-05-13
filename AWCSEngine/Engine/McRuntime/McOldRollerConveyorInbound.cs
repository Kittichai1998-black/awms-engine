using ADO.WCSDB;
using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using AMWUtil.Common;
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
        private int dimentionEjectStatus { get; set; }
        private bool dimentionEjectFlg { get; set; }
        private int disCharge { get; set; }
        private int errCode { get; set; }
        private int cmdReject { get; set; }
        private string palletLabelData { get; set; }
        private act_BuWork buWork { get; set; }
        private act_BaseObject baseObj { get; set; }
        private int PassFlg { get; set; }
        private long? BuWork_ID { get; set; }
        private long? BaseObject_ID { get; set; }
        private string McNextStep { get; set; }
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
            try
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

                    case 98:
                        //อ่าน Barcode ได้
                        if (!string.IsNullOrWhiteSpace(this.McObj.DV_Pre_BarProd))
                        {
                            //ตรวจสอบข้อมูลรับเข้า

                            this.buWork = InboundUtil.GetBuWorkByLabel(this.McObj, this.Cur_Area, this.BuVO);

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
            }
            catch(Exception ex)
            {
                string msg = this.Code + " > Working step " + this.StepTxt + " | LABEL =" + this.McObj.DV_Pre_BarProd + " | error =" + ex.Message;
                DisplayController.Events_Write(msg);
            }
            finally
            {
                this.StepTxt = "0";
                if(this.McObj.DV_Pre_Status == 98)
                {
                    this.McNextStep = "1";
                }
                

            }
            

            

        }

        /// <summary>
        /// สร้าง base Object
        /// </summary>
        private void step1()
        {
            this.StepTxt = "1";
            try
            {
                //ถ้าสแกนครั้งแรก สร้างข้อมูลรับเข้าพาเลทสินค้า
                if (this.baseObj == null)
                {
                    this.baseObj = InboundUtil.createBaseObject(this.McObj, this.buWork, this.Cur_Area, this.Cur_Location, this.BuVO);
                    //writeEventLog(baseObj, buWork, "สร้าง BaseObject ");
                }                

                this.McNextStep = "2";
            }
            catch (Exception ex)
            {
                string msg = this.Code + " > Working step " + this.StepTxt + " | LABEL =" + this.McObj.DV_Pre_BarProd + " | error =" + ex.Message;
                DisplayController.Events_Write(msg);
                this.McNextStep = "0";
            }
            

            
        }

        /// <summary>
        /// Update ข้อมูลพาเลทสินค้า
        /// </summary>
        private void step2()
        {
            this.StepTxt = "2";
            try
            {

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
            catch (Exception ex)
            {
                string msg = this.Code + " > Working step " + this.StepTxt + " | LABEL =" + this.McObj.DV_Pre_BarProd + " | error =" + ex.Message;
                DisplayController.Events_Write(msg);
                this.McNextStep = "0";
            }
        }

        /// <summary>
        /// ตรวจสอบข้อผิดพลาด
        /// </summary>
        private void step3()
        {
            this.StepTxt = "3";
            try
            {
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
            catch (Exception ex)
            {
                string msg = this.Code + " > Working step " + this.StepTxt + " | LABEL =" + this.McObj.DV_Pre_BarProd + " | error =" + ex.Message;
                DisplayController.Events_Write(msg);
            }
            finally
            {                
                this.McNextStep = "0";

            }
            

            
        }

        /// <summary>
        /// สั่ง RCO ทำงานต่อ
        /// </summary>
        private void step3_1()
        {
            this.StepTxt = "3_1";
            try
            {
                //this.PostCommand(McCommandType.CM_1);
                this.PostCommand(McCommandType.CM_1, 0, 0, 1, baseObj.Code, (int)baseObj.SkuQty, () => writeEventLog(baseObj, buWork, "สั่ง RCO ทำงานต่อ"));

            }
            catch (Exception ex)
            {
                string msg = this.Code + " > Working step " + this.StepTxt + " | LABEL =" + this.McObj.DV_Pre_BarProd + " | error =" + ex.Message;
                DisplayController.Events_Write(msg);               
            }
            finally
            {
                this.McNextStep = "0";
            }
        }

        /// <summary>
        /// Reject
        /// </summary>
        private void step3_2()
        {
            this.StepTxt = "3_2";
            try
            {
                if (this.cmdReject != 0)
                {
                    McCommandType cmd = (McCommandType)this.cmdReject;
                    this.PostCommand(cmd);
                }
                else
                {
                    this.PostCommand(McCommandType.CM_15);
                }
                //writeEventLog(baseObj, buWork, "Reject");
            }
            catch (Exception ex)
            {
                string msg = this.Code + " > Working step " + this.StepTxt + " | LABEL =" + this.McObj.DV_Pre_BarProd + " | error =" + ex.Message;
                DisplayController.Events_Write(msg);
            }
            finally
            {
                this.McNextStep = "0";
            }
        }

        private void writeEventLog(act_BaseObject _bo, act_BuWork _bu, string _msg)
        {
            string msg = this.Code + " > Working step " + this.StepTxt + " | Message =" + _msg;
            msg += " | LABEL =" + this.McObj.DV_Pre_BarProd + " | DisCharge =" + (_bo != null ? _bo.DisCharge : "");
            msg += " | BuWork_ID =" + (_bo != null ? _bo.BuWork_ID : "") + " | BaseObject_ID =" + (_bo != null ? _bo.ID : "") + " | Checking Status =" + (_bo != null ? _bo.PassFlg : "");
            msg += " | WorkQueue_ID =" + (_bo != null ? _bu.WMS_WorkQueue_ID : "") ;

            DisplayController.Events_Write(msg);
        }
        #endregion

    }
}
