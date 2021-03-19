using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AWCSEngine.Engine.McRuntime
{
    public class McShuCommon : BaseMcRuntime
    {
        public McShuCommon(acs_McMaster mcMst) : base(mcMst)
        {
        }

        protected override void OnEnd()
        {
        }

        protected override void OnRun()
        {
            if(this.McWork4Receive !=null || this.McWork4Work != null)
            {
                var areaID = this.McWork4Receive != null ? this.McWork4Receive.Des_Area_ID :
                    this.McWork4Work != null ? this.McWork4Work.Des_Area_ID : 0;
                var area =this.StaticValue.GetArea(areaID);
                var wh = this.StaticValue.GetWarehouse(area.Warehouse_ID);
                if(wh.Code.ToLower() == "w8")
                {
                    if (area.Code.ToLower() == "out")
                        OnRun_w8_Outbound();
                    else
                        OnRun_w8_Inbound();
                }
            }
        }
        private void OnRun_w8_Outbound()
        {

            if (this.McWork4Receive != null && this.McWork4Receive.EventStatus == McWorkEventStatus.ACTIVE_RECEIVE)
            {
                var souLoc = this.StaticValue.GetLocation(this.McWork4Receive.Sou_Location_ID);
                //var desLoc = this.StaticValue.GetLocation(this.McWork4Receive.Des_Location_ID.Value);
                if (this.Cur_Location.GetBay() != souLoc.GetBay() || this.Cur_Location.GetLv() != souLoc.GetLv())
                {
                    //สั่งกลับ stanby out
                    if(this.McObj.DV_Pre_Status == 90 && this.McObj.DV_Pre_Zone != 4)
                    {
                        this.PostCommand(McCommandType.CM_52);
                    }
                    //สั่ง start และกลับ home out
                    else if (this.McObj.DV_Pre_Status == 84 && this.McObj.DV_Pre_Zone != 4)
                    {
                        this.PostCommand(McCommandType.CM_1, ListKeyValue<string, object>
                            .New("Set_SouLoc", this.Cur_Location.Code.Get2<int>() % 1000000)
                            .Add("Set_ShtDi", 2), null);
                    }
                    //สั่ง ปิดเครื่อง
                    else if (this.McObj.DV_Pre_Status == 90 && this.McObj.DV_Pre_Zone == 4)
                    {
                        this.PostCommand(McCommandType.CM_60);
                    }
                    //ยก shu ออก
                    else if (this.McObj.DV_Pre_Status == 82 && this.McObj.DV_Pre_Zone == 4)
                    {
                        var srm12 = Controller.McRuntimeController.GetInstant().GetMcRuntime("SRM12");
                        if (srm12.McWork4Receive == null && srm12.McWork4Work == null && srm12.McObj.DV_Pre_Status == 90)
                        {
                            var _srm_souLocCode = (this.Cur_Location.Code.Get2<int>() % 1000000)+47000000;
                            var _srm_desLocCode = (souLoc.Code.Get2<int>() % 1000000)+ 47000000;
                            srm12.PostCommand(McCommandType.CM_1, _srm_souLocCode, _srm_desLocCode, 3, "0000000000", 1500,
                                (mc) =>
                                {
                                    if (mc.McObj.DV_Pre_Status == 99)
                                    {
                                        this.McObj.Cur_Location_ID = this.StaticValue.GetLocation(_srm_desLocCode.ToString("000000000")).ID.Value;
                                        srm12.PostCommand(McCommandType.CM_99);
                                        return LoopResult.Break;
                                    }
                                    return LoopResult.Continue;
                                });
                        }
                    }
                }
                //อยู่ถูกที่ ถูกแถว
                else
                {
                    //เปิดเครื่อง
                    if (this.McObj.DV_Pre_Status == 82)
                    {
                        this.PostCommand(McCommandType.CM_1, ListKeyValue<string, object>
                            .New("Set_SouLoc", this.Cur_Location.Code.Get2<int>() % 1000000)
                            .Add("Set_ShtDi", 2), null) ;
                    }
                    //Move Home out
                    else if (this.McObj.DV_Pre_Status == 90 && this.McObj.DV_Pre_Zone != 3)
                    {
                        this.PostCommand(McCommandType.CM_54);
                    }
                    //รับงาน
                    else if (this.McObj.DV_Pre_Status == 90 && this.McObj.DV_Pre_Zone == 3)
                    {
                        this.McWork_1_ReceiveToWorking();
                    }
                }
            }
            else if (this.McWork4Work != null && this.McWork4Work.EventStatus == McWorkEventStatus.ACTIVE_WORKING)
            {
                //เบิกงานออก
                if (this.McObj.DV_Pre_Status == 90 && this.McObj.DV_Pre_Zone == 3)
                {
                    this.PostCommand(McCommandType.CM_57,(mc)=>
                    {
                        if(mc.McObj.DV_Pre_Status == 99)
                        {
                            this.McWork_2_WorkingToWorked();

                            var srm12 = Controller.McRuntimeController.GetInstant().GetMcRuntime("SRM12");
                            if (srm12.McObj.DV_Pre_Status == 90 && srm12.McWork4Work == null && srm12.McWork4Receive == null)
                            {
                                this.McWork_3_WorkedToReceive_NextMC(srm12.ID);
                                this.PostCommand(McCommandType.CM_99);
                            }
                            return LoopResult.Break;
                        }
                        return LoopResult.Continue;
                    });
                }
            }

        }
        private void OnRun_w8_Inbound()
        {

            if (this.McWork4Receive != null && this.McWork4Receive.EventStatus == McWorkEventStatus.ACTIVE_RECEIVE)
            {
                if (this.McObj.DV_Pre_Status == 90)
                {
                    this.PostCommand(McCommandType.CM_55, (mc) =>
                    {
                        if (mc.EventStatus == McObjectEventStatus.DONE)
                        {
                            this.McWork_1_ReceiveToWorking();
                            return LoopResult.Break;
                        }
                        return LoopResult.Continue;
                    });
                }
            }
            else if (this.McWork4Work != null && this.McWork4Work.EventStatus == McWorkEventStatus.ACTIVE_WORKING)
            {
                //จบงาน
                if (this.McObj.DV_Pre_Status == 99)
                {
                    this.PostCommand(McCommandType.CM_99, (mc) =>
                    {
                        if(mc.EventStatus == McObjectEventStatus.DONE)
                        {
                            this.McWork_2_WorkingToWorked();
                            this.McWork_4_WorkedToDone();
                            return LoopResult.Break;
                        }
                        return LoopResult.Continue;
                    });
                }
            }

        }

        protected override void OnStart()
        {
        }
    }
}
