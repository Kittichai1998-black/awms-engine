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
            if (this.McObj.DV_Pre_Zone != 0)
            {
                string rowLv = this.McObj.DV_Pre_RowLevel.ToString("000000");
                var curLoc = this.StaticValue.ListLocationByWarehouse(this.Cur_Area.Warehouse_ID)
                    .FirstOrDefault(x => x.Code.EndsWith(rowLv) && x.Info1.ToLower() == "zone_" + this.McObj.DV_Pre_Zone);
                if (curLoc != null)
                    this.McObj.Cur_Location_ID = curLoc.ID.Value;
            }



            if (this.McWork4Receive != null)
            {
                if (this.McObj.DV_Pre_Status == 90)
                {
                    this.PostCommand(McCommandType.CM_1,
                        (mc) =>
                        {
                            if (mc.EventStatus == McObjectEventStatus.COMMAND_WRITING)
                            {
                                mc.McWork_1_ReceiveToWorking();
                                return LoopResult.Break;
                            }
                            return LoopResult.Continue;
                        });
                }
            }
            else if (this.McWork4Work != null)
            {
                if (this.McObj.DV_Pre_Status == 90 && this.McObj.DV_Pre_Zone == 1)
                {
                    if (this.McWork4Work.EventStatus == McWorkEventStatus.ACTIVE_WORKING)
                    {
                        this.McWork_2_WorkingToWorked();
                        this.McWork_4_WorkedToDone();
                    }
                }
                else if (this.McObj.DV_Pre_Status == 90 && this.McObj.DV_Pre_Zone != 1)
                {
                    this.PostCommand(McCommandType.CM_10,//กลับ HOME
                        (mc) =>
                        {
                            if (mc.EventStatus == McObjectEventStatus.COMMAND_WRITING &&
                            this.McWork4Work.EventStatus == McWorkEventStatus.ACTIVE_WORKING)
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
