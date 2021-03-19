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
            if (this.McWork4Receive != null && this.McWork4Receive.EventStatus == McWorkEventStatus.ACTIVE_RECEIVE)
            {
                if (this.McObj.DV_Pre_Status == 98)
                {
                    var souLoc = this.StaticValue.GetLocation(this.McWork4Receive.Cur_Location_ID);
                    var baseObj = ADO.WCSDB.BaseObjectADO.GetInstant().GetByID(this.McWork4Receive.BaseObject_ID, this.BuVO);
                    this.PostCommand(McCommandType.CM_1, 0, 0, 1, baseObj.Code, 1500, null);
                    this.McWork_1_ReceiveToWorking();
                }
            }
            else if (this.McWork4Work != null && this.McWork4Work.EventStatus == McWorkEventStatus.ACTIVE_WORKING)
            {
                if(this.McObj.DV_Pre_Status == 98)
                {
                    var souLoc = this.StaticValue.GetLocation(this.McWork4Work.Cur_Location_ID);
                    var baseObj = ADO.WCSDB.BaseObjectADO.GetInstant().GetByID(this.McWork4Work.BaseObject_ID, this.BuVO);
                    this.PostCommand(McCommandType.CM_1, 0, 0, 1, baseObj.Code, 1500, null);
                }
                else if (this.McObj.DV_Pre_Status == 4)
                {
                    this.McWork_2_WorkingToWorked();
                    if (this.Code.In("RC8-2"))
                    {
                        var mcSrm11 = Controller.McRuntimeController.GetInstant().GetMcRuntime("SRM11");
                        this.McWork_3_WorkedToReceive_NextMC(mcSrm11.ID);
                    }
                }
            }
            else if (this.McWork4Work != null && this.McWork4Work.EventStatus == McWorkEventStatus.ACTIVE_WORKED)
            {
                if (this.McObj.DV_Pre_Status == 4)
                {
                    var _srm11 = Controller.McRuntimeController.GetInstant().GetMcRuntime("SRM11");
                    this.McWork_3_WorkedToReceive_NextMC(_srm11.ID);
                }
            }

            if (this.McObj.DV_Pre_Status == 96)
            {
                this.PostCommand(McCommandType.CM_3, null);
            }
        }

        protected override void OnStart()
        {
        }
        protected override void OnEnd()
        {
        }

    }
}
