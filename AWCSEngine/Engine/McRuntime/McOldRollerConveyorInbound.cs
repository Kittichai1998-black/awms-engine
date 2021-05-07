using ADO.WCSDB;
using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using AMWUtil.Common;
using AWCSEngine.Controller;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AWCSEngine.Engine.McRuntime
{
    public class McOldRollerConveyorInbound : BaseMcRuntime
    {
        protected override McTypeEnum McType => McTypeEnum.CV;

        public McOldRollerConveyorInbound(acs_McMaster mcMst) : base(mcMst)
        {
        }

        private static object _single_thread = new object();
        

        protected override void OnRun()
        {
            //Lock ให้ Thread ทำงานจนจบก่อนที่จะไปทำที่ Thread อื่น
            lock (_single_thread)
            {
                this.Mc_OnRun();
            }
        }
        protected override void OnStart()
        {
        }
        protected override void OnEnd()
        {
        }

        #region Declare variable
        protected string LogCode => "RCO";
        private int dimentionEjectStatus { get; set; }
        private bool dimentionEjectFlg { get; set; }
        private int disCharge { get; set; }
        private int errCode { get; set; }
        private int cmdReject { get; set; }
        private string palletLabelData { get; set; }
        private act_BuWork buWork { get; set; }
        private act_BaseObject baseObj { get; set; }
        private int PassFlg { get; set; }
        private long? BuWork_ID { get; set; }
        private long? BaseObject_ID { get; set; }
        #endregion

        #region Methods
        private void Mc_OnRun()
        {
            switch (this.McObj.DV_Pre_Status)
            {
                case 104:
                case 105:
                case 106:
                case 107:
                case 108:
                case 109:
                    //Dimention Reject
                    this.dimentionEjectStatus = this.McObj.DV_Pre_Status;
                    this.dimentionEjectFlg = true;
                    this.errCode = this.McObj.DV_Pre_Status;
                    this.cmdReject = (int) McCommandType.CM_5;
                    this.PassFlg = (int)FlagTypeEnum.Fail;
                    break;

                case 137:
                    //Barcode scan Reject
                    this.errCode = this.McObj.DV_Pre_Status;
                    this.PassFlg = (int)FlagTypeEnum.Fail;
                    break;

                case 98:
                    //อ่าน Barcode ได้
                    if (!string.IsNullOrWhiteSpace(this.McObj.DV_Pre_BarProd))
                    {
                        this.buWork = DataADO.GetInstant().SelectBy<act_BuWork>(
                        ListKeyValue<string, object>
                        .New("status", EntityStatus.ACTIVE)
                        .Add("LabelData", this.McObj.DV_Pre_BarProd), this.BuVO).FirstOrDefault();

                        if(this.buWork == null)
                        {
                            this.cmdReject = (int)McCommandType.CM_11;
                            this.PassFlg = (int)FlagTypeEnum.Fail;
                        }
                        else
                        {
                            var bo = BaseObjectADO.GetInstant().GetByLabel(this.McObj.DV_Pre_BarProd, this.BuVO);
                            if(bo!= null)
                            {
                                if (bo.EventStatus == BaseObjectEventStatus.TEMP)
                                {
                                    this.baseObj = bo;
                                }
                                else
                                {
                                    this.cmdReject = (int)McCommandType.CM_10;
                                    this.PassFlg = (int)FlagTypeEnum.Fail;
                                }
                            }

                            this.disCharge = this.buWork.DisCharge;
                            this.BuWork_ID = this.buWork == null ? 0 : this.buWork.ID;
                        }


                    }
                    break;
            }

            if(this.disCharge == 0)
            {
                this.cmdReject = (int)McCommandType.CM_5;
                this.PassFlg = (int)FlagTypeEnum.Fail;
            }

            if(this.baseObj == null)
            {
                string baseCode;
                do
                {
                    baseCode = (DataADO.GetInstant().NextNum("base_no", false, this.BuVO) % (Math.Pow(10, 10))).ToString("0000000000");
                } while (DataADO.GetInstant().SelectByCodeActive<act_BaseObject>(baseCode, this.BuVO) != null);

                baseObj = new act_BaseObject()
                {
                    ID = null,
                    BuWork_ID = this.buWork == null ? null : this.buWork.ID,
                    Code = baseCode,
                    Model = "N/A",
                    McObject_ID = this.ID,
                    Warehouse_ID = this.Cur_Area == null ? 0 : this.Cur_Area.Warehouse_ID,
                    Area_ID = this.Cur_Location == null ? 0 : this.Cur_Location.Area_ID,
                    Location_ID = this.McObj != null && this.McObj.Cur_Location_ID != null ? this.McObj.Cur_Location_ID.GetValueOrDefault() : 0,
                    LabelData = this.McObj.DV_Pre_BarProd,
                    EventStatus = BaseObjectEventStatus.TEMP,
                    Status = EntityStatus.ACTIVE
                };
                baseObj.ID = DataADO.GetInstant().Insert<act_BaseObject>(baseObj, this.BuVO);

            }

            if(!string.IsNullOrWhiteSpace(this.McObj.DV_Pre_BarProd) && this.baseObj != null && this.buWork != null  && (this.cmdReject == 0 && this.errCode == 0))
            {
                this.PassFlg = (int)FlagTypeEnum.Pass;
            }

            if (this.baseObj != null && this.baseObj.EventStatus == BaseObjectEventStatus.TEMP)
            {
                this.baseObj.BuWork_ID = this.buWork == null ? null : this.buWork.ID;
                this.baseObj.DisCharge = this.buWork == null ? 0 : this.buWork.DisCharge;
                this.baseObj.Customer = this.buWork == null ? null : this.buWork.Customer;
                this.baseObj.SkuCode = this.buWork == null ? null : this.buWork.SkuCode;
                this.baseObj.SkuGrade = this.buWork == null ? null : this.buWork.SkuGrade;
                this.baseObj.SkuLot = this.buWork == null ? null : this.buWork.SkuLot;
                this.baseObj.SkuItemNo = this.buWork == null ? null : this.buWork.ItemNo;
                this.baseObj.SkuQty = this.buWork == null ? 0 : this.buWork.SkuQty;
                this.baseObj.SkuUnit = this.buWork == null ? null : this.buWork.SkuUnit;
                this.baseObj.SkuStatus = this.buWork == null ? null : this.buWork.SkuStatus;
                this.baseObj.ErrorCode = this.errCode;
                this.baseObj.PassFlag = this.PassFlg == 0 ? "N" : "Y";
                DataADO.GetInstant().UpdateBy<act_BaseObject>(this.baseObj, this.BuVO);
            }

            this.BaseObject_ID = this.baseObj != null ? this.baseObj.ID : null;

            if (this.PassFlg == 1)
            {
                this.PostCommand(McCommandType.CM_1);
            }
            else
            {
                if(this.cmdReject != 0)
                {
                    McCommandType cmd = (McCommandType)this.cmdReject;
                    this.PostCommand(cmd);
                }
                else
                {
                    this.PostCommand(McCommandType.CM_15);
                }
            }

            this.StepTxt = "1";
            string msg = this.Code + " > Working | LABEL =" + this.McObj.DV_Pre_BarProd + " | DisCharge =" + this.disCharge;
            msg += " | BuWork_ID =" + this.BuWork_ID + " | BaseObject_ID =" + this.BaseObject_ID + " | Status =" + (this.PassFlg == 0 ? "N" : "Y");
            msg += " | Error code =" + this.errCode + " | Command Reject =" + this.cmdReject;
            DisplayController.Events_Write(msg);

        }
        #endregion

    }
}
