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
        protected override McTypeEnum McType => McTypeEnum.SHU;

        public McShuCommon(acs_McMaster mcMst) : base(mcMst)
        {
        }

        protected override void OnEnd()
        {
        }

        protected override void OnRun()
        {
            if (this.McMst.Info1.ToLower() == "in")
                OnRun_w8_Inbound();
        }

        private void OnRun_w8_Inbound()
        {
            if(this.McObj.IsBatteryLow || (this.McWork4Work == null && this.McWork4Receive == null))
            {
                if(this.McObj.DV_Pre_Status == 80 && this.McObj.DV_Pre_Zone != 4)
                {
                    this.PostCommand(McCommandType.CM_72, () => this.StepTxt = "0.1");
                }
                else if(this.McObj.DV_Pre_Status == 80 && this.McObj.DV_Pre_Zone == 4)
                {
                    this.SetBatteryLow(true);
                    this.PostCommand(McCommandType.CM_60, () => this.StepTxt = "0.2" );
                }
                else if(this.McObj.DV_Pre_Status == 82 && this.StepTxt == "0.2" && this.StepTxt != "0.3")
                {
                    ADO.WCSDB.McObjectADO.GetInstant().BatteryLow_CheckOut(this.ID, 1, 2, this.BuVO);
                    this.StepTxt = "0.3";
                }
                else if (this.McObj.DV_Pre_Status == 90 && this.McObj.IsBatteryLow)
                {
                    this.SetBatteryLow(false);
                    this.StepTxt = "0.4";
                }
            }
            else if (this.McWork4Work != null && this.McWork4Work.EventStatus == McWorkEventStatus.ACTIVE_WORKING)
            {
                //5.1 จบงานรับเข้า กรณีงานค้าง
                if (this.McObj.DV_Pre_Status == 99 && this.StepTxt != "5.1")
                {
                    this.PostCommand(McCommandType.CM_99, (mc) =>
                    {
                        this.McWork_2_WorkingToWorked();
                        this.McWork_4_WorkedToDone();
                        return LoopResult.Break;
                    }, () => this.StepTxt = "5.1");
                }
            }
            else if (this.McWork4Receive != null && this.McWork4Receive.EventStatus == McWorkEventStatus.ACTIVE_RECEIVE)
            {
                //4.1 ยกพาเลทจาก zone inbound เพื่อรับเข้า
                if (this.McObj.DV_Pre_Status == 90 && this.StepTxt != "4.1")
                {
                    this.PostCommand(McCommandType.CM_55, (mc) =>
                    {
                        this.McWork_1_ReceiveToWorking();
                        return LoopResult.Break;
                    },()=>this.StepTxt= "4.1");
                }
                //4.2 จบงานรับเข้า
                else if(this.McObj.DV_Pre_Status == 99 && this.StepTxt != "4.2")
                {
                    this.McWork_1_ReceiveToWorking();
                    this.StepTxt = "4.2";
                }
            }

        }

        protected override void OnStart()
        {
        }
    }
}
