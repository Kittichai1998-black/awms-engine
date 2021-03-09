using ADO.WCSDB;
using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine.McRuntime
{
    public class McCvPDCommon : BaseMcRuntime
    {
        public McCvPDCommon(acs_McMaster mcMst) : base(mcMst)
        {
        }

        protected override void OnRun()
        {
            if (this.McWork4Receive != null)
            {
                    if (this.McObj.DV_Pre_Status == 98)
                    {
                        var souLoc = this.StaticValue.GetLocation(this.McWork4Receive.Cur_Location_ID);
                        var baseObj = ADO.WCSDB.BaseObjectADO.GetInstant().GetByID(this.McWork4Receive.BaseObject_ID, this.BuVO);
                        this.PostCommand(McCommandType.CM_1, 0, 0, 1, baseObj.Code, 1500, 
                            (mc)=>
                            {
                                if (mc.EventStatus == McObjectEventStatus.WORKING)
                                    this.McWork_1_ReceiveToWorking();
                            });
                    }
            }
            else if (this.McWork4Work != null)
            {
                if (this.McObj.DV_Pre_Status == 4 && this.McWork4Work.EventStatus == McWorkEventStatus.ACTIVE_WORKING)
                {
                    this.McWork_2_WorkingToWorked();
                }
            }
        }

        protected override bool OnRun_COMMAND()
        {
            return false;
        }

        protected override bool OnRun_DONE()
        {
            return false;
        }

        protected override bool OnRun_ERROR()
        {
            return false;
        }

        protected override bool OnRun_IDLE()
        {
            return false;
        }

        protected override bool OnRun_WORKING()
        {
            return false;
        }
    }
}
