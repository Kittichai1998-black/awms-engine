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
            if (this.McWork4Receive != null && this.McWork4Receive.EventStatus == McWorkEventStatus.ACTIVE_RECEIVE)
            {
                if (this.McObj.DV_Pre_Status == 90)
                {
                    this.PostCommand(McCommandType.CM_55, (mc) =>
                    {
                        this.McWork_1_ReceiveToWorking();
                        return LoopResult.Break;
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
                        this.McWork_2_WorkingToWorked();
                        this.McWork_4_WorkedToDone();
                        return LoopResult.Break;
                    });
                }
            }
        }

        protected override void OnStart()
        {
        }
    }
}
