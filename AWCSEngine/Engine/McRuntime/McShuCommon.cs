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
            /*if (this.McObj.DV_Pre_Zone != 0)
            {
                string rowLv = this.McObj.DV_Pre_RowLevel.ToString("000000");
                var curLoc = this.StaticValue.ListLocationByWarehouse(this.Cur_Area.Warehouse_ID)
                    .FirstOrDefault(x => x.Code.EndsWith(rowLv) && x.Info1.ToLower() == "zone_" + this.McObj.DV_Pre_Zone);
                if (curLoc != null)
                    this.McObj.Cur_Location_ID = curLoc.ID.Value;
            }*/

            if(this.McObj.DV_Pre_Zone != 0)
            {
                string rowLv = this.McObj.DV_Pre_RowLevel.ToString("000000");
                string priFix3 = this.Cur_Location.Code.Substring(3);
                var curLoc = this.StaticValue.ListLocationByWarehouse(this.Cur_Area.Warehouse_ID)
                    .FirstOrDefault(x => x.Code.StartsWith(priFix3) && x.Info1.ToLower() == "zone_" + this.McObj.DV_Pre_Zone);
                if (curLoc != null)
                    this.McObj.Cur_Location_ID = curLoc.ID.Value;
            }

            if(this.McObj.DV_Pre_Status == 99)
            {
                this.PostCommand(McCommandType.CM_99, null);
            }
            else if (this.McWork4Receive != null && this.McWork4Receive.EventStatus == McWorkEventStatus.ACTIVE_RECEIVE)
            {
                if (this.McObj.DV_Pre_Status == 90)
                {
                    this.PostCommand(McCommandType.CM_55, (mc) =>
                    {
                        if (mc.EventStatus == McObjectEventStatus.COMMAND_WRITING)
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
                if (this.McObj.DV_Pre_Status == 90 && this.McObj.DV_Pre_Zone == 1)
                {
                        this.McWork_2_WorkingToWorked();
                        this.McWork_4_WorkedToDone();
                }
                else if (this.McObj.DV_Pre_Status == 90 && this.McObj.DV_Pre_Zone != 2)
                {
                    this.PostCommand(McCommandType.CM_2,(mc)=>
                    {
                        if(mc.EventStatus == McObjectEventStatus.COMMAND_WRITING)
                        {
                            this.McWork_2_WorkingToWorked();
                            this.McWork_4_WorkedToDone();
                            return LoopResult.Break;
                        }
                        return LoopResult.Continue;
                    });//กลับ HOME
                }
            }
        }

        protected override void OnStart()
        {
        }
    }
}
