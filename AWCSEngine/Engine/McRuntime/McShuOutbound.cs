using System;
using System.Collections.Generic;
using System.Text;
using ADO.WCSDB;
using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using AMWUtil.Common;
using AWCSEngine.Controller;
using System.Linq;
using System.IO;

namespace AWCSEngine.Engine.McRuntime
{
    public class McShuOutbound : BaseMcRuntime
    {
         
        act_McWork McWork_out;
        acs_McMaster MC_MASTER_sh;
        int Step_P = 0;
        int iRou = 0;
        string retCOMM = "N";

        public McShuOutbound(acs_McMaster mcMst) : base(mcMst)
        {
        }

        protected override McTypeEnum McType => McTypeEnum.SHU;

        protected override void OnEnd()
        { 
            /// throw new NotImplementedException();
        }
        
        protected override void OnRun()
        {
           /* iRou++;
            var path = @"D:\LOGAPP.txt";

            string text = "-"+ iRou.ToString() + "--" + DateTime.Now.ToString();
            File.AppendAllText(path, text);
         */

            MC_MASTER_sh = DataADO.GetInstant().SelectBy<acs_McMaster>(
                    ListKeyValue<string, object>.New("ID", this.McObj.McMaster_ID)
                    , this.BuVO).FirstOrDefault();   ////Status_Queue
           
           // var SHU_Out1 = Controller.McRuntimeController.GetInstant().GetMcRuntime("SHU5");  /// เดี๋ยวต้องเปลี่ยนเป็น ID  


            // Check % แบต
            /// var iStat = this.McObj.DV_Pre_Status;
            ///  Step_P = 2;   เอาไว้ Test
            switch (Step_P)
            {
                case 0:
                    this.McWork_out = DataADO.GetInstant().SelectBy<act_McWork>(
                    ListKeyValue<string, object>.New("QueueStatus", 1).Add("Rec_McObject_ID", this.McObj.McMaster_ID)
                    .Add("QueueType", 2)
                    , this.BuVO).FirstOrDefault();   ////Status_Queue 
                    if (this.McWork_out != null)  /// มีคิวงาน
                    {
                        //เช็คแบ็ต ถ้า 80 ไม่ให้ไปต่อ
                        var SHU_Out = Controller.McRuntimeController.GetInstant().GetMcRuntime(MC_MASTER_sh.Code);  /// เดี๋ยวต้องเปลี่ยนเป็น ID 
                       // var SHU_Out = Controller.McRuntimeController.GetInstant().GetMcRuntime("SHU19");  /// เดี๋ยวต้องเปลี่ยนเป็น ID  
                       // var SHU_Out = Controller.McRuntimeController.GetInstant().GetMcRuntime("SHU5");  /// เดี๋ยวต้องเปลี่ยนเป็น ID  
                        if (SHU_Out.McObj.DV_Pre_Status == 80) //// ไม่มีแบต
                        {
                            Step_P = 0;
                        }
                        else
                        {
                            if (this.McObj.DV_Pre_Status == 82 && this.McObj.DV_Pre_Zone != 4)
                            {
                                if (SHU_Out.PostCommand(McCommandType.CM_1, ListKeyValue<string, object>   /// 12 HOME หลัง
                                    .New("Set_SouLoc", SHU_Out.Cur_Location.Code.Get2<int>() % 1000000)
                                           .Add("Set_ShtDi", 2)))  /// HOME Zone out
                                {
                                    // StepTxt = "2.1";
                                    //DisplayController.Events_Write($"{this.Code} > exec 2.1");
                                }
                                Step_P = 1;

                            }
                            else if (this.McObj.DV_Pre_Status == 90)
                            { Step_P = 1;  }
                            
                        }
                        
                    }
                    break;
                case 1:    ////เช็ค Shuttle ว่างมั้ย และ ไม่มีใครจอง SHU งานอยู่ 
                    if (this.McObj.DV_Pre_Status == 90 && this.McObj.DV_Pre_Zone != 1 && this.McObj.DV_Pre_Zone != 4)
                    {
                        this.McWork_out.QueueStatus = 2;
                        DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork_out, this.BuVO); ///UPDATE QueueStatus =2
                        Step_P = 2;
                    }
                    else  /// สั่งกลับ HOME 
                    {
                        ///SHU_Out.PostCommand(McCommandType.CM_12)   ///12	กลับ Home (ด้านหลัง)  
                    } 
                    break;
                case 2:    ////เช็คว่า Shuttle อยู่ใน Location ที่จะเบิก ตรงกับ Q งาน หรือไม่
                    // location queue งาน
                    ///this.McWork_out.BaseObject_ID
                    var LoCat_Q = DataADO.GetInstant().SelectBy<acs_Location>("ID", this.McWork_out.Cur_Location_ID, null).FirstOrDefault();
                    // location Shu 
                    var Shu_Obj = DataADO.GetInstant().SelectBy<act_McObject>("McMaster_ID", this.McObj.McMaster_ID, null).FirstOrDefault();
                    // Shu_Obj.BaseObject_ID 
                    var LoCat_Sh = DataADO.GetInstant().SelectBy<acs_Location>("ID", Shu_Obj.Cur_Location_ID, null).FirstOrDefault();

                    if (LoCat_Q != null && LoCat_Sh != null)
                    {

                        string xxx = LoCat_Q.Code.Substring(3, 3) + LoCat_Sh.Code.Substring(3, 3);
                        string xxx2 = LoCat_Q.Code.Substring(6, 3) + LoCat_Sh.Code.Substring(6, 3);

                        /// เช็ค bay และ Level เท่ากันมั้ย  ถ้าเท่า แสดงว่า Shuttle อยู่ตรง location จะเบิก
                        if (
                               LoCat_Q.Code.Substring(3, 3) == LoCat_Sh.Code.Substring(3, 3) //// BAY
                            && LoCat_Q.Code.Substring(6, 3) == LoCat_Sh.Code.Substring(6, 3)////  LEVEL
                          )
                        {
                            ///// สั่งทำงาน Load ของ command 1
                              var SHU_Out = Controller.McRuntimeController.GetInstant().GetMcRuntime(MC_MASTER_sh.Code);  /// เดี๋ยวต้องเปลี่ยนเป็น ID 
                           // var SHU_Out = Controller.McRuntimeController.GetInstant().GetMcRuntime("SHU19");  /// เดี๋ยวต้องเปลี่ยนเป็น ID 
                          ///  var SHU_Out = Controller.McRuntimeController.GetInstant().GetMcRuntime("SHU5");
                            if (SHU_Out.McObj.DV_Pre_Status == 82)
                            {
                                if (SHU_Out.PostCommand(McCommandType.CM_12, ListKeyValue<string, object>   /// 12 HOME หลัง
                                    .New("Set_SouLoc", SHU_Out.Cur_Location.Code.Get2<int>() % 1000000)
                                    .Add("Set_ShtDi", 2)))  /// HOME Zone out
                                {
                                    // StepTxt = "2.1";
                                    //DisplayController.Events_Write($"{this.Code} > exec 2.1");
                                }
                            }
                            //2.2 รถ สถานะพร้อมทำงาน แต่รถไม่อยู่ที่ home / สั่งกลับ home
                            else if (SHU_Out.McObj.DV_Pre_Status == 90 && SHU_Out.McObj.DV_Pre_Zone != 3)  
                            {
                                if (SHU_Out.PostCommand(McCommandType.CM_12))  ///12	กลับ Home (ด้านหลัง) 
                                {
                                    //StepTxt = "2.2";
                                    // DisplayController.Events_Write($"{this.Code} > exec 2.2");
                                }
                            }
                            //2.3 รถ สถานะพร้อมทำงาน และอยู่ home ด้านหน้า / รับงานให้ SRM
                            else if (SHU_Out.McObj.DV_Pre_Status == 90 && SHU_Out.McObj.DV_Pre_Zone == 3 && retCOMM == "N")
                            {
                                //// สั่งไปหยิบของ
                                //SHU_Out.PostCommand(McCommandType.CM_58); ////SHU_Out  58	เบิกพาเลทไปยังฝั่ง ด้านหลัง
                                retCOMM = "Y";

                                // UPDATE  4 ให้คิวงาน  Shuttle  ไปหยิบของมาวางไว้ที่ Standby แล้ว
                           
                                
                                if (SHU_Out.PostCommand(McCommandType.CM_58, (SHU) =>
                                {

                                    if (SHU.McObj.DV_Pre_Status == 99)
                                    {
                                        SHU.PostCommand(McCommandType.CM_99, (mc) =>
                                        {
                                            
                                            // UPDATE  4 ให้คิวงาน  Shuttle  ไปหยิบของมาวางไว้ที่ Standby แล้ว

                                            if (this.McWork_out == null)
                                            {
                                                this.McWork_out = DataADO.GetInstant().SelectBy<act_McWork>(
                                                ListKeyValue<string, object>.New("QueueStatus", 4).Add("Rec_McObject_ID", this.McObj.McMaster_ID)
                                                .Add("QueueType", 2)
                                                , this.BuVO).FirstOrDefault();
                                            }                                             

                                            this.McWork_out.QueueStatus = 4;
                                            DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork_out, this.BuVO); ///UPDATE QueueStatus =4  ///เพื่อ SRM มองเห็นคิวงาน
                                           
                                            
                                            Step_P = 0;
                                            retCOMM = "N";
                                            return LoopResult.Break;
                                        });
                                    }
                                    return LoopResult.Continue;
                                }
                             
                                )) { 
                                
                                }
                                  
                            }

/*
                            else if (SHU_Out.McObj.DV_Pre_Status == 99)
                            {
                                SHU_Out.PostCommand(McCommandType.CM_99, (mc) =>
                                {
                                    retCOMM = "N";
                                    // UPDATE  4 ให้คิวงาน  Shuttle  ไปหยิบของมาวางไว้ที่ Standby แล้ว
                                    this.McWork_out.QueueStatus = 4;
                                    DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork_out, this.BuVO); ///UPDATE QueueStatus =4  ///เพื่อ SRM มองเห็นคิวงาน
                                    Step_P = 0;
                                    return LoopResult.Break;
                                });
                            }

                            */

                           

                        }
                        else  //// สั่งย้าย
                        {
                            var SHU_Out = Controller.McRuntimeController.GetInstant().GetMcRuntime(MC_MASTER_sh.Code);
                            //  var SHU_Out = Controller.McRuntimeController.GetInstant().GetMcRuntime("SHU19");
                            // var SHU_Out = Controller.McRuntimeController.GetInstant().GetMcRuntime("SHU5");
                            //1.1 รถว่าง พร้อมทำงาน แต่ zone ไม่ถูกต้อง
                            if (   SHU_Out.McObj.DV_Pre_Status == 90 && SHU_Out.McObj.DV_Pre_Zone != 4) 
                            {
                                if (SHU_Out.PostCommand(McCommandType.CM_72)) ////72	กลับตำแหน่ง Standby ฝั่ง (ด้านหลัง)
                                {
                                    //StepTxt = "1.1";
                                    //DisplayController.Events_Write($"{this.Code} > exec 1.1");
                                }
                            }
                            //1.2 รถว่าง พร้อมทำงาน และ zone ถูกต้อง / สั่งปิดเครื่อง
                            else if (  SHU_Out.McObj.DV_Pre_Status == 90 && SHU_Out.McObj.DV_Pre_Zone == 4)
                            {
                                if (SHU_Out.PostCommand(McCommandType.CM_60, (mc) => {
                                    if (mc.IsOnline && mc.EventStatus == McObjectEventStatus.DONE)
                                    {
                                        return LoopResult.Break;
                                    }
                                    return LoopResult.Continue;
                                }))
                                {
                                    //StepTxt = "1.2";
                                    //DisplayController.Events_Write($"{this.Code} > exec 1.2");
                                }
                            }
                            //1.3 รถว่าง รถถูกปิด / สั่งเครนเตรียมย้าย
                            else if ( SHU_Out.McObj.DV_Pre_Status == 82 && SHU_Out.McObj.DV_Pre_Zone == 4 )
                            {
                                ///99  จบงาน 
                                // UPDATE  3 Shuttle  ต้องการย้าย Location 
                                this.McWork_out.QueueStatus = 3;
                                DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork_out, this.BuVO); ///UPDATE QueueStatus =2

                                Step_P = 0;
                            }

                        }

                    }
                    break;
               
                          

            }


        }

        protected override void OnStart()
        {
            Step_P = 0;
        }
    }
}
