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
            if (this.McWork4Work == null) return;

            var baseObj = BaseObjectADO.GetInstant().GetByID(this.McWork4Work.BaseObject_ID,this.BuVO);
            if (this.Cur_Location.ID == this.McWork4Work.Cur_Location_ID)
            {
                if(this.McObj.DV_Pre_Status == 98)
                {
                    this.PostCommand(McCommandType.CM_1,
                        ListKeyValue<string,object>
                        .New("Set_PalletID", baseObj.Code)
                        , null);

                }
                else if (this.McObj.DV_Pre_Status == 4 && 
                    this.McWork4Work.EventStatus == McWorkEventStatus.ACTIVE_WORKING)
                {
                    this.McWork_WorkingToWorked();
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
