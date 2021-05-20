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
            this.clear();
            writeEventLog(this.StepTxt + " Status " + this.McObj.DV_Pre_Status);
            this.mainStep = this.StepTxt.Substring(0, 1);

            switch (this.mainStep)
            {
                case "0":
                    //--------------ตรวจสอบคิวงาน
                    writeEventLog("0. ตรวจสอบคิวงาน");

                    // ---------0.1-------คิวเก็บ -> QueueType = 1 , QueueStatus = 5
                    this.srmMcWorkReceive = this.getMcWorkReceive();

                    if (this.srmMcWorkReceive != null)
                    {
                        this.srmBaseObjectReceive = BaseObjectADO.GetInstant().GetByID(this.srmMcWorkReceive.BaseObject_ID, this.BuVO);
                        
                        writeEventLog("1.1 คิวงานเก็บ " + this.srmMcWorkReceive.ID + " BaseObject_ID " + this.srmMcWorkReceive.BaseObject_ID);
                        this.StepTxt = "1.1";
                        break;
                    }


                    //---------0.2------- คิวย้ายรถ ->  QueueStatus = 3

                    this.srmMcWorkShuttle = this.getMcWorkMoveShuttle();

                    if (this.srmMcWorkShuttle != null)
                    {
                        this.srmBaseObjectShuttle = BaseObjectADO.GetInstant().GetByID(this.srmMcWorkShuttle.BaseObject_ID, this.BuVO);

                        writeEventLog("1.2 คิวย้ายรถ " + this.srmMcWorkShuttle.ID + " Type " + this.srmMcWorkShuttle.QueueType + " BaseObject_ID " + this.srmMcWorkShuttle.BaseObject_ID);
                        this.StepTxt = "1.2";
                        break;
                    }

                    //--------0.3-------- คิวย้ายของ -> QueueType = 4 , QueueStatus = 5
                    this.srmMcWorkPallet = this.getMcWorkMovePallet();


                    if (this.srmMcWorkPallet != null)
                    {
                        this.srmBaseObjectPallet = BaseObjectADO.GetInstant().GetByID(this.srmMcWorkPallet.BaseObject_ID, this.BuVO);
                        //------ตรวจสอบมีคิวงานค้างอยู่
                        string aCmd = " select * from act_McWork " +
                                        " where QueueType = 2 " +
                                        " and QueueStatus in (1, 2) "+
                                        " and Status = 1 "+
                                        " and MixLot = 'Y'" +
                                        " and Sou_Location_ID = " + this.srmMcWorkPallet.Des_Location_ID;

                        var outMcWork = DataADO.GetInstant().QueryString<act_McWork>(aCmd, null, this.BuVO).FirstOrDefault();
                        if (outMcWork == null)
                        {
                            writeEventLog("1.3 คิวย้ายของ " + this.srmMcWorkPallet.ID + " ปลายทาง " + this.srmMcWorkPallet.Des_Location_ID + " BaseObject_ID " + this.srmMcWorkPallet.BaseObject_ID);
                            this.StepTxt = "1.3";
                            break;
                        }

                        if (outMcWork != null)
                        {
                            writeEventLog("1.4 กำลังทำงานคิวเบิก " + outMcWork.ID + " สถานะ " + outMcWork.QueueStatus);
                        }




                    }

                    break;

                case "1":
                    //----------Check ต้นทางและปลายทาง พร้อมทำงาน
                    switch (this.StepTxt)
                    {
                        case "1.1": //---คิวเก็บ -> QueueType = 1 , QueueStatus = 5

                            //สั่ง SRM ย้ายพาเลท                            

                            this._souLocCode = 0;
                            this._desLocCode = 0;

                            //Check conveyor ทำงาน : รอส่งสินค้าให้สถานีถัดไป
                            //if ((this.cvMcRuntime != null && cvWorked.Contains(this.cvMcRuntime.McObj.DV_Pre_Status)) && this.McObj.DV_Pre_Status == 90)
                            if (this.McObj.DV_Pre_Status == 90)
                            {
                                if(this.srmMcWorkReceive == null || this.srmBaseObjectReceive == null)
                                {
                                    this.StepTxt = "0.0";
                                    break;
                                }

                                var Locat_CV = DataADO.GetInstant().SelectBy<acs_Location>(
                                                 ListKeyValue<string, object>.New("ID", this.srmMcWorkReceive.Sou_Location_ID)   // location ของ cv
                                                 , this.BuVO).FirstOrDefault();

                                var cvName = Locat_CV != null ? Locat_CV.Name : null;
                                this.cvMcRuntime = Controller.McRuntimeController.GetInstant().GetMcRuntime(cvName);
                                var cvStatus = this.cvMcRuntime != null ? this.cvMcRuntime.McObj.DV_Pre_Status : 0;


                                var souLoc = this.StaticValue.GetLocation(this.srmMcWorkReceive.Sou_Location_ID);
                                var desLoc = this.StaticValue.GetLocation(this.srmMcWorkReceive.Des_Location_ID.GetValueOrDefault());

                                this._souLocCode = souLoc != null ? (souLoc.Code.Get2<int>()) : 0;

                                this._desLocCode = desLoc != null ? (desLoc.Code.Get2<int>() % 1000000) : 0;
                                this._desLocCode += 2000000;

                                writeEventLog("BaseObject_ID " + this.srmMcWorkReceive.BaseObject_ID  + " Location "  + " จาก" + this._souLocCode + " ไปยัง " + this._desLocCode);



                                if (this._souLocCode != 0 && this._desLocCode != 0 )
                                {
                                    this.StepTxt = "2.1";
                                    break;
                                }

                                


                            }
                            break;

                        case "1.2": // คิวย้ายรถ ->  QueueStatus = 3
                            // ------------ สั่ง SRM ย้าย Shuttle
                            if (this.McObj.DV_Pre_Status == 90)
                            {
                                if (this.srmMcWorkShuttle == null || this.srmBaseObjectShuttle == null)
                                {
                                    this.StepTxt = "0.0";
                                    break;
                                }

                                this._souLocCode = 0;
                                this._desLocCode = 0;

                                var desLoc = this.StaticValue.GetLocation(this.srmMcWorkShuttle.Des_Location_ID.GetValueOrDefault());
                                var _mcShuttle = DataADO.GetInstant().SelectBy<act_McObject>("McMaster_ID", this.srmMcWorkShuttle.Rec_McObject_ID.GetValueOrDefault(), null).FirstOrDefault();
                                
                                if (desLoc != null )
                                {
                                    this._desLocCode = desLoc != null ? (desLoc.Code.Get2<int>() % 1000000) : 0;
                                    this._desLocCode += 2000000;
                                }

                                if (_mcShuttle != null)
                                {
                                    var souLoc = this.StaticValue.GetLocation(_mcShuttle.Cur_Location_ID.Value);
                                    if (souLoc != null)
                                    {
                                        this._souLocCode = souLoc.Code.Get2<int>() % 1000000;
                                        this._souLocCode += 2000000;
                                    }
                                }

                                writeEventLog("เตรียมย้าย Shuttle " + this.srmMcWorkShuttle.Rec_McObject_ID + " จาก " + _souLocCode + " ไปยัง " + _desLocCode);

                                if (this._desLocCode != 0 && this._souLocCode != 0)
                                {
                                    this.StepTxt = "2.2";
                                    break;
                                }


                                
                            }

                            break;

                        case "1.3": // คิวย้ายของ -> QueueType = 4 , QueueStatus = 5
                            // ------------ สั่ง SRM ย้าย Pallet กรณี คิวย้าย
                            if (this.McObj.DV_Pre_Status == 90)
                            {
                                if (this.srmMcWorkPallet == null || this.srmBaseObjectPallet == null)
                                {
                                    this.StepTxt = "0.0";
                                    break;
                                }

                                this._souLocCode = 0;
                                this._desLocCode = 0;


                                var souLoc = this.StaticValue.GetLocation(this.srmMcWorkPallet.Sou_Location_ID);
                                var desLoc = this.StaticValue.GetLocation(this.srmMcWorkPallet.Des_Location_ID.GetValueOrDefault());


                                if (souLoc != null)
                                {
                                    this._souLocCode = souLoc.Code.Get2<int>() % 1000000;
                                    this._souLocCode += 2000000;
                                }

                                if (desLoc != null)
                                {
                                    this._desLocCode = desLoc != null ? (desLoc.Code.Get2<int>() % 1000000) : 0;
                                    this._desLocCode += 2000000;
                                }

                                writeEventLog("เตรียมย้าย Pallet " + this.srmBaseObjectPallet.LabelData + " จาก " + _souLocCode + " ไปยัง " + _desLocCode);

                                if (this._desLocCode != 0 && this._souLocCode != 0 )
                                {

                                    this.StepTxt = "2.3";
                                    break;
                                }



                                   
                            }

                            break;
                    }
                    break;
                case "2":
                    //----------สั่ง SRM ทำงาน
                    switch (this.StepTxt)
                    {
                        case "2.1": //---คิวเก็บ -> QueueType = 1 , QueueStatus = 5

                            //สั่ง SRM ย้ายพาเลท

                            //if ((this.cvMcRuntime != null && cvWorked.Contains(this.cvMcRuntime.McObj.DV_Pre_Status)) && this.McObj.DV_Pre_Status == 90)
                            if (this.McObj.DV_Pre_Status == 90)
                            {

                                if (this.srmMcWorkReceive == null || this.srmBaseObjectReceive == null)
                                {
                                    this.StepTxt = "0.0";
                                    break;
                                }

                                if (this.srmMcWorkReceive != null)
                                {
                                    this.srmMcWorkReceive.EventStatus = McWorkEventStatus.ACTIVE_WORKING;
                                    this.srmMcWorkReceive.ActualTime = DateTime.Now;
                                    DataADO.GetInstant().UpdateBy<act_McWork>(this.srmMcWorkReceive, this.BuVO);
                                }

                                // สั่ง SRM ย้าย
                                //this.PostCommand(McCommandType.CM_1, this._souLocCode, this._desLocCode, 1, this.boCode, this.boQty, () => writeEventLog("สั่ง SRM ย้าย " + this.boCode));
                                
                                this.PostCommand(McCommandType.CM_1, ListKeyValue<string, object>
                                    .New("Set_SouLoc", this._souLocCode)
                                    .Add("Set_DesLoc", this._desLocCode)
                                    .Add("Set_Unit", 1)
                                    .Add("Set_PalletID", "A000000020")
                                    .Add("Set_Weigh", 1500)
                                    .Add("Set_Comm", 1));

                                writeEventLog("สั่งเครนเก็บพาเลท " + this.srmBaseObjectReceive.LabelData);


                                

                                this.StepTxt = "3.1";
                                break;


                            }
                            break;

                        case "2.2": // คิวย้ายรถ ->  QueueStatus = 3
                            // ------------ สั่ง SRM ย้าย Shuttle
                            if (this.McObj.DV_Pre_Status == 90)
                            {
                                if (this._desLocCode != 0 && this._souLocCode != 0)
                                {
                                    //writeEventLog("สั่งเครนย้าย Shuttle");

                                    if (this.srmMcWorkShuttle == null || this.srmBaseObjectShuttle == null)
                                    {
                                        this.StepTxt = "0.0";
                                        break;
                                    }

                                    //// สั่ง SRM ย้าย Shuttle
                                    //this.PostCommand(McCommandType.CM_1,
                                    //   _souLocCode,
                                    //   _desLocCode,
                                    //    3, "0000000000", 1000, null, () => writeEventLog("สั่ง SRM ย้าย Shuttle"));

                                    this.PostCommand(McCommandType.CM_1, ListKeyValue<string, object>   
                                    .New("Set_SouLoc", this._souLocCode)
                                    .Add("Set_DesLoc", this._desLocCode)
                                    .Add("Set_Unit", 3)
                                    .Add("Set_PalletID", "0000000000")
                                    .Add("Set_Weigh", 1500)
                                    .Add("Set_Comm", 1));

                                    writeEventLog("สั่ง SRM ย้าย Shuttle");

                                    this._souLocCode = 0;
                                    this._desLocCode = 0;

                                    if (this.srmMcWorkShuttle != null)
                                    {
                                        this.srmMcWorkShuttle.EventStatus = McWorkEventStatus.ACTIVE_WORKING;
                                        this.srmMcWorkShuttle.ActualTime = DateTime.Now;
                                        DataADO.GetInstant().UpdateBy<act_McWork>(this.srmMcWorkShuttle, this.BuVO);
                                    }                                    

                                    this.StepTxt = "3.2";
                                    break;
                                }



                            }

                            break;

                        case "2.3": // คิวย้ายของ -> QueueType = 4 , QueueStatus = 5
                            // ------------ สั่ง SRM ย้าย Pallet กรณี คิวย้าย
                            if (this.McObj.DV_Pre_Status == 90)
                            {
                                
                                if (this._desLocCode != 0 && this._souLocCode != 0 )
                                {
                                    if (this.srmMcWorkPallet == null || this.srmBaseObjectPallet == null)
                                    {
                                        this.StepTxt = "0.0";
                                        break;
                                    }


                                    // สั่ง SRM ย้ายพาเลท
                                    //this.PostCommand(McCommandType.CM_1, this._souLocCode, this._desLocCode, 1, this.boCode, this.boQty
                                    //, () => writeEventLog("สั่ง SRM ย้ายพาเลท " + this.boCode));

                                    this.PostCommand(McCommandType.CM_1, ListKeyValue<string, object>
                                    .New("Set_SouLoc", this._souLocCode)
                                    .Add("Set_DesLoc", this._desLocCode)
                                    .Add("Set_Unit", 1)
                                    .Add("Set_PalletID", "A000000020")
                                    .Add("Set_Weigh", 1500)
                                    .Add("Set_Comm", 1));

                                    writeEventLog("สั่ง SRM ย้ายพาเลท " + this.srmBaseObjectPallet.LabelData);

                                    this._souLocCode = 0;
                                    this._desLocCode = 0;

                                    if (this.srmMcWorkPallet != null)
                                    {
                                        this.srmMcWorkPallet.EventStatus = McWorkEventStatus.ACTIVE_WORKING;
                                        this.srmMcWorkPallet.ActualTime = DateTime.Now;
                                        DataADO.GetInstant().UpdateBy<act_McWork>(this.srmMcWorkPallet, this.BuVO);
                                    }

                                    



                                    this.StepTxt = "3.3";
                                    break;
                                }




                            }

                            break;
                    }


                    break;
                case "3":
                    switch (this.StepTxt)
                    {
                        case "3.1": //---คิวเก็บ -> QueueType = 1 , QueueStatus = 5
                            if (this.McObj.DV_Pre_Status == 99)
                            {
                                if (this.srmMcWorkReceive == null || this.srmBaseObjectReceive == null)
                                {
                                    this.StepTxt = "0.0";
                                    break;
                                }

                                //สั่งกลับ home เมื่อทำงานเสร็จ
                                this.PostCommand(McCommandType.CM_99, (mc) => {
                                    if (mc.McObj.DV_Pre_Status == 90)
                                    {
                                        this.PostCommand(McCommandType.CM_2, () => { });
                                        return LoopResult.Break;
                                    }
                                    return LoopResult.Continue;
                                });
                                writeEventLog("3.1.1 จบงาน SRM");


                                if (this.cvMcRuntime != null)
                                {
                                    writeEventLog("3.1.2 จบงาน Conveyor " + this.cvMcRuntime.Code);
                                    this.cvMcRuntime.PostCommand(McCommandType.CM_99);
                                }

                                if (this.srmBaseObjectReceive != null)
                                {
                                    this.srmBaseObjectReceive.McObject_ID = null;
                                    this.srmBaseObjectReceive.ModifyTime = DateTime.Now; ;
                                    DataADO.GetInstant().UpdateBy<act_BaseObject>(this.srmBaseObjectReceive, this.BuVO);
                                    writeEventLog("3.1.3 Set McObject_ID = null");
                                }

                                //this.srmWorked(QueueStatus.QS_6);
                                
                                if (this.srmMcWorkReceive != null)
                                {
                                    this.srmMcWorkReceive.EventStatus = McWorkEventStatus.ACTIVE_WORKED;
                                    this.srmMcWorkReceive.ActualTime = DateTime.Now;
                                    this.srmMcWorkReceive.QueueStatus = 6;
                                    DataADO.GetInstant().UpdateBy<act_McWork>(this.srmMcWorkReceive, this.BuVO);
                                    writeEventLog("3.1.4 อัพเดตคิวงาน " + this.srmMcWorkReceive.ID + " Type " + this.srmMcWorkReceive.QueueType + "Status " + this.srmMcWorkReceive.QueueStatus);
                                }


                                this.StepTxt = "0.0";
                                break;
                            }

                            break;

                        case "3.2": // คิวย้ายรถ ->  QueueStatus = 3
                            if (this.McObj.DV_Pre_Status == 99)
                            {
                                if (this.srmMcWorkShuttle == null || this.srmBaseObjectShuttle == null)
                                {
                                    this.StepTxt = "0.0";
                                    break;
                                }

                                this.PostCommand(McCommandType.CM_99);
                                writeEventLog("3.2.1 จบงาน SRM");

                                if (this.srmBaseObjectShuttle != null)
                                {
                                    this.srmBaseObjectShuttle.McObject_ID = null;
                                    this.srmBaseObjectShuttle.ModifyTime = DateTime.Now; ;
                                    DataADO.GetInstant().UpdateBy<act_BaseObject>(this.srmBaseObjectShuttle, this.BuVO);
                                    writeEventLog("3.2.2 Set McObject_ID = null");
                                }

                                if (this.srmMcWorkShuttle!= null)
                                {
                                    this.srmMcWorkShuttle.EventStatus = McWorkEventStatus.ACTIVE_WORKED;
                                    this.srmMcWorkShuttle.ActualTime = DateTime.Now;
                                    this.srmMcWorkShuttle.QueueStatus = 4;
                                    DataADO.GetInstant().UpdateBy<act_McWork>(this.srmMcWorkShuttle, this.BuVO);
                                }
                                writeEventLog("3.2.3 จบงาน SRM ย้ายรถ");

                                this.StepTxt = "0.0";
                                break;
                            }
                            break;

                        case "3.3": // คิวย้ายของ -> QueueType = 4 , QueueStatus = 5
                            if (this.McObj.DV_Pre_Status == 99)
                            {
                                if (this.srmMcWorkPallet == null || this.srmBaseObjectPallet == null)
                                {
                                    this.StepTxt = "0.0";
                                    break;
                                }

                                this.PostCommand(McCommandType.CM_99);
                                writeEventLog("3.3.1 จบงาน SRM");

                                if (this.srmBaseObjectPallet != null)
                                {
                                    this.srmBaseObjectPallet.McObject_ID = null;
                                    this.srmBaseObjectPallet.ModifyTime = DateTime.Now; ;
                                    DataADO.GetInstant().UpdateBy<act_BaseObject>(this.srmBaseObjectPallet, this.BuVO);
                                    writeEventLog("3.3.2 Set McObject_ID = null");
                                }

                                //Check คิวงานเบิก Mix Lot
                                if (this.srmMcWorkPallet != null)
                                {
                                    var _mcWorkOut = DataADO.GetInstant().SelectBy<act_McWork>(
                                                                   ListKeyValue<string, object>
                                                                   .New("QueueType", QueueType.QT_2)
                                                                   //.Add("IOType", IOType.OUTBOUND)
                                                                   .Add("Mc_Ref_ID", this.srmMcWorkPallet.Mc_Ref_ID)
                                                                   , this.BuVO).FirstOrDefault();
                                    if (_mcWorkOut != null)
                                    {
                                        _mcWorkOut.ActualTime = DateTime.Now;
                                        _mcWorkOut.MixLot = "Y";
                                        DataADO.GetInstant().UpdateBy<act_McWork>(_mcWorkOut, this.BuVO);
                                        writeEventLog("3.3.3 ส่งงานให้คิวเบิก Mix Lot");
                                    }
                                }


                                if (this.srmMcWorkPallet != null)
                                {
                                    this.srmMcWorkPallet.EventStatus = McWorkEventStatus.ACTIVE_WORKED;
                                    this.srmMcWorkPallet.ActualTime = DateTime.Now;
                                    this.srmMcWorkPallet.QueueStatus = 9;
                                    DataADO.GetInstant().UpdateBy<act_McWork>(this.srmMcWorkPallet, this.BuVO);
                                }

                                writeEventLog("3.3.4 จบงาน SRM ย้ายของ");

                                
                                

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
        private act_McWork srmMcWorkReceive;
        private act_McWork srmMcWorkShuttle;
        private act_McWork srmMcWorkPallet;
        private act_BaseObject srmBaseObjectReceive;
        private act_BaseObject srmBaseObjectShuttle;
        private act_BaseObject srmBaseObjectPallet;
        private acs_McMaster srmMcMaster;
        private act_BuWork srmBuWork;        
        private acs_McMaster psMcMaster;
        private BaseMcRuntime shuMcRuntime;
        private BaseMcRuntime cvMcRuntime;
        private int[] moveShuttleQ = new int[] { 1, 4, 6, 7, 9 };
        private int inboundQ = 1;
        private int moveQ = 4;
        private int[] cvWorked = new int[] { 4, 14 };
        string mainStep;
        int _desLocCode = 0, _souLocCode = 0;
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

        private act_McWork getMcWorkReceive()
        {
            var srmMcWork = DataADO.GetInstant().SelectBy<act_McWork>(
                                      ListKeyValue<string, object>.New("QueueStatus", QueueStatus.QS_5)
                                      .Add("QueueType", QueueType.QT_1)
                                      //.Add("IOType", IOType.INBOUND)
                                      .Add("Status", 1)
                                        , this.BuVO).FirstOrDefault();

            return srmMcWork;
        }

        private act_McWork getMcWorkMoveShuttle()
        {
            var srmMcWork = DataADO.GetInstant().SelectBy<act_McWork>(
                                      ListKeyValue<string, object>.New("QueueStatus", QueueStatus.QS_3)
                                      //.Add("IOType", IOType.INBOUND)
                                      .Add("Status", 1)
                                      , this.BuVO).FirstOrDefault(x => moveShuttleQ.Contains(x.QueueType));
            return srmMcWork;
        }

        private act_McWork getMcWorkMovePallet()
        {
            var srmMcWork = DataADO.GetInstant().SelectBy<act_McWork>(
                                      ListKeyValue<string, object>.New("QueueStatus", QueueStatus.QS_5)
                                      .Add("QueueType", QueueType.QT_4)
                                      //.Add("IOType", IOType.INBOUND)
                                      .Add("Status", 1)
                                        , this.BuVO).FirstOrDefault();
            return srmMcWork;
        }
        #endregion
    }


}
