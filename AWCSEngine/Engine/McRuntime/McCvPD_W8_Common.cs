using ADO.WCSDB;
using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using AMWUtil.Common;
using AWCSEngine.Engine.CommonEngine;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine.McRuntime
{
    public class McCvPD_W8_Common : BaseMcRuntime
    {
        public McCvPD_W8_Common(acs_McMaster mcMst) : base(mcMst)
        {
        }

        protected override void OnRun()
        {
            if (this.Code == "RC8-2")
            {
                this.Normal_OnRun();
            }
            else if(this.Code == "RC8-1")
            {
                this.RC8_1_OnRun();
            }
        }
        private void RC8_1_OnRun()
        {
            //0
            if (this.McWork4Receive == null && this.McWork4Work == null)
            {
                //0.1 สแกน QRCode สินค้า รอตรวจสอบ
                if(this.McObj.DV_Pre_Status == 98 && !string.IsNullOrWhiteSpace(this.McObj.DV_Pre_BarProd) && this.StepTxt != "0.1")
                {
                    new RegisterBaseObj_byQrProd_InboundComm(this.LogRefID, this.BuVO)
                        .Execute(new RegisterBaseObj_byQrProd_InboundComm.TReq()
                        {
                            LabelData = this.McObj.DV_Pre_BarProd,
                            McObject_ID = this.ID
                        });
                    this.StepTxt = "0.1";
                }
            }
            else
            {
                //1~n.
                this.Normal_OnRun();
            }
        }
        private void Normal_OnRun() {

            if (this.McObj.DV_Pre_Status == 96)
            {
                this.PostCommand(McCommandType.CM_3);
            }
            //1
            else if (this.McWork4Receive != null && this.McWork4Receive.EventStatus == McWorkEventStatus.ACTIVE_RECEIVE)
            {
                //1.1
                if (this.McObj.DV_Pre_Status == 98 && this.StepTxt != "1.1")
                {
                    var souLoc = this.StaticValue.GetLocation(this.McWork4Receive.Cur_Location_ID);
                    var baseObj = ADO.WCSDB.BaseObjectADO.GetInstant().GetByID(this.McWork4Receive.BaseObject_ID, this.BuVO);
                    this.PostCommand(McCommandType.CM_1, 0, 0, 1, baseObj.Code, 1500, "1.1");
                }
            }
            //2
            else if (this.McWork4Work != null && this.McWork4Work.EventStatus == McWorkEventStatus.ACTIVE_WORKING)
            {
                //2.1 CV พร้อมรับเข้า สั่ง SRM รับเข้า
                if(this.McObj.DV_Pre_Status == 98 && this.StepTxt != "2.1")
                {
                    var souLoc = this.StaticValue.GetLocation(this.McWork4Work.Cur_Location_ID);
                    var baseObj = ADO.WCSDB.BaseObjectADO.GetInstant().GetByID(this.McWork4Work.BaseObject_ID, this.BuVO);
                    this.PostCommand(McCommandType.CM_1, 0, 0, 1, baseObj.Code, 1500,"2.1");
                }
                //2.2 popup pallet รอ SRM มารับ
                else if (this.McObj.DV_Pre_Status == 4 && this.StepTxt != "2.2")
                {
                    //ส่งงานให้ SRM Inbound
                    if (this.Code.In("RC8-2", "RC8-1"))
                    {
                        var mcSrm11 = Controller.McRuntimeController.GetInstant().GetMcRuntime("SRM11");
                        this.McWork_2_WorkingToWorked();
                        this.McWork_3_WorkedToReceive_NextMC(mcSrm11.ID);
                        this.StepTxt = "2.2";
                    }
                    //ส่งงานให้ SRM Outbound
                    else if (this.Code.In("RC8-4", "RC8-5"))
                    {
                        var mcSrm12 = Controller.McRuntimeController.GetInstant().GetMcRuntime("SRM12");
                        this.McWork_2_WorkingToWorked();
                        this.McWork_3_WorkedToReceive_NextMC(mcSrm12.ID);
                        this.StepTxt = "2.2";
                    }
                }
            }
            else if (this.McWork4Work != null && this.McWork4Work.EventStatus == McWorkEventStatus.ACTIVE_WORKED)
            {
                //3.1 jpopup pallet รอ SRM มารับ (งานค้างยังไม่มี SRM มารับงาน)
                if (this.McObj.DV_Pre_Status == 4)
                {
                    if (this.Code.In("RC8-2", "RC8-1"))
                    {
                        var _srm11 = Controller.McRuntimeController.GetInstant().GetMcRuntime("SRM11");
                        this.McWork_3_WorkedToReceive_NextMC(_srm11.ID);
                        this.StepTxt = "3.1";
                    }
                    //ส่งงานให้ SRM Outbound
                    else if (this.Code.In("RC8-4", "RC8-5"))
                    {
                        var _srm11 = Controller.McRuntimeController.GetInstant().GetMcRuntime("SRM12");
                        this.McWork_3_WorkedToReceive_NextMC(_srm11.ID);
                        this.StepTxt = "3.1";
                    }
                }
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
