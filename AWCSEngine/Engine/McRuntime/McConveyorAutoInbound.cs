using ADO.WCSDB;
using ADO.WCSStaticValue;
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
        private BaseMcRuntime _mcRCO { get; set; }
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
                if (this.McObj.DV_Pre_Status == 98)
                {
                    //writeEventLog(baseObj, buWork, " Check baseObject on " + InboundUtil.McChecking);

                    //หา baseObject ลำดับแรกที่ถูกสร้างจาก RCO5-3
                    _mcRCO = McRuntimeController.GetInstant().GetMcRuntime(InboundUtil.McChecking);
                    baseObj = BaseObjectADO.GetInstant().GetCheckingTempByWarehouse(this.Cur_Area.Warehouse_ID, _mcRCO.McObj.ID, this.BuVO);
                    if (baseObj == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V0_STO_NOT_FOUND,  _mcRCO.McObj.ID.ToString());

                    buWork = InboundUtil.GetBuWorkByObject(baseObj,this.BuVO);
                    if (buWork == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V0_DOC_NOT_FOUND, this.McObj.BaseObject_ID.ToString());

                    

                    this.McNextStep = "1";
                }else
                {
                    clear();
                }
            }
            catch (Exception ex)
            {
                string msg = this.Code + " > Working step " + this.StepTxt + " | Checking  =" + InboundUtil.McChecking + " | McOject =" + this._mcRCO.McObj.ID.ToString() + " | error =" + ex.Message;
                DisplayController.Events_Write(msg);
            }
           
        }

        /// <summary>
        /// Check work queue
        /// </summary>
        private void step1()
        {
            this.StepTxt = "1";
            try
            {
                if (this.McObj.DV_Pre_Status == 98)
                {

                    this.mcWork = InboundUtil.getMcWorkByQueueType(this.McObj, QueueType.QT_1, this.BuVO);

                    //ไม่มีคิวงาน
                    if (this.mcWork == null)
                    {
                        if (!String.IsNullOrWhiteSpace(baseObj.PassFlg) && baseObj.PassFlg.Equals("Y"))
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
            catch (Exception ex)
            {
                string msg = this.Code + " > Working step " + this.StepTxt + " | LABEL =" + this.McObj.DV_Pre_BarProd + " | error =" + ex.Message;
                DisplayController.Events_Write(msg);
                this.McNextStep = "0";
            }
            
        }

        private void step1_1()
        {
            this.StepTxt = "1.1";
            try
            {
                InboundUtil.createWorkQueue(this.McObj, baseObj, buWork, this.BuVO);
                //writeEventLog(baseObj, buWork, "สร้างคิวงาน Cv");
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
        /// Reject จากจุดซ้อนพาเลท
        /// </summary>
        private void step1_2()
        {
            this.StepTxt = "1.2";
            try
            {
                //Reject จากจุดซ้อนพาเลท
                baseObj.Status = EntityStatus.REMOVE;
                DataADO.GetInstant().UpdateBy<act_BaseObject>(baseObj, this.BuVO);

                this.PostCommand(McCommandType.CM_14);
                //writeEventLog(baseObj, buWork, "Reject จากจุดซ้อนพาเลท");
                this.McNextStep = "0";
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
        /// Check คิวงาน พร้อมเก็บ
        /// </summary>
        private void step2()
        {
            this.StepTxt = "2";
            try
            {
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
            catch(Exception ex)
            {
                string msg = this.Code + " > Working step " + this.StepTxt + " | LABEL =" + this.McObj.DV_Pre_BarProd + " | error =" + ex.Message;
                DisplayController.Events_Write(msg);
                this.McNextStep = "0";
            }
            
        }

        /// <summary>
        /// สั่งให้ Conveyor เริ่มทำงานเก็บ
        /// </summary>
        private void step2_1()
        {
            this.StepTxt = "2.1";

            try
            {
                this.mcWork.EventStatus = McWorkEventStatus.ACTIVE_WORKING;
                this.mcWork.ActualTime = DateTime.Now;
                DataADO.GetInstant().UpdateBy<act_McWork>(this.mcWork, this.BuVO);

                //สั่งให้ Conveyor เริ่มทำงานเก็บ
                this.PostCommand(McCommandType.CM_1, 0, 0, 1, baseObj.Code, (int)baseObj.SkuQty, () => writeEventLog(baseObj, buWork, "Conveyor เริ่มทำงานเก็บ"));

                //writeEventLog(baseObj, buWork, "สั่งให้ Conveyor เริ่มทำงานเก็บ");
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
        /// Reject คิวงาน
        /// </summary>
        private void step2_2()
        {
            this.StepTxt = "2.2";

            try
            {
                if (this.mcWork.QueueStatus != 7)
                {
                    //Reject พื้นที่จัดเก็บเต็ม
                    baseObj.Status = EntityStatus.REMOVE;
                    DataADO.GetInstant().UpdateBy<act_BaseObject>(baseObj, this.BuVO);

                    this.mcWork.EventStatus = McWorkEventStatus.REMOVE_QUEUE;
                    this.mcWork.Status = EntityStatus.REMOVE;
                    DataADO.GetInstant().UpdateBy<act_McWork>(this.mcWork, this.BuVO);

                    this.PostCommand(McCommandType.CM_13);
                    //writeEventLog(baseObj, buWork, "Reject พื้นที่จัดเก็บเต็ม");

                    this.McNextStep = "0";
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
                        DataADO.GetInstant().UpdateBy(baseObj, this.BuVO);

                        //writeEventLog(baseObj, buWork, "จบคิวงาน Conveyor");
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
            string msg = this.Code + " > Working step " + this.StepTxt + " | Message =" + _msg;
            msg += " | LABEL =" + this.McObj.DV_Pre_BarProd + " | DisCharge =" + (_bo != null ?_bo.DisCharge : "");
            msg += " | BuWork_ID =" + (_bo != null ? _bo.BuWork_ID : "") + " | BaseObject_ID =" + (_bo != null ? _bo.ID : "") + " | Checking Status =" + (_bo != null ? _bo.PassFlg : "");
            msg += " | WorkQueue_ID =" + (_bo != null ? _bu.WMS_WorkQueue_ID : "") ;

            DisplayController.Events_Write(msg);
        }

        
        #endregion

    }
}
