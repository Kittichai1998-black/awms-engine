using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
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
