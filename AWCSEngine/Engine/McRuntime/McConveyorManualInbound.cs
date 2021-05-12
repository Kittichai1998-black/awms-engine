using ADO.WCSDB;
using AMSModel.Constant.EnumConst;
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
        private int errCode { get; set; }
        private int cmdReject { get; set; }
        private int PassFlg { get; set; }
        private long? BuWork_ID { get; set; }
        private long? BaseObject_ID { get; set; }
        private int disCharge { get; set; }
        private string McNextStep { get; set; }
        private int[] dimentionErr = new int[] { 104, 105, 106, 107, 108,109 };
        #endregion

        #region Methods
        private void Mc_OnRun()
        {
            if (this.McObj == null ) { return; }

            switch (this.McNextStep)
            {
                case "0":
                    //Check cv status 
                    step0();
                    break;

                case "0.1":
                    //Check barcode 
                    step0_1();
                    break;

                case "0.2":
                    //Check dimention
                    step0_2();
                    break;

                case "0.3":
                    //Check Conveyor มีคำสั่งค้าง หรือ รอยืนยันจบงาน
                    step0_3();
                    break;

                case "1":
                    //Create  pallet data
                    step1();
                    break;

                case "2":
                    //Create  pallet data
                    step2();
                    break;

                case "2.1":
                    //check ข้อมูลพาเลท
                    step2_1();
                    break;

                case "2.2":
                    //Reject ข้อมูลพาเลท
                    step2_2();
                    break;

                case "3.1":
                    //สร้างคิวงาน
                    step3_1();
                    break;

                case "4.1":
                    //Conveyor ทำงาน
                    step4_1();
                    break;

                case "4.2":
                    //Reject คิวงาน
                    step4_2();
                    break;

                case "5.1":
                    //สั่งให้เริ่มทำงานเก็บ
                    step5_1();
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

        private void writeEventLog(act_BaseObject _bo, act_BuWork _bu, string _msg)
        {
            string msg = this.Code + " > Working step " + this.StepTxt + " | LABEL =" + this.McObj.DV_Pre_BarProd + " | DisCharge =" + (_bo != null ? _bo.DisCharge : "");
            msg += " | BuWork_ID =" + (_bo != null ? _bo.BuWork_ID : "") + " | BaseObject_ID =" + (_bo != null ? _bo.ID : "") + " | Checking Status =" + (_bo != null ? _bo.PassFlg : "");
            msg += " | WorkQueue_ID =" + (_bo != null ? _bu.WMS_WorkQueue_ID : "") + " | Message =" + _msg;

            DisplayController.Events_Write(msg);
        }

        /// <summary>
        /// Check conveyor status
        /// </summary>
        private void step0()
        {
            this.StepTxt = "0";
            try
            {
                if (this.McObj.DV_Pre_Status == 98 && !string.IsNullOrWhiteSpace(this.McObj.DV_Pre_BarProd))
                {
                    //Sacn barcode และตรวจสอบ
                    writeEventLog(baseObj, buWork, "Check pallet barcode");
                    this.McNextStep = "0.1";

                }
                else if ((Array.IndexOf(dimentionErr, this.McObj.DV_Pre_Status) >= 0))
                {
                    //Check dimention
                    writeEventLog(baseObj, buWork, "Check dimention");
                    this.McNextStep = "0.2";
                }
                else
                {
                    //Check Conveyor มีคำสั่งค้าง หรือ รอยืนยันจบงาน
                    writeEventLog(baseObj, buWork, "clear conveyor");
                    this.McNextStep = "0.3";
                }
            }
            catch (Exception ex)
            {
                string msg = this.Code + " > Working step " + this.StepTxt + " | LABEL =" + this.McObj.DV_Pre_BarProd + " | error =" + ex.Message;
                DisplayController.Events_Write(msg);
            }
        }

        /// <summary>
        /// Check pallet barcode
        /// </summary>
        private void step0_1()
        {
            this.StepTxt = "0.1";
            try
            {
                checkBarProd();
            }
            catch (Exception ex)
            {
                string msg = this.Code + " > Working step " + this.StepTxt + " | LABEL =" + this.McObj.DV_Pre_BarProd + " | error =" + ex.Message;
                DisplayController.Events_Write(msg);
                this.McNextStep = "0";
            }
        }

        /// <summary>
        /// Check dimention
        /// </summary>
        private void step0_2()
        {
            this.StepTxt = "0.2";
            try
            {
                this.errCode = this.McObj.DV_Pre_Status;
                this.cmdReject = (int)McCommandType.CM_14;
                this.PassFlg = (int)PassFailFlag.Fail;
                writeEventLog(baseObj, buWork, "Reject dimention");
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
        /// Clear conveyor
        /// </summary>
        private void step0_3()
        {
            this.StepTxt = "0.3";
            try
            {
                clear();
            }
            catch (Exception ex)
            {
                string msg = this.Code + " > Working step " + this.StepTxt + " | LABEL =" + this.McObj.DV_Pre_BarProd + " | error =" + ex.Message;
                DisplayController.Events_Write(msg);
                
            }
            finally{
                this.McNextStep = "0";
            }
        }


        /// <summary>
        /// 0.1
        /// </summary>
        private void checkBarProd()
        {
            try
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
                    var bo = BaseObjectADO.GetInstant().GetByLabel(this.McObj.DV_Pre_BarProd, this.Cur_Warehouse.ID, this.BuVO);
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

                    this.disCharge = this.buWork.DisCharge;
                    this.BuWork_ID = this.buWork == null ? 0 : this.buWork.ID;
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

                writeEventLog(baseObj, buWork, "Check Pallet Barcode");
            }
            catch (Exception ex)
            {
                string msg = this.Code + " > Working step " + this.StepTxt + " | LABEL =" + this.McObj.DV_Pre_BarProd + " | error =" + ex.Message;
                DisplayController.Events_Write(msg);
            }
            finally
            {
                this.McNextStep = "1";

            }

           
        }

        /// <summary>
        /// Create  pallet data
        /// </summary>
        private void step1()
        {
            this.StepTxt = "1";
            try
            {
                if (this.McObj.DV_Pre_Status == 98 && !string.IsNullOrWhiteSpace(this.McObj.DV_Pre_BarProd))
                {
                    //pallet data
                    checkPallet();
                }
                
            }
            catch (Exception ex)
            {
                string msg = this.Code + " > Working step " + this.StepTxt + " | LABEL =" + this.McObj.DV_Pre_BarProd + " | error =" + ex.Message;
                DisplayController.Events_Write(msg);
            }
        }

        /// <summary>
        /// 1
        /// </summary>
        private void checkPallet()
        {
            try
            {
                //ถ้าสแกนครั้งแรก สร้างข้อมูลรับเข้าพาเลทสินค้า
                if (this.baseObj == null)
                {
                    this.baseObj = InboundUtil.createBaseObject(this.McObj, this.buWork, this.Cur_Area, this.Cur_Location, this.BuVO);
                }

                //Update ข้อมูลรับเข้า ให้กับข้อมูลพาเลทสินค้า
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

                

                writeEventLog(baseObj, buWork, "สร้าง BaseObject และ อัพเดตรายละเอียดจาก BuWork");

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
        /// check ข้อมูลพาเลท
        /// </summary>
        private void step2()
        {
            this.StepTxt = "2";
            try
            {
                

                //ถ้าไม่พบข้อผิดพลาด สั่งให้ทำงานต่อ
                if (this.PassFlg == 1)
                {
                    this.McNextStep = "2.1";
                }
                else
                {
                    this.McNextStep = "2.2";
                }


            }
            catch (Exception ex)
            {
                string msg = this.Code + " > Working step " + this.StepTxt + " | LABEL =" + this.McObj.DV_Pre_BarProd + " | error =" + ex.Message;
                DisplayController.Events_Write(msg);
            }
        }

        /// <summary>
        /// check คิวงาน
        /// </summary>
        private void step2_1()
        {
            this.StepTxt = "2.1";
            try
            {
                this.mcWork = InboundUtil.getMcWorkByQueueType(this.McObj, QueueType.QT_1, this.BuVO);

                //ไม่มีคิวงาน
                if (this.mcWork == null)
                {
                    //สร้างคิวงาน
                    writeEventLog(baseObj, null, "ไม่มีคิวงาน");
                    this.McNextStep = "3.1";
                }
                else
                {
                    //สั่งให้เริ่มทำงานเก็บ
                    writeEventLog(baseObj, null, "มีคิวงาน");
                    this.McNextStep = "4.1";
                }

            }
            catch (Exception ex)
            {
                string msg = this.Code + " > Working step " + this.StepTxt + " | LABEL =" + this.McObj.DV_Pre_BarProd + " | error =" + ex.Message;
                DisplayController.Events_Write(msg);
            }
        }

        /// <summary>
        /// Reject พาเลท
        /// </summary>
        private void step2_2()
        {
            this.StepTxt = "2.2";
            try
            {
                //ถ้าพบข้อผิดพลาด ให้ Reject
                if (this.cmdReject != 0)
                {
                    McCommandType cmd = (McCommandType)this.cmdReject;
                    this.PostCommand(cmd);
                }
                else
                {
                    this.PostCommand(McCommandType.CM_14);
                }
                writeEventLog(baseObj, buWork, "Reject พาเลทสินค้า");
                this.McNextStep = "0";
            }
            catch (Exception ex)
            {
                string msg = this.Code + " > Working step " + this.StepTxt + " | LABEL =" + this.McObj.DV_Pre_BarProd + " | error =" + ex.Message;
                DisplayController.Events_Write(msg);
            }
        }


        /// <summary>
        /// สร้างคิวงาน
        /// </summary>
        private void step3_1()
        {
            this.StepTxt = "3.1";
            try
            {

                if (baseObj != null && !String.IsNullOrWhiteSpace(baseObj.PassFlg) && baseObj.PassFlg.Equals("Y"))
                {
                    InboundUtil.createWorkQueue(this.McObj, baseObj, buWork, this.BuVO);
                    writeEventLog(baseObj, null, "สร้างคิวงาน Cv");
                    this.McNextStep = "4.1";
                }
                else
                {
                    writeEventLog(baseObj, buWork, "Reject จากจุดซ้อนพาเลท");
                    this.McNextStep = "2.2";
                }

            }
            catch (Exception ex)
            {
                string msg = this.Code + " > Working step " + this.StepTxt + " | LABEL =" + this.McObj.DV_Pre_BarProd + " | error =" + ex.Message;
                DisplayController.Events_Write(msg);
            }
        }

        /// <summary>
        /// Check คิวงาน พร้อมเก็บ
        /// </summary>
        private void step4_1()
        {
            this.StepTxt = "4.1";
            try
            {
                if (this.mcWork.Des_Location_ID != 0 && this.mcWork.Rec_McObject_ID != 0 && this.mcWork.QueueStatus != 7 && this.mcWork.QueueStatus == 5)
                {
                    writeEventLog(baseObj, buWork, "คิวงาน พร้อมเก็บ");
                    this.McNextStep = "5.1";
                }
                else
                {
                    writeEventLog(baseObj, buWork, "คิวงาน ไม่พร้อมเก็บ");
                    this.McNextStep = "4.2";
                }
            }
            catch (Exception ex)
            {
                string msg = this.Code + " > Working step " + this.StepTxt + " | LABEL =" + this.McObj.DV_Pre_BarProd + " | error =" + ex.Message;
                DisplayController.Events_Write(msg);
            }
        }


        /// <summary>
        /// Reject คิวงาน
        /// </summary>
        private void step4_2()
        {
            this.StepTxt = "4.2";
            try
            {
                baseObj.Status = EntityStatus.REMOVE;
                DataADO.GetInstant().UpdateBy<act_BaseObject>(baseObj, this.BuVO);

                this.mcWork.EventStatus = McWorkEventStatus.REMOVE_QUEUE;
                this.mcWork.Status = EntityStatus.REMOVE;
                DataADO.GetInstant().UpdateBy<act_McWork>(this.mcWork, this.BuVO);

                //พื้นที่จัดเก็บเต็ม
                if (this.mcWork.QueueStatus != 7)
                {
                    //Reject พื้นที่จัดเก็บเต็ม                   

                    this.PostCommand(McCommandType.CM_13);
                    writeEventLog(baseObj, buWork, "Reject พื้นที่จัดเก็บเต็ม");
                }
                else
                {
                    this.PostCommand(McCommandType.CM_14);
                    writeEventLog(baseObj, buWork, "Reject จากคอมพิวเตอร์");
                }
                this.McNextStep = "0";
            }
            catch (Exception ex)
            {
                string msg = this.Code + " > Working step " + this.StepTxt + " | LABEL =" + this.McObj.DV_Pre_BarProd + " | error =" + ex.Message;
                DisplayController.Events_Write(msg);
            }
        }

        private void step5_1()
        {
            this.StepTxt = "5.1";
            try
            {
                this.mcWork.EventStatus = McWorkEventStatus.ACTIVE_WORKING;
                this.mcWork.ActualTime = DateTime.Now;
                DataADO.GetInstant().UpdateBy<act_McWork>(this.mcWork, this.BuVO);

                //สั่งให้ Conveyor เริ่มทำงานเก็บ
                this.PostCommand(McCommandType.CM_1, 0, 0, 1, baseObj.Code, (int)baseObj.SkuQty, () => writeEventLog(baseObj, buWork, "Conveyor เริ่มทำงานเก็บ"));
                this.McNextStep = "6.1";
            }
            catch (Exception ex)
            {
                string msg = this.Code + " > Working step " + this.StepTxt + " | LABEL =" + this.McObj.DV_Pre_BarProd + " | error =" + ex.Message;
                DisplayController.Events_Write(msg);
                this.McNextStep = "0";
            }
        }


        /// <summary>
        /// จบคิวงาน Conveyor
        /// </summary>
        private void step6_1()
        {
            this.StepTxt = "6.1";
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
                this.McNextStep = "0";
            }
        }


        
        #endregion
    }

}
