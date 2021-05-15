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
            this.mainStep = this.StepTxt.Substring(0, 1);

            switch (this.mainStep)
            {
                case "0":
                    //--------------ตรวจสอบคิวงาน
                    writeEventLog("0. ตรวจสอบคิวงาน");

                    // ---------0.1-------คิวเก็บ
                    this.srmMcWork = DataADO.GetInstant().SelectBy<act_McWork>(
                                      ListKeyValue<string, object>.New("QueueStatus", QueueStatus.QS_5)
                                      .Add("QueueType", QueueType.QT_1)
                                      .Add("IOType", IOType.INBOUND)
                                      .Add("Status", 1)
                                        , this.BuVO).FirstOrDefault();
                    

                    if (this.srmMcWork != null)
                    {
                        writeEventLog("0.1 คิวงานเก็บ");
                        this.StepTxt = "1.1";
                        break;
                    }


                    //---------0.2------- คิวย้ายรถ
                    this.srmMcWork = DataADO.GetInstant().SelectBy<act_McWork>(
                                      ListKeyValue<string, object>.New("QueueStatus", QueueStatus.QS_3)
                                      .Add("IOType", IOType.INBOUND)
                                      .Add("Status", 1)
                                      , this.BuVO).FirstOrDefault(x=> moveShuttleQ.Contains(x.QueueType) );

                    if (this.srmMcWork != null)
                    {
                        writeEventLog("0.2 คิวย้ายรถ");
                        this.StepTxt = "1.2";
                        break;
                    }

                    //--------0.3-------- คิวย้ายของ
                    this.srmMcWork = DataADO.GetInstant().SelectBy<act_McWork>(
                                      ListKeyValue<string, object>.New("QueueStatus", QueueStatus.QS_5)
                                      .Add("QueueType", QueueType.QT_4)
                                      .Add("IOType", IOType.INBOUND)
                                      .Add("Status", 1)
                                        , this.BuVO).FirstOrDefault();


                    if (this.srmMcWork != null)
                    {
                        writeEventLog("0.3 คิวย้ายของ");
                        this.StepTxt = "1.3";
                        break;
                    }

                    break;
                case "1":
                    //----------Check ต้นทางและปลายทาง พร้อมทำงาน
                    switch (this.StepTxt)
                    {
                        case "1.1":
                            //สั่ง SRM ย้ายพาเลท
                            var Locat_CV = DataADO.GetInstant().SelectBy<acs_Location>(
                                                 ListKeyValue<string, object>.New("ID", this.srmMcWork.Sou_Location_ID)   // location ของ cv
                                                 , this.BuVO).FirstOrDefault();

                            var cvName = Locat_CV != null ? Locat_CV.Name : null;
                            this.cvMcRuntime = Controller.McRuntimeController.GetInstant().GetMcRuntime(cvName);

                            var cvStatus = this.cvMcRuntime != null ? this.cvMcRuntime.McObj.DV_Pre_Status : 0;
                            writeEventLog("Converyor " + cvName + " status " + cvStatus);

                            this._souLocCode = 0;
                            this._desLocCode = 0;
                            this.boCode = null;
                            this.boQty = 0;

                            if ((this.cvMcRuntime != null && cvWorked.Contains(this.cvMcRuntime.McObj.DV_Pre_Status)) && this.McObj.DV_Pre_Status == 90)
                            {
                                var souLoc = this.StaticValue.GetLocation(this.srmMcWork.Sou_Location_ID);
                                var desLoc = this.StaticValue.GetLocation(this.srmMcWork.Des_Location_ID.GetValueOrDefault());
                                this._souLocCode = souLoc != null ? (souLoc.Code.Get2<int>()) : 0;
                                this._desLocCode = desLoc != null ? (desLoc.Code.Get2<int>() % 1000000) : 0;

                                this.srmBaseObject = BaseObjectADO.GetInstant().GetByID(this.srmMcWork.BaseObject_ID, this.BuVO);
                                this.boCode = this.srmBaseObject != null ? this.srmBaseObject.Code : null;
                                this.boQty = this.srmBaseObject != null ? this.srmBaseObject.SkuQty.Get2<int>() : 0;

                                writeEventLog("เตรียมย้าย Pallet " + this.boCode + " จาก" + this._souLocCode + " ไปยัง " + this._desLocCode);

                                if (this._souLocCode != 0 && this._desLocCode != 0 && !String.IsNullOrWhiteSpace(this.boCode))
                                {
                                    this.StepTxt = "2.1";
                                    break;
                                }

                                


                            }
                            break;

                        case "1.2":
                            // ------------ สั่ง SRM ย้าย Shuttle
                            if (this.McObj.DV_Pre_Status == 90)
                            {
                                writeEventLog("สั่งเครนย้าย Shuttle " + this.srmMcWork.Rec_McObject_ID);

                                this._souLocCode = 0;
                                this._desLocCode = 0;

                                var desLoc = this.StaticValue.GetLocation(this.srmMcWork.Des_Location_ID.GetValueOrDefault());
                                var _mcShuttle = DataADO.GetInstant().SelectBy<act_McObject>("McMaster_ID", this.srmMcWork.Rec_McObject_ID.GetValueOrDefault(), null).FirstOrDefault();
                                
                                if (desLoc != null )
                                {
                                    this._desLocCode = desLoc != null ? (desLoc.Code.Get2<int>() % 1000000) : 0;
                                    this._desLocCode += 2000000;
                                }

                                if (_mcShuttle != null)
                                {
                                    var STLoc = this.StaticValue.GetLocation(_mcShuttle.Cur_Location_ID.Value);
                                    if (STLoc != null)
                                    {
                                        this._souLocCode = STLoc.Code.Get2<int>() % 1000000;
                                        this._souLocCode += 2000000;
                                    }
                                }

                                writeEventLog("เตรียมย้าย Shuttle จาก" + _souLocCode + " ไปยัง " + _desLocCode);

                                if (this._desLocCode != 0 && this._souLocCode != 0)
                                {
                                    this.StepTxt = "2.2";
                                    break;
                                }


                                
                            }

                            break;

                        case "1.3":
                            // ------------ สั่ง SRM ย้าย Pallet กรณี คิวย้าย
                            if (this.McObj.DV_Pre_Status == 90)
                            {
                                this.srmBaseObject = BaseObjectADO.GetInstant().GetByID(this.srmMcWork.BaseObject_ID, this.BuVO);
                                this.boCode = this.srmBaseObject != null ? this.srmBaseObject.Code : null;
                                this.boQty = this.srmBaseObject != null ? this.srmBaseObject.SkuQty.Get2<int>() : 0;

                                writeEventLog("สั่งเครนย้าย Pallet " + this.boCode);

                                this._souLocCode = 0;
                                this._desLocCode = 0;


                                var souLoc = this.StaticValue.GetLocation(this.srmMcWork.Sou_Location_ID);
                                var desLoc = this.StaticValue.GetLocation(this.srmMcWork.Des_Location_ID.GetValueOrDefault());
                                

                                if (souLoc != null)
                                {
                                    this._souLocCode = souLoc != null ? (souLoc.Code.Get2<int>()) : 0;
                                }

                                if (desLoc != null)
                                {
                                    this._desLocCode = desLoc != null ? (desLoc.Code.Get2<int>() % 1000000) : 0;
                                }

                                writeEventLog("เตรียมย้าย Pallet จาก" + _souLocCode + " ไปยัง " + _desLocCode);

                                if (this._desLocCode != 0 && this._souLocCode != 0 && !String.IsNullOrWhiteSpace(this.boCode))
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
                        case "2.1":
                            //สั่ง SRM ย้ายพาเลท

                            if ((this.cvMcRuntime != null && cvWorked.Contains(this.cvMcRuntime.McObj.DV_Pre_Status)) && this.McObj.DV_Pre_Status == 90)
                            {
                                writeEventLog("สั่งเครนเก็บพาเลท " + this.boCode);

                                // สั่ง SRM ย้าย
                                this.PostCommand(McCommandType.CM_1, this._souLocCode, this._desLocCode, 1, this.boCode, this.boQty, () => this.srmWorking());

                                this.StepTxt = "3.1";
                                break;


                            }
                            break;

                        case "2.2":
                            // ------------ สั่ง SRM ย้าย Shuttle
                            if (this.McObj.DV_Pre_Status == 90)
                            {
                                if (this._desLocCode != 0 && this._souLocCode != 0)
                                {
                                    writeEventLog("สั่งเครนย้าย Shuttle");

                                    // สั่ง SRM ย้าย Shuttle
                                    this.PostCommand(McCommandType.CM_1,
                                       _souLocCode,
                                       _desLocCode,
                                        3, "0000000000", 1000, null, () => this.srmWorking());

                                    this.StepTxt = "3.2";
                                    break;
                                }



                            }

                            break;

                        case "2.3":
                            // ------------ สั่ง SRM ย้าย Pallet กรณี คิวย้าย
                            if (this.McObj.DV_Pre_Status == 90)
                            {
                                
                                if (this._desLocCode != 0 && this._souLocCode != 0 && !String.IsNullOrWhiteSpace(this.boCode))
                                {
                                    writeEventLog("สั่ง SRM ย้ายพาเลท " + this.boCode);

                                    // สั่ง SRM ย้ายพาเลท
                                    this.PostCommand(McCommandType.CM_1, this._souLocCode, this._desLocCode, 1, this.boCode, this.boQty
                                    , () => this.srmWorking());

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
                        case "3.1":
                            if (this.McObj.DV_Pre_Status == 99)
                            {
                                this.PostCommand(McCommandType.CM_99, (mc) =>
                                {
                                    writeEventLog("จบงานเครน");

                                    return LoopResult.Break;
                                }, () => this.srmWorked(QueueStatus.QS_6));

                                if(this.cvMcRuntime != null)
                                {
                                    writeEventLog("จบงาน Conveyor");
                                    this.cvMcRuntime.PostCommand(McCommandType.CM_99);
                                }
                                
                                this.StepTxt = "0.0";
                            }

                            break;

                        case "3.2":
                            if (this.McObj.DV_Pre_Status == 99)
                            {
                                this.PostCommand(McCommandType.CM_99, (mc) =>
                                {
                                    writeEventLog("จบงาน SRM ย้ายรถ");

                                    return LoopResult.Break;
                                }, () => this.srmWorked(QueueStatus.QS_4));

                                this.StepTxt = "0.0";
                            }
                            break;

                        case "3.3":
                            if (this.McObj.DV_Pre_Status == 99)
                            {
                                this.PostCommand(McCommandType.CM_99, (mc) =>
                                {
                                    writeEventLog("จบงาน SRM ย้ายของ");

                                    return LoopResult.Break;
                                }, () => this.srmWorked(QueueStatus.QS_9));

                                writeEventLog("ส่งงานให้คิวเบิก");
                                this.srmMove2Outbound();

                                this.StepTxt = "0.0";
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
        private act_McWork srmMcWork;
        private acs_McMaster srmMcMaster;
        private act_BuWork srmBuWork;
        private act_BaseObject srmBaseObject;
        private acs_McMaster psMcMaster;
        private BaseMcRuntime shuMcRuntime;
        private BaseMcRuntime cvMcRuntime;
        private int[] moveShuttleQ = new int[] { 1, 4, 6, 7, 9 };
        private int inboundQ = 1;
        private int moveQ = 4;
        private int[] cvWorked = new int[] { 4, 14 };
        string mainStep;
        int _desLocCode = 0, _souLocCode = 0;
        string boCode = null;
        int boQty = 0;
        #endregion

        #region Methods
        private void writeEventLog(string _msg)
        {
            string msg = " > Working step " + this.StepTxt + " | Message =" + _msg;

            DisplayController.Events_Write(this.Code, msg);
        }

        private void srmWorking()
        {
            if (this.srmMcWork != null)
            {
                this.srmMcWork.EventStatus = McWorkEventStatus.ACTIVE_WORKING;
                this.srmMcWork.ActualTime = DateTime.Now;
                DataADO.GetInstant().UpdateBy<act_McWork>(this.srmMcWork, this.BuVO);
            }
            
        }

        private void srmWorked(QueueStatus qs)
        {
            if (this.srmMcWork != null)
            {
                this.srmMcWork.EventStatus = McWorkEventStatus.ACTIVE_WORKED;
                this.srmMcWork.ActualTime = DateTime.Now;
                this.srmMcWork.QueueStatus = (int)qs;
                DataADO.GetInstant().UpdateBy<act_McWork>(this.srmMcWork, this.BuVO);
            }
                
        }

        private void srmMove2Outbound()
        {
            if(this.srmMcWork != null)
            {
                var _mcWorkOut = DataADO.GetInstant().SelectBy<act_McWork>(
                                               ListKeyValue<string, object>
                                               .New("QueueType", QueueType.QT_2)
                                               .Add("IOType", IOType.OUTBOUND)
                                               .Add("Mc_Ref_ID", this.srmMcWork.Mc_Ref_ID)
                                               , this.BuVO).FirstOrDefault();
                if (_mcWorkOut != null)
                {
                    _mcWorkOut.ActualTime = DateTime.Now;
                    _mcWorkOut.MixLot = "Y";
                    DataADO.GetInstant().UpdateBy<act_McWork>(_mcWorkOut, this.BuVO);
                }
            }
        }
        #endregion
    }


}
