using ADO.WCSDB;
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
    public class McSRMInbound : BaseMcRuntime
    {
        protected override McTypeEnum McType => McTypeEnum.SRM;

        public McSRMInbound(acs_McMaster mcMst) : base(mcMst)
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
        private acs_McMaster _mcPS { get; set; }
        private BaseMcRuntime mcShuttle { get; set; }
        private BaseMcRuntime mcConveyor { get; set; }
        private string McNextStep { get; set; }
        private string[] moveShuQ = new string[] { "1", "4", "6", "7", "9" };
        private string inboundQ = "1";
        private string movePalQ = "4";
        private int[] cvWorked = new int[] { 4, 14 };
        #endregion

        #region Methods
        private void Mc_OnRun()
        {
            if (this.McObj == null) { return; }

            switch (this.McNextStep)
            {
                case "0":
                    //Check คิวงาน
                    step0();
                    break;

                case "1":
                    //ตรวจสอบข้อมูลพาเลท
                    step1();
                    break;

                case "1.1":
                    //ตรวจสอบต้นทางและปลายทางพร้อมทำงาน
                    step1_1();
                    break;

                case "2.1":
                    //SRM ทำคิวงานเก็บ
                    step2_1();
                    break;

                case "2.2":
                    //SRM ทำคิวงานย้ายรถ
                    step2_2();
                    break;

                case "2.3":
                    //SRM ทำคิวงานย้ายพาเลท
                    step2_3();
                    break;

                case "3.1":
                    //จบงาน SRM เก็บของ
                    step3_1();
                    break;

                case "3.2":
                    //จบงาน SRM ย้ายรถ
                    step3_2();
                    break;

                case "3.3":
                    //จบงาน SRM ย้ายของ
                    step3_3();
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

        private void checkPalletStand()
        {
            if (this.McObj.DV_Pre_Status == 22)
            {
                //Check Pallet stand กรณีจัดเก็บแบบ Manual (RC8-2)
                //_mcPS = InboundUtil.findPalletStand(baseObj.Warehouse_ID,this.BuVO);
                this._mcPS = DataADO.GetInstant().SelectBy<acs_McMaster>(
                       ListKeyValue<string, object>
                       .New("Warehouse_ID", this.baseObj.Warehouse_ID)
                       .Add("Info1", "IN")
                       , BuVO).FirstOrDefault(x => x.Code.StartsWith("PS"));

                if (this._mcPS == null) { return; }

                var ps = McRuntimeController.GetInstant().GetMcRuntime(this._mcPS.Code);
                if (ps.McObj.DV_Pre_Status == 1)
                {
                    ps.PostCommand(McCommandType.CM_2, 0, 0, 1, "PL00000000", 1500, (mc) =>
                    {
                        if (this.McObj.DV_Pre_Status == 99)
                        {
                            this.PostCommand(McCommandType.CM_99);
                            return LoopResult.Break;
                        }
                        return LoopResult.Continue;
                    });
                }
            }
        }

        private void writeEventLog(act_BaseObject _bo, act_BuWork _bu, string _msg)
        {
            string msg = " > Working step " + this.StepTxt + " | Message =" + _msg;
            msg += " | LABEL  =" + this.McObj.DV_Pre_BarProd + " | DisCharge =" + (_bo != null ? _bo.DisCharge : "");
            msg += " | BuWork_ID =" + (_bo != null ? _bo.BuWork_ID : "") + " | BaseObject_ID =" + (_bo != null ? _bo.ID : "") + " | Checking Status =" + (_bo != null ? _bo.PassFlg : "");
            msg += " | WorkQueue_ID =" + (_bo != null ? _bu.WMS_WorkQueue_ID : "");

            DisplayController.Events_Write(this.Code,msg);
        }

        

        /// <summary>
        /// Check คิวงาน
        /// </summary>
        private void step0()
        {
            this.StepTxt = "0";
            
                // คิวเก็บ
                this.mcWork = DataADO.GetInstant().SelectBy<act_McWork>(
                           ListKeyValue<string, object>
                           .New("QueueType", QueueType.QT_1)
                           .Add("IOType", IOType.INBOUND)
                           .Add("QueueStatus", QueueStatus.QS_5)
                           , this.BuVO).FirstOrDefault();

                if (this.mcWork != null)
                {
                    writeEventLog(this.baseObj, this.buWork, "สั่งให้ SRM ทำคิวงานเก็บ");
                    step1("1.1");
                }
                else
                {
                    // คิวย้ายรถ
                    this.mcWork = DataADO.GetInstant().SelectBy<act_McWork>(
                               new SQLConditionCriteria[]
                    {
                        new SQLConditionCriteria("QueueType", moveShuQ, SQLOperatorType.IN),
                        new SQLConditionCriteria("IOType", IOType.INBOUND, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("QueueStatus", QueueStatus.QS_3, SQLOperatorType.EQUALS)
                    }
                               , this.BuVO).FirstOrDefault();

                    if (this.mcWork != null)
                    {
                        writeEventLog(this.baseObj, this.buWork, "สั่งให้ SRM ทำคิวงานย้ายรถ");
                        step1("2.2");
                    }
                    else
                    {
                        // คิวย้ายของ
                        this.mcWork = DataADO.GetInstant().SelectBy<act_McWork>(
                                   ListKeyValue<string, object>
                                   .New("QueueType", QueueType.QT_4)
                                   .Add("IOType", IOType.INBOUND)
                                   .Add("QueueStatus", QueueStatus.QS_5)
                                   , this.BuVO).FirstOrDefault();

                        if (this.mcWork != null)
                        {
                            writeEventLog(this.baseObj, this.buWork, "สั่งให้ SRM ทำคิวงานย้ายพาเลท");
                            step1("2.3");
                        }
                    }
                }

            
        }

        /// <summary>
        /// ตรวจสอบข้อมูลพาเลท
        /// </summary>
        private void step1(string nextStep = null)
        {
            if (String.IsNullOrWhiteSpace(nextStep)) { nextStep = "1.1"; }
            this.StepTxt = "1";
            
                if (this.mcWork == null) { return; }
                this.baseObj = BaseObjectADO.GetInstant().GetByID(this.mcWork.BaseObject_ID, this.BuVO);
                if (this.baseObj == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V0_STO_NOT_FOUND, this.mcWork.BaseObject_ID.ToString());

                this.buWork = DataADO.GetInstant().SelectByID<act_BuWork>(this.mcWork.BuWork_ID, this.BuVO);
                if (this.buWork == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V0_DOC_NOT_FOUND, this.McObj.DV_Pre_BarProd);

                this.mcShuttle = McRuntimeController.GetInstant().GetMcRuntime(this.mcWork.Rec_McObject_ID.GetValueOrDefault());
                this.mcConveyor = McRuntimeController.GetInstant().GetMcRuntimeByLocation(this.mcWork.Sou_Location_ID);

                this.baseObj.McObject_ID = this.ID;
                DataADO.GetInstant().UpdateBy<act_BaseObject>(this.baseObj, this.BuVO);

                //writeEventLog(baseObj, buWork, "ตรวจสอบข้อมูลพาเลท");
                this.McNextStep = nextStep;

            
        }

        /// <summary>
        /// ตรวจสอบต้นทางและปลายทางพร้อมทำงาน
        /// </summary>
        private void step1_1()
        {
            this.StepTxt = "1.1";
            
                if (mcConveyor != null && (Array.IndexOf(cvWorked, mcConveyor.McObj.DV_Pre_Status) >= 0))
                {
                    this.mcWork.EventStatus = McWorkEventStatus.ACTIVE_RECEIVE;
                    this.mcWork.ActualTime = DateTime.Now;
                    DataADO.GetInstant().UpdateBy<act_McWork>(this.mcWork, this.BuVO);
                    //writeEventLog(baseObj, buWork, "รอ SRM รับงานเก็บ");

                }
                
            
        }

        /// <summary>
        /// SRM ทำคิวงานเก็บ
        /// </summary>
        private void step2_1()
        {
            this.StepTxt = "2.1";
            
                if(this.McObj.DV_Pre_Status == 90)
                {
                    var souLoc = this.StaticValue.GetLocation(this.mcWork.Sou_Location_ID);
                    var desLoc = this.StaticValue.GetLocation(this.mcWork.Des_Location_ID.GetValueOrDefault());
                    int _souLocCode = souLoc != null ? (souLoc.Code.Get2<int>()) : 0;
                    int _desLocCode = desLoc != null ? (desLoc.Code.Get2<int>() % 1000000) : 0;

                    // สั่ง SRM ย้าย
                    this.PostCommand(McCommandType.CM_1, _souLocCode, _desLocCode, 1, baseObj.Code, (int)baseObj.SkuQty, () => writeEventLog(baseObj, buWork, "สั่งเครนเก็บพาเลทจากต้นทางไปปลายทาง"));
                    this.mcWork.EventStatus = McWorkEventStatus.ACTIVE_WORKING;
                    this.mcWork.ActualTime = DateTime.Now;
                    DataADO.GetInstant().UpdateBy<act_McWork>(this.mcWork, this.BuVO);

                    //writeEventLog(baseObj, buWork, "สั่งเครนเก็บสินค้า");

                    this.McNextStep = "3.1";                   

                    
                }
            
        }

        /// <summary>
        /// SRM ทำคิวงานย้ายรถ
        /// </summary>
        private void step2_2()
        {
            this.StepTxt = "2.2";
           
                //var souLoc = this.StaticValue.GetLocation(this.mcWork.Sou_Location_ID);
                //int _souLocCode = souLoc != null ? (souLoc.Code.Get2<int>()) : 0;

                var desLoc = this.StaticValue.GetLocation(this.mcWork.Des_Location_ID.GetValueOrDefault());                
                int _desLocCode = desLoc != null ? (desLoc.Code.Get2<int>() % 1000000) : 0;

                var _souLocCode = mcShuttle.Cur_Location.Code.Get2<int>() % 1000000;
                _souLocCode += 2000000;

                // สั่ง SRM ย้าย Shuttle
                this.PostCommand(McCommandType.CM_1,
                   _souLocCode,
                    _desLocCode,
                    3, "0000000000", 1000, null, () => writeEventLog(baseObj, buWork, "สั่งเครนย้าย Shuttle"));

                this.mcWork.EventStatus = McWorkEventStatus.ACTIVE_WORKING;
                this.mcWork.ActualTime = DateTime.Now;
                DataADO.GetInstant().UpdateBy<act_McWork>(this.mcWork, this.BuVO);

                //writeEventLog(baseObj, buWork, "สั่งเครนย้าย Shuttle");

                this.McNextStep = "3.2";
                
            
        }

        /// <summary>
        /// SRM ทำคิวงานย้ายพาเลท
        /// </summary>
        private void step2_3()
        {
            this.StepTxt = "2.3";
            
                var souLoc = this.StaticValue.GetLocation(this.mcWork.Sou_Location_ID);
                var desLoc = this.StaticValue.GetLocation(this.mcWork.Des_Location_ID.GetValueOrDefault());
                int _souLocCode = souLoc != null ? (souLoc.Code.Get2<int>()) : 0;
                int _desLocCode = desLoc != null ? (desLoc.Code.Get2<int>() % 1000000) : 0;

                // สั่ง SRM ย้ายพาเลท
                this.PostCommand(McCommandType.CM_1, _souLocCode, _desLocCode, 1, this.baseObj.Code, (int)this.baseObj.SkuQty, () => writeEventLog(this.baseObj, this.buWork, "สั่งเครนเก็บพาเลทจากต้นทางไปปลายทาง"));
                this.mcWork.EventStatus = McWorkEventStatus.ACTIVE_WORKING;
                this.mcWork.ActualTime = DateTime.Now;
                DataADO.GetInstant().UpdateBy<act_McWork>(this.mcWork, this.BuVO);

                //writeEventLog(baseObj, buWork, "สั่งเครนย้ายพาเลท");

                this.McNextStep = "3.3";
            
        }

        /// <summary>
        /// จบงาน SRM เก็บของ
        /// </summary>
        private void step3_1()
        {
            this.StepTxt = "3.1";
            
                if (this.McObj.DV_Pre_Status == 99)
                {
                    this.PostCommand(McCommandType.CM_99, (mc) =>
                    {
                        this.mcWork.EventStatus = McWorkEventStatus.ACTIVE_WORKED;
                        this.mcWork.ActualTime = DateTime.Now;
                        this.mcWork.QueueStatus = (int)QueueStatus.QS_6;
                        DataADO.GetInstant().UpdateBy<act_McWork>(this.mcWork, this.BuVO);

                        baseObj.Location_ID = this.McObj.Cur_Location_ID.GetValueOrDefault();
                        DataADO.GetInstant().UpdateBy(baseObj, this.BuVO);

                        return LoopResult.Break;
                    }, () => mcConveyor.PostCommand(McCommandType.CM_99));

                    //writeEventLog(baseObj, buWork, "จบงาน SRM เก็บของ");
                    this.McNextStep = "0";
                }
            
        }

        /// <summary>
        /// จบงาน SRM ย้ายรถ
        /// </summary>
        private void step3_2()
        {
            this.StepTxt = "3.2";
            
                if (this.McObj.DV_Pre_Status == 99)
                {
                    this.PostCommand(McCommandType.CM_99, (mc) =>
                    {
                        this.mcWork.EventStatus = McWorkEventStatus.ACTIVE_WORKED;
                        this.mcWork.ActualTime = DateTime.Now;
                        this.mcWork.QueueStatus = (int)QueueStatus.QS_4;
                        DataADO.GetInstant().UpdateBy<act_McWork>(this.mcWork, this.BuVO);

                        this.baseObj.Location_ID = this.McObj.Cur_Location_ID.GetValueOrDefault();
                        DataADO.GetInstant().UpdateBy(this.baseObj, this.BuVO);

                        return LoopResult.Break;
                    }, () => writeEventLog(baseObj, buWork, "จบงาน SRM ย้ายรถ"));
                    
                    this.McNextStep = "0";
                }
            
        }

        /// <summary>
        /// จบงาน SRM ย้ายของ
        /// </summary>
        private void step3_3()
        {
            this.StepTxt = "3.3";
            
                if (this.McObj.DV_Pre_Status == 99)
                {
                    this.PostCommand(McCommandType.CM_99, (mc) =>
                    {
                        this.mcWork.QueueStatus = (int)QueueStatus.QS_9;
                        this.mcWork.ActualTime = DateTime.Now;
                        DataADO.GetInstant().UpdateBy<act_McWork>(this.mcWork, this.BuVO);

                        this.baseObj.Location_ID = this.McObj.Cur_Location_ID.GetValueOrDefault();
                        DataADO.GetInstant().UpdateBy(this.baseObj, this.BuVO);

                        var _mcWorkOut = DataADO.GetInstant().SelectBy<act_McWork>(
                                   ListKeyValue<string, object>
                                   .New("QueueType", QueueType.QT_2)
                                   .Add("IOType", IOType.OUTBOUND)
                                   .Add("Mc_Ref_ID", this.mcWork.Mc_Ref_ID)
                                   , this.BuVO).FirstOrDefault();
                        if (_mcWorkOut != null)
                        {
                            _mcWorkOut.ActualTime = DateTime.Now;
                            _mcWorkOut.MixLot = "Y";
                            DataADO.GetInstant().UpdateBy<act_McWork>(_mcWorkOut, this.BuVO);
                        }
                        

                        return LoopResult.Break;
                    }, () => writeEventLog(baseObj, buWork, "จบงาน SRM ย้ายของ"));
                    
                    this.McNextStep = "0";
                }
            
        }
        #endregion
    }


}
