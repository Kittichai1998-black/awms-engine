using ADO.WCSDB;
using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using AMWUtil.Common;
using AWCSEngine.Controller;
using System.Linq;

namespace AWCSEngine.Engine.McRuntime
{
    public class McSrmCommon : BaseMcRuntime
    {
        protected override McTypeEnum McType => McTypeEnum.SRM;

        public McSrmCommon(acs_McMaster mcMst) : base(mcMst)
        {
        }

        protected override void OnEnd()
        {
        }

        private long? _mcShuFreeID_wh8_in = null;
        protected override void OnRun()
        {
            if (this.Code == "SRM11")
                this.OnRun_WH8_Inbound();
        }

        private BaseMcRuntime mcGateOutFree = null;


        protected void OnRun_WH8_Inbound()
        {
            if (this.McObj.DV_Pre_Status == 22)
            {
                var ps = McRuntimeController.GetInstant().GetMcRuntime("PS8-1");
                if (ps.McObj.DV_Pre_Status == 1)
                {
                    ps.PostCommand(McCommandType.CM_2, 0, 0, 1, "PL00000000", 1500, (mc) =>
                    {
                        if (this.McObj.DV_Pre_Status == 99)
                        {
                            this.PostCommand(McCommandType.CM_99);
                            return LoopResult.Break;
                        }
                        return LoopResult.Continue;
                    });
                }
            }
            //3 SRM กำลังรับงาน
            else if (this.McWork4Work != null && this.McWork4Work.EventStatus == McWorkEventStatus.ACTIVE_WORKING)
            {
                var decArea = this.StaticValue.GetArea(this.McWork4Work.Des_Area_ID);
                var decLoc = this.StaticValue.GetLocation(this.McWork4Work.Des_Location_ID.Value);

                BaseMcRuntime _mcShuInRow = McRuntimeController.GetInstant()
                    .ListMcRuntimeByLocation(decArea.Warehouse_ID, null, decLoc.GetBay(), decLoc.GetLv())
                    .FirstOrDefault(x =>
                                  x.IsOnline &&
                                  x.Code.StartsWith("SHU") &&
                                  (x.McMst.Info1 ?? "").ToUpper() == "IN");
                if (_mcShuInRow == null || _mcShuInRow.McObj.IsBatteryLow)
                    return;

                //3.1 แถวถูก แต่ zone ไม่ถูก / สั่งรถหลบ
                if (_mcShuInRow.McObj.DV_Pre_Zone != 2 && _mcShuInRow.McObj.DV_Pre_Status == 90 && StepTxt != "3.1")
                {
                    _mcShuInRow.PostCommand(McCommandType.CM_2, () => this.StepTxt = "3.1");
                }
                //3.2 แถวถูก โซนถูก สั่ง SRM ย้ายพาเลท
                else if (this.McObj.DV_Pre_Status == 90 && _mcShuInRow.McObj.DV_Pre_Zone == 2 && StepTxt != "3.2")
                {

                    var desArea = this.StaticValue.GetArea(this.McWork4Work.Des_Area_ID);
                    var desLoc = this.StaticValue.GetLocation(this.McWork4Work.Des_Location_ID.Value);
                    var souLocPLC = this.StaticValue.GetLocation(this.McWork4Work.Sou_Location_ID).Code.Get2<int>();
                    var desLocPLC = (desLoc.Code.Get2<int>() % 1000000) + 2000000;
                    var baseObj = ADO.WCSDB.BaseObjectADO.GetInstant().GetByID(this.McWork4Work.BaseObject_ID, this.BuVO);

                    this.PostCommand(McCommandType.CM_1, souLocPLC, desLocPLC, 1, baseObj.Code, 1500, () => this.StepTxt = "3.2");
                }
                //3.3 สั่งปิดงานรับเข้า
                else if (this.McObj.DV_Pre_Status == 99 &&
                    _mcShuInRow.McObj.DV_Pre_Zone != 1 &&
                    _mcShuInRow.McObj.DV_Pre_Zone != 999 && StepTxt == "3.2" && StepTxt != "3.3")
                {
                    if(_mcShuInRow.McWork4Receive == null && _mcShuInRow.McWork4Work == null)
                    {
                        var desArea = this.StaticValue.GetArea(this.McWork4Work.Des_Area_ID);
                        var desLoc = this.StaticValue.GetLocation(this.McWork4Work.Des_Location_ID.Value);
                        var souLocPLC = this.StaticValue.GetLocation(this.McWork4Work.Sou_Location_ID).Code.Get2<int>();
                        var desLocPLC = (desLoc.Code.Get2<int>() % 1000000) + 2000000;
                        var baseObj = ADO.WCSDB.BaseObjectADO.GetInstant().GetByID(this.McWork4Work.BaseObject_ID, this.BuVO);

                        //this.PostCommand(McCommandType.CM_99);

                        //สั่งกลับ home เมื่อทำงานเสร็จ
                        this.PostCommand(McCommandType.CM_99, (mc) => {
                            if (mc.McObj.DV_Pre_Status == 90)
                            {
                                this.PostCommand(McCommandType.CM_2, () => { });
                                return LoopResult.Break;
                            }
                            return LoopResult.Continue;
                        });
                        this.McWork_2_WorkingToWorked();
                        this.McWork_3_WorkedToReceive_NextMC(_mcShuInRow.ID);
                        this.StepTxt = "3.3";
                    }
                }
            }
            //1-2 SRM รอรับงาน
            else if (this.McWork4Receive != null && this.McWork4Receive.EventStatus == McWorkEventStatus.ACTIVE_RECEIVE)
            {
                //ON Work
                var decArea = this.StaticValue.GetArea(this.McWork4Receive.Des_Area_ID);
                var decLoc = this.StaticValue.GetLocation(this.McWork4Receive.Des_Location_ID.Value);
                BaseMcRuntime _mcShuInRow = McRuntimeController.GetInstant()
                    .ListMcRuntimeByLocation(decArea.Warehouse_ID, null, decLoc.GetBay(), decLoc.GetLv())
                    .FirstOrDefault(x =>
                                  x.Code.StartsWith("SHU") &&
                                  (x.McMst.Info1 ?? "").ToUpper() == "IN");
                //1.ไม่พบ Shut ในแถว
                if (_mcShuInRow == null)
                {
                    BaseMcRuntime _mcShuFree =
                              _mcShuFreeID_wh8_in.HasValue ?
                              McRuntimeController.GetInstant().GetMcRuntime(_mcShuFreeID_wh8_in.Value) :
                              McRuntimeController.GetInstant().ListMcRuntimeByWarehouse(this.Cur_Area.ID.Value)
                              .OrderBy(x => x.McObj.CommandActionTime)
                              .FirstOrDefault(x =>
                                  x.IsOnline &&
                                  x.McWork4Receive == null &&
                                  x.McWork4Work == null &&
                                  //x.McObj.DV_Pre_Battery > 15.0f &&
                                  x.Code.StartsWith("SHU") &&
                                  (x.McMst.Info1 ?? "").ToUpper() == "IN");// && x.McObj.Battery > 20);

                    if (_mcShuFree != null && !_mcShuFree.IsOnline)
                    {
                        _mcShuFreeID_wh8_in = null;
                        _mcShuFree = null;
                    }

                    // 1 ไม่พบรถในแถว พบรถที่ว่าง
                    if (_mcShuFree != null)
                    {
                        if (!_mcShuFreeID_wh8_in.HasValue)
                        {
                            _mcShuFreeID_wh8_in = _mcShuFree.ID;
                            DisplayController.Events_Write(this.Code + " > Select SHU Free=" + _mcShuFree.Code);
                        }
                        //1.1 รถว่าง พร้อมทำงาน แต่ zone ไม่ถูกต้อง
                        if (_mcShuFree.McObj.DV_Pre_Status == 90 && _mcShuFree.McObj.DV_Pre_Zone != 1 && StepTxt != "1.1")
                        {
                            if (_mcShuFree.PostCommand(McCommandType.CM_62))
                            {
                                StepTxt = "1.1";
                            }
                        }
                        //1.2 รถว่าง พร้อมทำงาน และ zone ถูกต้อง / สั่งปิดเครื่อง
                        else if (_mcShuFree.McObj.DV_Pre_Status == 90 && _mcShuFree.McObj.DV_Pre_Zone == 1 && StepTxt != "1.2")
                        {
                            _mcShuFree.PostCommand(McCommandType.CM_60, () => this.StepTxt = "1.2");
                        }
                        //1.3 รถว่าง รถถูกปิด / สั่งเครนเตรียมย้าย
                        else if (_mcShuFree.McObj.DV_Pre_Status == 82 && _mcShuFree.McObj.DV_Pre_Zone == 1 && StepTxt != "1.3")
                        {
                            var _srm_souLocCode = _mcShuFree.Cur_Location.Code.Get2<int>() % 1000000;
                            _srm_souLocCode += 2000000;
                            var desLoc = this.StaticValue.GetLocation(this.McWork4Receive.Des_Location_ID.Value);
                            var _srm_desLocCode = desLoc.Code.Get2<int>() % 1000000;
                            _srm_desLocCode += 2000000;
                            this.PostCommand(McCommandType.CM_1,
                                _srm_souLocCode,
                                _srm_desLocCode,
                                3, "0000000000", 1000, null, () => this.StepTxt = "1.3");
                        }
                        //1.4 วาง shuttle ที่ปลายทางเสร็จ / update location shuttle
                        if (this.McObj.DV_Pre_Status == 99 && this.StepTxt == "1.3" && this.StepTxt != "1.4")
                        {
                            var desLoc = this.StaticValue.GetLocation(this.McWork4Receive.Des_Location_ID.Value);
                            var _srm_desLocCode = (desLoc.Code.Get2<int>() % 1000000) + 2000000;
                            var wh = this.StaticValue.GetWarehouse(this.Cur_Area.Warehouse_ID);
                            _mcShuFree.McObj.Cur_Location_ID = this.StaticValue.GetLocation(wh.Code, _srm_desLocCode.ToString("000000000")).ID.Value;
                            this.PostCommand(McCommandType.CM_99, () => this.StepTxt = "1.4");
                        }
                        //1.5 รถปิดอยู่และไม่อยู่ zone 1 / เปิดรถสั่งกลับ home เตรียมย้าย
                        else if (_mcShuFree.McObj.DV_Pre_Status == 82 && _mcShuFree.McObj.DV_Pre_Zone != 1 && StepTxt != "1.4")
                        {
                            _mcShuFree.PostCommand(McCommandType.CM_1, ListKeyValue<string, object>
                                .New("Set_SouLoc", _mcShuFree.Cur_Location.Code.Get2<int>() % 1000000)
                                .Add("Set_ShtDi", 1), () => this.StepTxt = "1.5");
                            _mcShuFreeID_wh8_in = null;
                        }

                    }
                }
                //2.พบ Shut ในแถว
                else if (_mcShuInRow != null)
                {
                    //if (_mcShuInRow.McObj.Battery <= 20) return;
                    //2.1 สั่งสตาร์รถ โซนด้านหน้า
                    if (_mcShuInRow.McObj.DV_Pre_Status == 82 && StepTxt != "2.1")
                    {
                        _mcShuInRow.PostCommand(McCommandType.CM_1, ListKeyValue<string, object>
                            .New("Set_SouLoc", _mcShuInRow.Cur_Location.Code.Get2<int>() % 1000000)
                            .Add("Set_ShtDi", 1), () => this.StepTxt = "2.1");
                        //--Clear Shuttle Free ที่เคยเลือก
                        _mcShuFreeID_wh8_in = null;
                    }
                    //2.2 รถ สถานะพร้อมทำงาน แต่รถไม่อยู่ที่ home / สั่งกลับ home
                    else if (_mcShuInRow.McObj.DV_Pre_Status == 90 && _mcShuInRow.McObj.DV_Pre_Zone != 2 && StepTxt != "2.2")
                    {
                        _mcShuInRow.PostCommand(McCommandType.CM_2, () => this.StepTxt = "2.2");
                    }
                    //2.3 รถ สถานะพร้อมทำงาน และอยู่ home ด้านหน้า / รับงานให้ SRM
                    else if (_mcShuInRow.McObj.DV_Pre_Status == 90 && _mcShuInRow.McObj.DV_Pre_Zone == 2 && StepTxt != "2.3")
                    {
                        this.McWork_1_ReceiveToWorking();
                        this.StepTxt = "2.3";
                    }
                    /*else if(_mcShuInRow.McObj.DV_Pre_Zone != 1 && _mcShuInRow.McObj.DV_Pre_Zone != 999 && StepTxt != "2.3")
                    {
                        var desLoc = this.StaticValue.GetLocation(this.McWork4Receive.Des_Location_ID.Value);
                        var desLocCode = "002"+desLoc.Code.Substring(3);
                        var desWh = this.StaticValue.GetWarehouse(this.Cur_Area.Warehouse_ID);
                        var desLoc2 = this.StaticValue.GetLocation(desWh.Code, desLocCode);
                        var baseObjInLoc2 = BaseObjectADO.GetInstant().GetByLocation(desLoc2.ID.Value,this.BuVO);
                        if(baseObjInLoc2 == null)
                        {
                            this.McWork_1_ReceiveToWorking();
                            this.StepTxt = "2.3";
                        }
                    }*/
                }
            }
            
        }

        protected override void OnStart()
        {
        }
    }
}
