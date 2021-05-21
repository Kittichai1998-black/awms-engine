using ADO.WCSDB;
using AMSModel.Constant.EnumConst;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.PropertyFile;
using AWCSEngine.Controller;
using AWCSEngine.Util;
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
            //this.clear();

            this.mainStep = this.StepTxt.Substring(0, 1);
            writeEventLog(this.StepTxt + " Status " + this.McObj.DV_Pre_Status + " Label " + this.McObj.DV_Pre_BarProd);
            switch (this.mainStep)
            {
                case "0":
                    //Check dimention และ สแกนบาร์โค๊ด
                    writeEventLog("0. Check dimention และ สแกนบาร์โค๊ด" + " Status " + this.McObj.DV_Pre_Status + " Label " + this.McObj.DV_Pre_BarProd);
                    switch (this.McObj.DV_Pre_Status)
                    {
                        case 104:
                        case 105:
                        case 106:
                        case 107:
                        case 108:
                        case 109:
                            //Dimention Reje
                            this.errCode = this.McObj.DV_Pre_Status;
                            this.cmdReject = (int)McCommandType.CM_15;
                            this.PassFlg = (int)PassFailFlag.Fail;
                            writeEventLog("0.1 Dimention Reject " + this.McObj.DV_Pre_Status);
                            this.StepTxt = "2.1";
                            break;

                        case 137:
                            //Barcode scan Reject
                            this.errCode = this.McObj.DV_Pre_Status;
                            this.cmdReject = (int)McCommandType.CM_15;
                            this.PassFlg = (int)PassFailFlag.Fail;
                            writeEventLog("0.2 Eject by Barcode scan " + this.McObj.DV_Pre_Status);
                            this.StepTxt = "2.1";
                            break;

                        case 98:
                            //อ่าน Barcode ได้
                            if (!string.IsNullOrWhiteSpace(this.McObj.DV_Pre_BarProd))
                            {
                                writeEventLog("0.3 Status " + this.McObj.DV_Pre_Status + " Label " + this.McObj.DV_Pre_BarProd);
                                this.StepTxt = "1.1";
                                break;
                            }
                            break;
                    }


                            break;


                case "1":
                    switch (this.StepTxt)
                    {
                        case "1.1":
                            this.rco5_3BuWork = this.getRCO5_3BuWork();
                            //this.rco5_3BaseObject = BaseObjectADO.GetInstant().GetByLabel(this.McObj.DV_Pre_BarProd, this.Cur_Area.Warehouse_ID, this.BuVO);
                            //this.rco5_3BaseObject = this.getRCO5_3BaseObjectByLabel(this.McObj.DV_Pre_BarProd);
                            if (this.rco5_3BuWork == null || (this.rco5_3BuWork != null && (this.rco5_3BuWork.DisCharge == "0" || String.IsNullOrWhiteSpace(this.rco5_3BuWork.DisCharge))))
                            {
                                this.cmdReject = (int)McCommandType.CM_11;
                                this.PassFlg = (int)PassFailFlag.Fail;
                                this.errCode = 111;

                                this.rco5_3BaseObject = ADO.WCSDB.DataADO.GetInstant()
                                       .SelectBy<act_BaseObject>(
                                           new SQLConditionCriteria[] {
                                        new SQLConditionCriteria("Warehouse_ID", this.Cur_Area.Warehouse_ID, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("LabelData", this.McObj.DV_Pre_BarProd, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN)
                                           }, BuVO)
                                           .OrderBy(x => x.ID)
                                           .FirstOrDefault();

                                if (this.rco5_3BaseObject != null)
                                {
                                    this.rco5_3BaseObject.ErrorCode = this.errCode;
                                    this.rco5_3BaseObject.PassFlg = this.PassFlg == 0 ? "N" : "Y";
                                    DataADO.GetInstant().UpdateBy<act_BaseObject>(this.rco5_3BaseObject, this.BuVO);
                                }

                                writeEventLog("1.1.1 ไม่พบข้อมูลรับเข้า " + this.McObj.DV_Pre_BarProd);
                                this.StepTxt = "3.1";
                                break;
                            }


                            this.rco5_3BaseObject = ADO.WCSDB.DataADO.GetInstant()
                                       .SelectBy<act_BaseObject>(
                                           new SQLConditionCriteria[] {
                                        new SQLConditionCriteria("Warehouse_ID", this.Cur_Area.Warehouse_ID, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("LabelData", this.McObj.DV_Pre_BarProd, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("Status", new int[] { 0, 1 }, SQLOperatorType.IN)
                                           }, BuVO)
                                           .OrderBy(x => x.ID)
                                           .FirstOrDefault();

                            if (this.rco5_3BaseObject != null  )
                            {
                                //var mcWork = this.getRCO5_3McWork();
                                ////--ถ้าไม่มีคิวค้าง
                                //if (mcWork == null)
                                //{
                                    this.cmdReject = (int)McCommandType.CM_10;
                                    this.PassFlg = (int)PassFailFlag.Fail;
                                    this.errCode = 110;

                                    if (this.rco5_3BaseObject != null)
                                    {
                                        this.rco5_3BaseObject.ErrorCode = this.errCode;
                                        this.rco5_3BaseObject.PassFlg = this.PassFlg == 0 ? "N" : "Y";
                                        DataADO.GetInstant().UpdateBy<act_BaseObject>(this.rco5_3BaseObject, this.BuVO);
                                    }

                                    writeEventLog("1.1.2 ข้อมูลพาเลทซ้ำ " + this.McObj.DV_Pre_BarProd);
                                    this.StepTxt = "3.2";
                                    break;
                                //}
                                
                            }

                            //--------Pass
                            this.cmdReject = 0;
                            this.PassFlg = 1;
                            this.errCode = 0;

                            this.StepTxt = "2.1";
                            break;





                    }

                            break;

                case "2":
                    switch (this.StepTxt)
                    {
                        case "2.1":
                            string baseCode;
                            do
                            {
                                baseCode = (DataADO.GetInstant().NextNum("base_no", false, this.BuVO) % (Math.Pow(10, 10))).ToString("0000000000");
                            } while (DataADO.GetInstant().SelectByCodeActive<act_BaseObject>(baseCode, this.BuVO) != null);

                            this.rco5_3BaseObject = new act_BaseObject()
                            {
                                ID = null,
                                BuWork_ID = this.rco5_3BuWork == null ? null : this.rco5_3BuWork.ID,
                                Code = baseCode,
                                Model = "N/A",
                                McObject_ID = this.McObj.ID,
                                Warehouse_ID = this.Cur_Area == null ? 0 : this.Cur_Area.Warehouse_ID,
                                Area_ID = this.Cur_Location == null ? 0 : this.Cur_Location.Area_ID,
                                Location_ID = this.McObj != null && this.McObj.Cur_Location_ID != null ? this.McObj.Cur_Location_ID.GetValueOrDefault() : 0,
                                LabelData = this.McObj.DV_Pre_BarProd,
                                DisCharge = this.rco5_3BuWork == null ? "0" : this.rco5_3BuWork.DisCharge,
                                Customer = this.rco5_3BuWork == null ? null : this.rco5_3BuWork.Customer,
                                SkuCode = this.rco5_3BuWork == null ? null : this.rco5_3BuWork.SkuCode,
                                SkuGrade = this.rco5_3BuWork == null ? null : this.rco5_3BuWork.SkuGrade,
                                SkuLot = this.rco5_3BuWork == null ? null : this.rco5_3BuWork.SkuLot,
                                SkuItemNo = this.rco5_3BuWork == null ? null : this.rco5_3BuWork.ItemNo,
                                SkuQty = this.rco5_3BuWork == null ? 0 : this.rco5_3BuWork.SkuQty,
                                SkuUnit = this.rco5_3BuWork == null ? null : this.rco5_3BuWork.SkuUnit,
                                SkuStatus = this.rco5_3BuWork == null ? null : this.rco5_3BuWork.SkuStatus,
                                EventStatus = BaseObjectEventStatus.TEMP,
                                Status = EntityStatus.ACTIVE
                            };
                            this.rco5_3BaseObject.ID = DataADO.GetInstant().Insert<act_BaseObject>(this.rco5_3BaseObject, this.BuVO);
                            writeEventLog("2.1.1 สร้างข้อมูลพาเลท " + this.McObj.DV_Pre_BarProd + " BaseObject_ID " + this.rco5_3BaseObject.ID);

                            if (this.rco5_3BuWork != null && this.rco5_3BaseObject != null)
                            {
                                this.rco5_3BaseObject.DisCharge = this.rco5_3BuWork == null ? "0" : this.rco5_3BuWork.DisCharge;
                                this.rco5_3BaseObject.Customer = this.rco5_3BuWork == null ? null : this.rco5_3BuWork.Customer;
                                this.rco5_3BaseObject.SkuCode = this.rco5_3BuWork == null ? null : this.rco5_3BuWork.SkuCode;
                                this.rco5_3BaseObject.SkuGrade = this.rco5_3BuWork == null ? null : this.rco5_3BuWork.SkuGrade;
                                this.rco5_3BaseObject.SkuLot = this.rco5_3BuWork == null ? null : this.rco5_3BuWork.SkuLot;
                                this.rco5_3BaseObject.SkuItemNo = this.rco5_3BuWork == null ? null : this.rco5_3BuWork.ItemNo;
                                this.rco5_3BaseObject.SkuQty = this.rco5_3BuWork == null ? 0 : this.rco5_3BuWork.SkuQty;
                                this.rco5_3BaseObject.SkuUnit = this.rco5_3BuWork == null ? null : this.rco5_3BuWork.SkuUnit;
                                this.rco5_3BaseObject.SkuStatus = this.rco5_3BuWork == null ? null : this.rco5_3BuWork.SkuStatus;

                                DataADO.GetInstant().UpdateBy<act_BaseObject>(this.rco5_3BaseObject, this.BuVO);
                                writeEventLog("2.1.2 Update ข้อมูลพาเลท จาก BuWork");
                            }

                            if (this.rco5_3BaseObject != null)
                            {
                                this.rco5_3BaseObject.ErrorCode = this.errCode;
                                this.rco5_3BaseObject.PassFlg = this.PassFlg == 0 ? "N" : "Y";
                                DataADO.GetInstant().UpdateBy<act_BaseObject>(this.rco5_3BaseObject, this.BuVO);
                                writeEventLog("2.1.3 Update ข้อมูลพาเลท จาก จุดซ้อนพาเลท");
                            }

                            this.StepTxt = "3.3";
                            
                            break;
                    }

                            break;


                case "3":
                    switch (this.StepTxt)
                    {
                        case "3.1":
                            this.PostCommand(McCommandType.CM_11);
                            this.cmdReject = 0;
                            this.PassFlg = 0;
                            this.errCode = 0;
                            this.StepTxt = "0.0";
                            //if (iStep == 0)
                            //{
                            //    this.PostCommand(McCommandType.CM_11, (mc) => {
                            //        if (mc.McObj.DV_Pre_Status == 98)
                            //        {
                            //            iStep = 1;
                            //            return LoopResult.Break;
                            //        }
                            //        return LoopResult.Continue;
                            //    });
                            //}else if (iStep == 1)
                            //{
                            //    this.PostCommand(McCommandType.CM_1, (mc) => {
                            //        if (mc.McObj.DV_Pre_Status == 1)
                            //        {
                            //            iStep = 0;
                            //            this.cmdReject = 0;
                            //            this.PassFlg = 0;
                            //            this.errCode = 0;
                            //            this.StepTxt = "0.0";
                            //            return LoopResult.Break;
                            //        }
                            //        return LoopResult.Continue;
                            //    });
                            //}



                            break;

                        case "3.2":
                            //this.PostCommand(McCommandType.CM_10);
                            this.PostCommand(McCommandType.CM_1, ListKeyValue<string, object>
                                    .New("Set_PalletID", "A000000020")
                                    .Add("Set_Comm", 1));

                            //this.PostCommand(McCommandType.CM_10, (mc) => {
                            //    if (mc.McObj.DV_Pre_Status == 110)
                            //    {
                            //        this.PostCommand(McCommandType.CM_1);
                            //        return LoopResult.Break;
                            //    }
                            //    return LoopResult.Continue;
                            //});

                            this.cmdReject = 0;
                            this.PassFlg = 0;
                            this.errCode = 0;
                            this.StepTxt = "0.0";


                            //if (iStep == 0)
                            //{
                            //    this.PostCommand(McCommandType.CM_10, (mc) => {
                            //        if (mc.McObj.DV_Pre_Status == 98)
                            //        {
                            //            iStep = 1;
                            //            return LoopResult.Break;
                            //        }
                            //        return LoopResult.Continue;
                            //    });
                            //}
                            //else if (iStep == 1)
                            //{
                            //    this.PostCommand(McCommandType.CM_1, (mc) => {
                            //        if (mc.McObj.DV_Pre_Status == 1)
                            //        {
                            //            iStep = 0;
                            //            this.cmdReject = 0;
                            //            this.PassFlg = 0;
                            //            this.errCode = 0;
                            //            this.StepTxt = "0.0";
                            //            return LoopResult.Break;
                            //        }
                            //        return LoopResult.Continue;
                            //    });
                            //}

                            break;

                        case "3.3":
                            if (this.McObj.DV_Pre_Status == 98)
                            {

                                this.PostCommand(McCommandType.CM_1, ListKeyValue<string, object>
                                    .New("Set_PalletID", "A000000020")
                                    .Add("Set_Comm", 1));
                                
                                this.cmdReject = 0;
                                this.PassFlg = 0;
                                this.errCode = 0;
                                this.StepTxt = "0.0";

                                //this.PostCommand(McCommandType.CM_1, (mc) => {
                                //    if (mc.McObj.DV_Pre_Status == 1)
                                //    {
                                //        this.cmdReject = 0;
                                //        this.PassFlg = 0;
                                //        this.errCode = 0;
                                //        this.StepTxt = "0.0";
                                //        return LoopResult.Break;
                                //    }
                                //    return LoopResult.Continue;
                                //});
                            }


                            break;
                    }
                    break;



            }
        }
        protected override void OnStart()
        {
            this.StepTxt = "0.0";
        }
        protected override void OnEnd()
        {
        }

        #region Declare variable
        private int dimentionEjectStatus;
        private bool dimentionEjectFlg;
        private float disCharge;
        private int errCode;
        private int cmdReject;
        private string LabelData;
        private act_BuWork rco5_3BuWork;
        private act_BaseObject rco5_3BaseObject;
        private int PassFlg;
        private long? BuWork_ID;
        private long? BaseObject_ID;
        private string BarProd;
        int WarehouseID = InboundUtil.AppWHID; // For Test 1
        string mainStep;

        int iStep = 0;
        #endregion

        #region Methods
        private void writeEventLog(string _msg)
        {
            string msg = " > Working step " + this.StepTxt + " | Message =" + _msg;

            DisplayController.Events_Write(this.Code, msg);
        }

        private void clear()
        {
            if (this.McObj.DV_Pre_Status == 96)
            {
                //คำสั่งงานล่าสุดยังไม่เรียบร้อย
                writeEventLog(" ทำคำสั่งงานล่าสุดที่ยังไม่เรียบร้อย");
                this.PostCommand(McCommandType.CM_3);
                
            }
            else if (this.McObj.DV_Pre_Status == 99)
            {
                //ทำงานเสร็จแล้ว ยืนยันจบงาน
                writeEventLog(" ยืนยันจบงาน");
                this.PostCommand(McCommandType.CM_99);
                
            }
        }

        private void Reject(string detail)
        {
            writeEventLog(detail + " : " + this.errCode);
            this.StepTxt = "4.2";
        }

        private act_BuWork getRCO5_3BuWork()
        {
            var rco5_3BuWork = DataADO.GetInstant().SelectBy<act_BuWork>(
                               new SQLConditionCriteria[]
                               {
                                    new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN),
                                    new SQLConditionCriteria("Des_Warehouse_ID",  this.Cur_Area.Warehouse_ID, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("IOType",  IOType.INBOUND, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("LabelData",this.McObj.DV_Pre_BarProd, SQLOperatorType.EQUALS)
                               }
                               , this.BuVO).FirstOrDefault();

            return rco5_3BuWork;
        }

        private act_McWork getRCO5_3McWork()
        {
            var mcWork = DataADO.GetInstant().SelectBy<act_McWork>(
                        new SQLConditionCriteria[]
                        {
                                new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN),
                                new SQLConditionCriteria("QueueType",  QueueType.QT_1, SQLOperatorType.EQUALS),
                                new SQLConditionCriteria("IOType",  IOType.INBOUND, SQLOperatorType.EQUALS),
                                new SQLConditionCriteria("EventStatus",  22, SQLOperatorType.NOTEQUALS),
                                new SQLConditionCriteria("Sou_Location_ID",this.McObj.Cur_Location_ID.GetValueOrDefault(), SQLOperatorType.EQUALS)
                        }
                    , this.BuVO).FirstOrDefault();

            return mcWork;
        }

        private act_BaseObject getRCO5_3BaseObjectByMc()
        {
            var _baseObject = ADO.WCSDB.DataADO.GetInstant()
                        .SelectBy<act_BaseObject>(
                            new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Warehouse_ID", this.Cur_Area.Warehouse_ID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("McObject_ID", this.ID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("EventStatus", BaseObjectEventStatus.IDLE, SQLOperatorType.NOTEQUALS),
                        new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN)
                            }, BuVO)
                            .OrderBy(x => x.ID)
                            .FirstOrDefault();

            return _baseObject;
        }

        private act_BaseObject getRCO5_3BaseObjectByLabel(string LabelData)
        {
            var _baseObject = ADO.WCSDB.DataADO.GetInstant()
                        .SelectBy<act_BaseObject>(
                            new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Warehouse_ID", this.Cur_Area.Warehouse_ID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("LabelData", LabelData, SQLOperatorType.EQUALS),
                        //new SQLConditionCriteria("EventStatus", BaseObjectEventStatus.IDLE, SQLOperatorType.NOTEQUALS),
                        new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN)
                            }, BuVO)
                            .OrderBy(x => x.ID)
                            .FirstOrDefault();

            return _baseObject;
        }
        #endregion

    }
}
