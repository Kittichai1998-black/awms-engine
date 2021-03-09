using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;

namespace AWCSEngine.Engine.McRuntime
{
    public class McSrmCommon : BaseMcRuntime
    {
        public McSrmCommon(acs_McMaster mcMst) : base(mcMst)
        {
        }

        protected override void OnEnd()
        {
        }

        protected override void OnRun()
        {
            if (this.McWork4Receive != null)
            {
                if (this.McObj.DV_Pre_Status == 90)
                {
                    var nextLocID = this.McWork4Receive.GetCur_TreeRoute().First().Value;
                    var souLoc = this.StaticValue.GetLocation(this.McWork4Receive.Cur_Location_ID);
                    var nextLoc = this.StaticValue.GetLocation(nextLocID);
                    var baseObj = ADO.WCSDB.BaseObjectADO.GetInstant().GetByID(this.McWork4Receive.BaseObject_ID, this.BuVO);
                    this.PostCommand(McCommandType.CM_1, souLoc.Code.Get2<int>(), nextLoc.Code.Get2<int>(), 1, baseObj.Code, 1500,
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
            else if(this.McWork4Work != null)
            {
                if(this.McObj.DV_Pre_Status == 90)
                {
                    if (this.McWork4Work.EventStatus == McWorkEventStatus.ACTIVE_WORKING)
                        this.McWork_2_WorkingToWorked();
                }
            }
        }

        protected override void OnStart()
        {
        }
    }
}
