using ADO.WCSDB;
using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.Exception;
using AWCSEngine.Controller;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AWCSEngine.Engine.McRuntime
{
    public class McConveyorManualInbound : BaseMcRuntime
    {
        protected override McTypeEnum McType => McTypeEnum.CV;

        public McConveyorManualInbound(acs_McMaster mcMst) : base(mcMst)
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
        protected string LogCode => this.Code + "_";
        private act_McWork mcWork { get; set; }
        private acs_McMaster _mcSRM { get; set; }
        private act_BuWork buWork { get; set; }
        private act_BaseObject baseObj { get; set; }
        private int errCode { get; set; }
        private int cmdReject { get; set; }
        private int PassFlg { get; set; }
        private long? BuWork_ID { get; set; }
        private long? BaseObject_ID { get; set; }
        private int disCharge { get; set; }
        #endregion

        #region Methods
        private void Mc_OnRun()
        {
            if (this.McObj == null ) { return; }

            switch (this.McObj.DV_Pre_Status)
            {
                case 4:
                case 14:
                    //ส่งงานให้ SRM
                    sendSRM();
                    
                    break;
                case 96:
                    //คำสั่งงานล่าสุดยังไม่เรียบร้อย
                    this.PostCommand(McCommandType.CM_3);
                    break;

                case 98:
                    if (!string.IsNullOrWhiteSpace(this.McObj.DV_Pre_BarProd))
                    {
                        

                        checkBarProd();
                        
                        //ถ้าไม่พบข้อผิดพลาด สั่งให้ทำงานต่อ
                        if (this.PassFlg == 1)
                        {
                            checkQueue();
                        }
                        else
                        {
                            //ถ้าพบข้อผิดพลาด ให้ Reject
                            if (this.cmdReject != 0)
                            {
                                McCommandType cmd = (McCommandType)this.cmdReject;
                                this.PostCommand(cmd);
                            }
                            else
                            {
                                this.PostCommand(McCommandType.CM_14);
                            }
                            writeEventLog(baseObj, buWork, "Reject พาเลทสินค้า");
                        }

                        
                    }

                        break;
            }
        }

        private void writeEventLog(act_BaseObject _bo, act_BuWork _bu, string _msg)
        {
            string msg = this.Code + " > Working | LABEL =" + this.McObj.DV_Pre_BarProd + " | DisCharge =" + (_bo != null ? _bo.DisCharge : "");
            msg += " | BuWork_ID =" + (_bo != null ? _bo.BuWork_ID : "") + " | BaseObject_ID =" + (_bo != null ? _bo.ID : "") + " | Checking Status =" + (_bo != null ? _bo.PassFlag : "");
            msg += " | WorkQueue_ID =" + (_bo != null ? _bu.WMS_WorkQueue_ID : "") + " | Message =" + _msg;

            DisplayController.Events_Write(msg);
        }

        private void checkBarProd()
        {
            this.StepTxt = this.LogCode + "1.1";
            //ตรวจสอบข้อมูลรับเข้า
            this.buWork = DataADO.GetInstant().SelectBy<act_BuWork>(
            ListKeyValue<string, object>
            .New("status", EntityStatus.ACTIVE)
            .Add("LabelData", this.McObj.DV_Pre_BarProd), this.BuVO).FirstOrDefault();

            if (this.buWork == null)
            {
                this.cmdReject = (int)McCommandType.CM_11;
                this.PassFlg = (int)PassFailFlag.Fail;
            }
            else
            {
                //ตรวจสอบข้อมูลพาเลทซ้ำ
                var bo = BaseObjectADO.GetInstant().GetByLabel(this.McObj.DV_Pre_BarProd, this.BuVO);
                if (bo != null)
                {
                    if (bo.EventStatus == BaseObjectEventStatus.TEMP)
                    {
                        this.baseObj = bo;
                    }
                    else
                    {
                        this.cmdReject = (int)McCommandType.CM_10;
                        this.PassFlg = (int)PassFailFlag.Fail;
                    }
                }

                this.disCharge = this.buWork.DisCharge;
                this.BuWork_ID = this.buWork == null ? 0 : this.buWork.ID;
            }

            //ตรวจสอบ Discharge
            if (this.disCharge == 0)
            {
                this.cmdReject = (int)McCommandType.CM_5;
                this.PassFlg = (int)PassFailFlag.Fail;
            }

            //ถ้าสแกนครั้งแรก สร้างข้อมูลรับเข้าพาเลทสินค้า
            if (this.baseObj == null)
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

            if (!string.IsNullOrWhiteSpace(this.McObj.DV_Pre_BarProd) && this.baseObj != null && this.buWork != null && (this.cmdReject == 0 && this.errCode == 0))
            {
                this.PassFlg = (int)PassFailFlag.Pass;
            }

            //Update ข้อมูลรับเข้า ให้กับข้อมูลพาเลทสินค้า
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

            writeEventLog(baseObj, buWork, "ตรวจสอบ พาเลทสินค้า");
        }

        private void checkQueue()
        {
            this.mcWork = DataADO.GetInstant().SelectBy<act_McWork>(
                        ListKeyValue<string, object>
                        .New("QueueType", QueueType.QT_1)
                        .Add("IOType", IOType.INBOUND)
                        .Add("Rec_McObject_ID", this.McObj.McMaster_ID)
                        , this.BuVO).FirstOrDefault();

            //ไม่มีคิวงาน
            if (this.mcWork == null)
            {

                if (baseObj != null)
                {
                    this.StepTxt = this.LogCode + "1.2";
                    if (!String.IsNullOrWhiteSpace(baseObj.PassFlag) && baseObj.PassFlag.Equals("Y"))
                    {
                        this.createWorkQueue(baseObj, buWork);
                        writeEventLog(baseObj, null, "สร้างคิวงาน Cv");
                    }
                    else
                    {
                        //Reject 
                        baseObj.Status = EntityStatus.REMOVE;
                        DataADO.GetInstant().UpdateBy<act_BaseObject>(baseObj, this.BuVO);

                        this.PostCommand(McCommandType.CM_14);
                        writeEventLog(baseObj, buWork, "Reject พาเลท");
                        this.StepTxt = string.Empty;
                    }
                }
            }
            else  //มีคิวงาน
            {
                this.StepTxt = this.LogCode + "1.3";
                //คิวพร้อมเก็บ
                if (this.mcWork.Des_Location_ID != 0 && this.mcWork.Rec_McObject_ID != 0 && this.mcWork.QueueStatus != 7)
                {
                    this.mcWork.ActualTime = DateTime.Now;
                    DataADO.GetInstant().UpdateBy<act_McWork>(this.mcWork, this.BuVO);

                    //สั่งให้ Conveyor เริ่มทำงานเก็บ
                    this.PostCommand(McCommandType.CM_1, 0, 0, 1, baseObj.Code, (int)baseObj.WeiKG, () => writeEventLog(baseObj, buWork, "Conveyor เริ่มทำงานเก็บ"));
                }
                else
                {
                    //พื้นที่จัดเก็บเต็ม
                    if (this.mcWork.QueueStatus != 7)
                    {
                        //Reject พื้นที่จัดเก็บเต็ม
                        baseObj.Status = EntityStatus.REMOVE;
                        DataADO.GetInstant().UpdateBy<act_BaseObject>(baseObj, this.BuVO);

                        this.mcWork.EventStatus = McWorkEventStatus.REMOVE_QUEUE;
                        this.mcWork.Status = EntityStatus.REMOVE;
                        DataADO.GetInstant().UpdateBy<act_McWork>(this.mcWork, this.BuVO);

                        this.PostCommand(McCommandType.CM_13);
                        writeEventLog(baseObj, buWork, "Reject พื้นที่จัดเก็บเต็ม");
                    }
                }

            }
        }

        private void createWorkQueue(act_BaseObject _bo, act_BuWork _bu)
        {
            if (_bo != null)
            {
                _bo.EventStatus = BaseObjectEventStatus.INBOUND;
                _bo.McObject_ID = this.ID;
                DataADO.GetInstant().UpdateBy<act_BaseObject>(_bo, this.BuVO);

                var bArea = this.StaticValue.GetArea(_bo.Area_ID);
                var bWh = this.StaticValue.GetWarehouse(bArea.Warehouse_ID);
                var bLocation = this.StaticValue.GetLocation(_bo.Location_ID);

                var desLoc = this.StaticValue.GetLocation(_bu.Des_Location_ID.Value);
                var desArea = this.StaticValue.GetArea(_bu.Des_Area_ID.Value);
                var desWh = this.StaticValue.GetWarehouse(_bu.Des_Warehouse_ID.Value);

                act_McWork mq = new act_McWork()
                {
                    ID = null,
                    IOType = IOType.INBOUND,
                    QueueType = (int)QueueType.QT_1,
                    WMS_WorkQueue_ID = _bu.ID.Value,
                    BuWork_ID = _bu.ID.Value,
                    TrxRef = _bu.TrxRef,

                    Priority = _bu.Priority,
                    SeqGroup = _bu.SeqGroup,
                    SeqItem = _bu.SeqIndex,

                    BaseObject_ID = _bo.ID.Value,
                    Rec_McObject_ID = this.ID,
                    Cur_McObject_ID = null,

                    Cur_Warehouse_ID = bWh.ID.Value,
                    Cur_Area_ID = _bo.Area_ID,
                    Cur_Location_ID = _bo.Location_ID,

                    Sou_Area_ID = bArea.ID.Value,
                    Sou_Location_ID = bLocation.ID.Value,

                    Des_Area_ID = desArea.ID.Value,

                    ActualTime = DateTime.Now,
                    StartTime = DateTime.Now,
                    EndTime = null,
                    EventStatus = McWorkEventStatus.ACTIVE_RECEIVE,
                    Status = EntityStatus.ACTIVE,

                    TreeRoute = "{}"
                };
                mq.ID = ADO.WCSDB.DataADO.GetInstant().Insert<act_McWork>(mq, this.BuVO);

                _bu.Status = EntityStatus.ACTIVE;
                _bu.WMS_WorkQueue_ID = mq.ID;
                DataADO.GetInstant().UpdateBy<act_BuWork>(_bu, this.BuVO);
            }
        }

        private acs_McMaster findSRM(act_BaseObject _bo)
        {
            var mcSRM = DataADO.GetInstant().SelectBy<acs_McMaster>(
                       ListKeyValue<string, object>
                       .New("Warehouse_ID", (_bo != null ? _bo.Warehouse_ID : 0))
                       .Add("Info1", "IN")
                       , this.BuVO).FirstOrDefault(x => x.Code.StartsWith("SRM"));

            return mcSRM;
        }

        private void sendSRM()
        {
            this.StepTxt = this.LogCode + "1.4";
            if (this.mcWork != null)
            {
                switch (this.mcWork.EventStatus)
                {
                    case McWorkEventStatus.ACTIVE_WORKING:
                        //จบงาน Cy
                        this.mcWork.EventStatus = McWorkEventStatus.ACTIVE_WORKED;
                        this.mcWork.ActualTime = DateTime.Now;
                        DataADO.GetInstant().UpdateBy<act_McWork>(this.mcWork, this.BuVO);

                        baseObj.Location_ID = this.McObj.Cur_Location_ID.Value;
                        baseObj.McObject_ID = null;
                        DataADO.GetInstant().UpdateBy(baseObj, this.BuVO);

                        var msg = "จบงาน Cy ";

                        //ส่งงานให้ SRM
                        _mcSRM = this.findSRM(baseObj);
                        if (_mcSRM != null)
                        {
                            var mcSrm = Controller.McRuntimeController.GetInstant().GetMcRuntime(_mcSRM.Code);
                            //SRM จอดปกติ
                            if (mcSrm.McObj.DV_Pre_Status == 90)
                            {
                                this.mcWork.Rec_McObject_ID = mcSrm.ID;
                                this.mcWork.EventStatus = McWorkEventStatus.ACTIVE_RECEIVE;
                                this.mcWork.ActualTime = DateTime.Now;

                                msg += " ส่งงานให้ SRM : " + mcSrm.Code;
                                DataADO.GetInstant().UpdateBy<act_McWork>(this.mcWork, this.BuVO);
                            }
                        }

                        writeEventLog(baseObj, buWork, msg);

                        break;

                    case McWorkEventStatus.ACTIVE_WORKED:
                        //ส่งงานให้ SRM
                        _mcSRM = this.findSRM(baseObj);
                        var msg1 = "งานค้าง ยังไม่มี SRM มารับงาน ";
                        if (_mcSRM != null)
                        {
                            var mcSrm = Controller.McRuntimeController.GetInstant().GetMcRuntime(_mcSRM.Code);
                            //SRM จอดปกติ
                            if (mcSrm.McObj.DV_Pre_Status == 90)
                            {
                                this.mcWork.Rec_McObject_ID = mcSrm.ID;
                                this.mcWork.EventStatus = McWorkEventStatus.ACTIVE_RECEIVE;
                                this.mcWork.ActualTime = DateTime.Now;

                                msg1 += " ส่งงานให้ SRM : " + mcSrm.Code;
                                DataADO.GetInstant().UpdateBy<act_McWork>(this.mcWork, this.BuVO);
                            }
                        }

                        writeEventLog(baseObj, buWork, msg1);

                        break;
                }
            }

        }
        #endregion
    }

}
