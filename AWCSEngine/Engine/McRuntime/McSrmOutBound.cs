using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ADO.WCSDB;

namespace AWCSEngine.Engine.McRuntime
{
    public class McSrmOutBound : BaseMcRuntime
    {
        act_McWork McWork_out;
        int Step_P = 0;
        int Step_P_sub = 0;
        int Step_P_sub_s = 0;
        acs_McMaster MC_MASTER_sh;
        acs_Location cvy_location;
        string End_cvy = "";
        string End_cvyName = "";
        int End_id = 0;

        string retComm = "N";

        public McSrmOutBound(acs_McMaster mcMst) : base(mcMst)
        {
        }

        protected override McTypeEnum McType => McTypeEnum.SRM;

        protected override void OnEnd()
        {
            
        }

        protected override void OnRun()
        {

            /// เปิด Gra CVY connect
            var cvy_Out_CHK = Controller.McRuntimeController.GetInstant().GetMcRuntime("GC8-10");
            if (cvy_Out_CHK.McObj.DV_Pre_Status < 1  || cvy_Out_CHK.McObj.DV_Pre_Status == 255)
            {
                //  cvy_Out_CHK.PostCommand(McCommandType.CM_1);   ///// บอก CVY ว่า จะมีของไปลง
                cvy_Out_CHK.PostCommand(McCommandType.CM_1, ListKeyValue<string, object>   /// 2 เตรียม รับ pallet  
                                    .New("Set_SouLoc", 48)
                                    .Add("Set_DesLoc", 47)
                                    .Add("Set_Unit", 2)
                                    .Add("Set_PalletID", "A00000001")
                                    .Add("Set_Weigh", 1000)
                                    .Add("Set_Comm", 1));
            }
              
            switch (Step_P)
            {
                case 0:   ///// มีคิวงานมั้ย มองหา Step mcwork 3 4 ชาตแบต
                          ////  Get คิวงาน แล้ว
                    ///
                    this.McWork_out = DataADO.GetInstant().SelectBy<act_McWork>(
                                       ListKeyValue<string, object>.New("QueueStatus", 4).Add("QueueType", 2)
                                                , this.BuVO).FirstOrDefault();   //// 4	Shuttle  ต้องการ Load

                    if (this.McWork_out != null)  /// มีคิวงานเบิก
                    {
                        Step_P = 1;
                        Step_P_sub = 2; ///   4    Shuttle ไปหยิบของมาวางไว้ที่ Standby แล้ว
                        break;
                    }


                    this.McWork_out = DataADO.GetInstant().SelectBy<act_McWork>(
                    ListKeyValue<string, object>.New("QueueStatus", 3).Add("QueueType", 2)
                             , this.BuVO).FirstOrDefault();   //// 3 	Shuttle  ต้องการย้าย Location
                    if (this.McWork_out != null)  /// มีคิวงาน
                    {
                        Step_P = 1;
                        Step_P_sub = 1; ///   3    Shuttle ต้องการย้าย Location
                        break;
                    }

                    /// 
                    break;
                case 1:   ///// มีคิวงาน 
                    switch (Step_P_sub)
                    {
                        case 1:

                            //// ดู ว่า Shutle ปิดเครื่องยัง และ อยู่ Zone 4 หรือไม่
                            MC_MASTER_sh = DataADO.GetInstant().SelectBy<acs_McMaster>(
                           ListKeyValue<string, object>.New("ID", this.McWork_out.Rec_McObject_ID)   ////Rec_McObject_ID = ID ของ shut ที่จองงานนี้
                           , this.BuVO).FirstOrDefault();   ////Status_Queue

                            if (this.MC_MASTER_sh != null)  /// มี 
                            {
                                ///// สั่งทำงาน Load ของ command 1
                                var SHU_Out = Controller.McRuntimeController.GetInstant().GetMcRuntime(MC_MASTER_sh.Code);  /// เดี๋ยวต้องเปลี่ยนเป็น ID 
                                // var SHU_Out = Controller.McRuntimeController.GetInstant().GetMcRuntime("SHU19");  /// เดี๋ยวต้องเปลี่ยนเป็น ID 
                                // var SHU_Out = Controller.McRuntimeController.GetInstant().GetMcRuntime("SHU5");
                                if (SHU_Out.McObj.DV_Pre_Status == 82 && SHU_Out.McObj.DV_Pre_Zone == 4
                                    && this.McObj.DV_Pre_Status == 90 && retComm == "N"
                                    )  //// ปิดเครื่องยัง  และ Zone ถูก 4
                                {
                                    var _srm_souLocCode = SHU_Out.Cur_Location.Code.Get2<int>() % 1000000;
                                    _srm_souLocCode += 47000000;
                                    var xxx = this.McObj.Cur_Location_ID.Value;
                                    //      var desLoc = this.StaticValue.GetLocation(this.McWork4Receive.Des_Location_ID.Value);
                                    var desLoc = this.StaticValue.GetLocation(this.McWork_out.Cur_Location_ID);


                                    var _srm_desLocCode = desLoc.Code.Get2<int>() % 1000000;
                                    _srm_desLocCode += 47000000;

                                    retComm = "Y";

                                    if (this.PostCommand(McCommandType.CM_1, _srm_souLocCode, _srm_desLocCode, 3, "0000000000", 1000, (srm) =>
                                    {
                                        if (srm.McObj.DV_Pre_Status == 99)
                                        {
                                            //DisplayController.Events_Write($"{this.Code} > exec 1.3-99");
                                            SHU_Out.McObj.Cur_Location_ID = this.StaticValue.GetLocation(_srm_desLocCode.ToString("000000000")).ID.Value;
                                            var Shu_Obj = DataADO.GetInstant().SelectBy<act_McObject>("McMaster_ID", this.McWork_out.Rec_McObject_ID, null).FirstOrDefault();
                                            Shu_Obj.Cur_Location_ID = this.StaticValue.GetLocation(_srm_desLocCode.ToString("000000000")).ID.Value;
                                            DataADO.GetInstant().UpdateBy<act_McObject>(Shu_Obj, this.BuVO);  /// UPDATE ID LOCATION ให้ Shu
                                            //_mcShuFreeID_wh8_in = null;
                                            this.PostCommand(McCommandType.CM_99);

                                            retComm = "N";

                                            Step_P = 3;
                                            return LoopResult.Break;
                                        }
                                        return LoopResult.Continue;
                                    }))
                                    {

                                        // StepTxt = "1.3";
                                        //DisplayController.Events_Write($"{this.Code} > exec 1.3");
                                    }
                                }
                                else
                                {
                                    //// ต้องใส่เช็ค 99 ตรงนี้ ด้วย 


                                }

                            }
                            break;
                        case 2:
                            MC_MASTER_sh = DataADO.GetInstant().SelectBy<acs_McMaster>(
                           ListKeyValue<string, object>.New("ID", this.McWork_out.Rec_McObject_ID)   ////Rec_McObject_ID = ID ของ shut ที่จองงานนี้
                           , this.BuVO).FirstOrDefault();   ////Status_Queue


                            var SHU_Out2 = Controller.McRuntimeController.GetInstant().GetMcRuntime(MC_MASTER_sh.Code);
                            //var SHU_Out2 = Controller.McRuntimeController.GetInstant().GetMcRuntime("SHU19");  /// เดี๋ยวต้องเปลี่ยนเป็น ID 
                            //var SHU_Out2 = Controller.McRuntimeController.GetInstant().GetMcRuntime("SHU5");  /// เดี๋ยวต้องเปลี่ยนเป็น ID 

                            if (SHU_Out2.McObj.DV_Pre_Zone != 4 && this.McObj.DV_Pre_Status == 90)  //// Zone ถูก 4
                            {
                                End_cvy = "";
                                End_cvyName = "";
                                End_id = 0;

                                DataADO.GetInstant().SelectBy<acs_Location>(
                                ListKeyValue<string, object>.New("Area_ID", this.McWork_out.Des_Area_ID)   ////Rec_McObject_ID = ID ของ shut ที่จองงานนี้
                                , this.BuVO).OrderBy(x => x.Code).ToList().ForEach(x2 =>
                                {
                                    var cvy_out = Controller.McRuntimeController.GetInstant().GetMcRuntime(x2.Name);  /// เดี๋ยวต้องเปลี่ยนเป็น ID 
                                    //   if (cvy_out.McObj.DV_Pre_Status == 1 || cvy_out.McObj.DV_Pre_Status == 2 || cvy_out.McObj.DV_Pre_Status == 8)
                                    if (cvy_out.McObj.DV_Pre_Status == 1 || cvy_out.McObj.DV_Pre_Status == 8)
                                    {
                                        End_cvy = x2.Code;   //// code cvy
                                        End_cvyName = x2.Name; //name cvy
                                        End_id = Convert.ToInt32(x2.ID);
                                        return;
                                    }

                                }); ////Status_Queue
                                    //// เช็ค CVY ปลายทางว่างมั้ย ที่จะลงได้ Sttaus = 1 ว่างไม่มีของ ,8 ว่างมีของ  ถ้าว่าง สั่งลง
                                if (End_cvy != "")
                                {
                                    var Set_location = DataADO.GetInstant().SelectBy<act_BaseObject>("ID", this.McWork_out.BaseObject_ID, null).FirstOrDefault();

                                    var souLocCode = this.StaticValue.GetLocation(this.McWork_out.Cur_Location_ID);

                                    var _srm_souLocCode = souLocCode.Code.Get2<int>() % 1000000;
                                    _srm_souLocCode += 47000000;

                                    var _srm_ENLocCode = End_cvy.Get2<int>() % 1000000;
                                    _srm_ENLocCode += 48000000;   //// cvy ปลายทาง
                                    var cvy_Out = Controller.McRuntimeController.GetInstant().GetMcRuntime(End_cvyName);

                                    /// UPDAT CVY ให้   McWork
                                    this.McWork_out.Des_Location_ID = End_id;
                                    DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork_out, this.BuVO); ///UPDATE QueueStatus =1


                                    cvy_Out.PostCommand(McCommandType.CM_2, ListKeyValue<string, object>   /// 2 เตรียม รับ pallet  
                                    .New("Set_SouLoc", 48)
                                    .Add("Set_DesLoc", 47)
                                    .Add("Set_Unit", 2)
                                    .Add("Set_PalletID", "A000000020")
                                    .Add("Set_Weigh", 1000)
                                    .Add("Set_Comm", 2)
                                            );   ///// บอก CVY ว่า จะมีของไปลง
                                    //Set_SouLoc={0}&SET_DseLoc={1}&Set_Unit={2}&Set_PalletID={3}&Set_Weigh=1500&Set_Comm=2
                                    Step_P = 3;
                                }


                                /// 
                            }
                            else //// ถ้า SHU อยู่ Zone 4 ย้ายออก
                            {
                                if (SHU_Out2.McObj.DV_Pre_Status == 82)
                                {
                                    if (SHU_Out2.PostCommand(McCommandType.CM_12, ListKeyValue<string, object>   /// 12 HOME หลัง
                                    .New("Set_SouLoc", SHU_Out2.Cur_Location.Code.Get2<int>() % 1000000)
                                        .Add("Set_ShtDi", 1)))
                                    {
                                        // StepTxt = "2.1";
                                        //DisplayController.Events_Write($"{this.Code} > exec 2.1");
                                    }
                                }
                                //2.2 รถ สถานะพร้อมทำงาน แต่รถไม่อยู่ที่ home / สั่งกลับ home
                                else if (SHU_Out2.McObj.DV_Pre_Status == 90 && SHU_Out2.McObj.DV_Pre_Zone != 3)
                                {
                                    if (SHU_Out2.PostCommand(McCommandType.CM_12))  ///12	กลับ Home (ด้านหลัง) 
                                    {
                                        //StepTxt = "2.2";
                                        // DisplayController.Events_Write($"{this.Code} > exec 2.2");
                                    }
                                }
                            }

                            break;
                        case 3:/// ชาตแบต

                            break;
                    }
                    break;
                case 3:   ///// Confrom Queue 
                    switch (Step_P_sub)
                    {
                        case 1:
                            var SHU_Out = Controller.McRuntimeController.GetInstant().GetMcRuntime(MC_MASTER_sh.Code);  /// เดี๋ยวต้องเปลี่ยนเป็น ID 
                            // var SHU_Out = Controller.McRuntimeController.GetInstant().GetMcRuntime("SHU19");  /// เดี๋ยวต้องเปลี่ยนเป็น ID 
                            //  var SHU_Out = Controller.McRuntimeController.GetInstant().GetMcRuntime("SHU5");  /// เดี๋ยวต้องเปลี่ยนเป็น ID 

                            //// เปิดเครื่อง SHU 
                            //เปิดเครื่อง
                            if (SHU_Out.McObj.DV_Pre_Status == 82) //// 82 = ปิดอยู่
                            {
                                SHU_Out.PostCommand(McCommandType.CM_1, ListKeyValue<string, object>
                                    .New("Set_SouLoc", SHU_Out.Cur_Location.Code.Get2<int>() % 1000000)
                                    .Add("Set_ShtDi", 2)
                                    .Add("Set_Row", 1249584)
                                    .Add("Set_Comm", 1)
                                    , null);
                            }
                            //// UPDATE QueueStatus  ให้เป็น 1
                            this.McWork_out.QueueStatus = 1;
                            DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork_out, this.BuVO); ///UPDATE QueueStatus =1

                            Step_P = 0;
                            Step_P_sub = 0;
                            Step_P_sub_s = 0;

                            break;
                        case 2:
                            /// 2. อ่าน CVY ว่า ได้ Confrim พร้อมให้ของไปลงยัง
                            var cvy_Out = Controller.McRuntimeController.GetInstant().GetMcRuntime(End_cvyName);
                            switch (Step_P_sub_s)
                            {
                                case 0:
                                    ///1/4/2021 ช้าต้องค่อยดู KepServer เป็น 2 แก้ไขเงื่อนไข 1 ชั่วคราว
                                    if (cvy_Out.McObj.DV_Pre_Status == 2 && this.McObj.DV_Pre_Status == 90 && retComm == "N")
                                    {
                                        var Locat_ST = DataADO.GetInstant().SelectBy<acs_Location>(
                                           ListKeyValue<string, object>.New("ID", this.McWork_out.Cur_Location_ID)   // location ของ สินค้า
                                           , this.BuVO).FirstOrDefault();

                                        var _srm_STLocCode = Locat_ST.Code.ToString().Get2<int>() % 1000000; //// ต้นทาง
                                        _srm_STLocCode += 47000000;

                                        var _srm_ENLocCode = End_cvy.Get2<int>() % 1000000;
                                        _srm_ENLocCode += 48000000;   //// cvy ปลายทาง

                                        var baseObj = ADO.WCSDB.BaseObjectADO.GetInstant().GetByID(this.McWork_out.BaseObject_ID, this.BuVO); /// Pallet


                                        retComm = "Y";
                                        if (this.PostCommand(McCommandType.CM_1, _srm_STLocCode, _srm_ENLocCode, 2, "A000000000", 1000, (srm) =>
                                        {
                                            if (srm.McObj.DV_Pre_Status > 10)
                                            {

                                                Step_P_sub_s = 1;

                                                retComm = "N";
                                                return LoopResult.Break;
                                            }
                                            return LoopResult.Continue;
                                        }))
                                        {

                                            // StepTxt = "1.3";
                                            //DisplayController.Events_Write($"{this.Code} > exec 1.3");
                                        }
                                        /*
                                                                                //   if (this.PostCommand(McCommandType.CM_2, _srm_STLocCode, _srm_ENLocCode, 1, baseObj.Code, 1000))  //// สั่ง ASRS หยิบของ
                                                                                if (this.PostCommand(McCommandType.CM_2, _srm_STLocCode, _srm_ENLocCode, 1, "0000000000", 1000))  //// สั่ง ASRS หยิบของ

                                                                                    {
                                                                                        Step_P_sub_s = 1;
                                                                                    //StepTxt = "3.2";   ถึงตรงนี้  ****************************
                                                                                    ///DisplayController.Events_Write($"{this.Code} > exec 3.2");
                                                                                     }
                                         */

                                    }
                                    else
                                    {
                                        //  Step_P = 1;
                                        //  Step_P_sub = 2; ///   4    Shuttle ไปหยิบของมาวางไว้ที่ Standby แล้ว
                                        //  break;

                                    }
                                    /*
                                    ///สั่่งซ้ำ ให้ GVY รอรับ  pallet
                                    else {
                                        End_cvy = "";
                                        End_cvyName = "";
                                        DataADO.GetInstant().SelectBy<acs_Location>(
                                        ListKeyValue<string, object>.New("Area_ID", this.McWork_out.Des_Area_ID)   ////Rec_McObject_ID = ID ของ shut ที่จองงานนี้
                                        , this.BuVO).OrderBy(x => x.Code).ToList().ForEach(x2 =>
                                        {
                                            var cvy_out = Controller.McRuntimeController.GetInstant().GetMcRuntime(x2.Name);  /// เดี๋ยวต้องเปลี่ยนเป็น ID 
                                    if (cvy_out.McObj.DV_Pre_Status == 1 || cvy_out.McObj.DV_Pre_Status == 2 || cvy_out.McObj.DV_Pre_Status == 8)
                                    //   if (cvy_out.McObj.DV_Pre_Status == 1  || cvy_out.McObj.DV_Pre_Status == 8)
                                    {
                                                End_cvy = x2.Code;   //// code cvy
                                        End_cvyName = x2.Name; //name cvy
                                        return;
                                            }

                                        }); ////Status_Queue
                                            //// เช็ค CVY ปลายทางว่างมั้ย ที่จะลงได้ Sttaus = 1 ว่างไม่มีของ ,8 ว่างมีของ  ถ้าว่าง สั่งลง
                                        if (End_cvy != "")
                                        {
                                            var Set_location = DataADO.GetInstant().SelectBy<act_BaseObject>("ID", this.McWork_out.BaseObject_ID, null).FirstOrDefault();


                                            var souLocCode = this.StaticValue.GetLocation(this.McWork_out.Cur_Location_ID);


                                            var _srm_souLocCode = souLocCode.Code.Get2<int>() % 1000000;
                                            _srm_souLocCode += 47000000;

                                            var _srm_ENLocCode = End_cvy.Get2<int>() % 1000000;
                                            _srm_ENLocCode += 48000000;   //// cvy ปลายทาง
                                             cvy_Out = Controller.McRuntimeController.GetInstant().GetMcRuntime(End_cvyName);

                                            cvy_Out.PostCommand(McCommandType.CM_2, ListKeyValue<string, object>   /// 2 เตรียม รับ pallet 

                                            .New("Set_SouLoc", _srm_souLocCode)
                                            .Add("Set_DesLoc", _srm_ENLocCode)

                                            .Add("Set_Unit", 2)
                                            .Add("Set_PalletID", "A000000020")
                                            .Add("Set_Weigh", 1000)
                                            .Add("Set_Comm", 2)
                                                    );   ///// บอก CVY ว่า จะมีของไปลง
                                                         //Set_SouLoc={0}&SET_DseLoc={1}&Set_Unit={2}&Set_PalletID={3}&Set_Weigh=1000&Set_Comm=2
                                            Step_P = 3;
                                        }
                                    
                                    }
                                         */
                                    break;
                                case 1: //// สั่ง ASRS load แล้ว
                                    if (cvy_Out.McObj.DV_Pre_Status == 99 && this.McObj.DV_Pre_Status == 99)
                                    {
                                        //// Confrim 99 จบงานให้ SRM 
                                        //// UPDATE QueueStatus  ให้เป็น 9 งานเสร็จ
                                        /// DisplayController.Events_Write($"{this.Code} > exec 3.2-99");
                                        this.PostCommand(McCommandType.CM_99);

                                        cvy_Out.PostCommand(McCommandType.CM_99);

                                        this.McWork_out.QueueStatus = 9;
                                        DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork_out, this.BuVO); ///UPDATE QueueStatus =9  //// UPDATE คิวงานว่าจบแล้ว
                                        Step_P = 0;
                                        Step_P_sub = 0;
                                        Step_P_sub_s = 0;
                                    }
                                    break;
                            }

                            break;
                        case 3:/// ชาตแบต


                            break;
                    }
                    break;
            }



        }

        protected override void OnStart()
        {
            Step_P = 0;
            Step_P_sub = 0;
            Step_P_sub_s = 0;
        }
    }
}
