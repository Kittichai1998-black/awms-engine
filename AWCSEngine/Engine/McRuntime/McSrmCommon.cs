﻿using ADO.WCSDB;
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
            else if(this.Code == "SRM12")
                this.OnRun_WH8_Outbound();
        }

        private BaseMcRuntime mcGateOutFree = null;


        protected void OnRun_WH8_Outbound()
        {
            if(this.McWork4Receive != null && this.McWork4Receive.EventStatus == McWorkEventStatus.ACTIVE_RECEIVE)
            {
                if (this.McObj.DV_Pre_Status == 90)
                {
                    var decArea = this.StaticValue.GetArea(this.McWork4Receive.Des_Area_ID);
                    var decLoc = this.StaticValue.GetLocation(this.McWork4Receive.Des_Location_ID.Value);
                    mcGateOutFree = McRuntimeController.GetInstant().ListMcRuntimeByArea(decArea.ID.Value).FirstOrDefault(x => x.McObj.DV_Pre_Status != 00);//ไม่เท่ากับเต็ม
                    if (mcGateOutFree != null)
                    {
                        var souLocPLC = (decLoc.Code.Get2<int>() % 1000000) + 47000000;
                        var desLocPLC = mcGateOutFree.Code.Get2<int>();
                        var baseOjc = BaseObjectADO.GetInstant().GetByID(this.McWork4Work.BaseObject_ID, this.BuVO);
                        this.PostCommand(McCommandType.CM_1, souLocPLC, desLocPLC, 1, baseOjc.Code, 1500, (mc) =>
                        {
                            if(mc.EventStatus == McObjectEventStatus.DONE)
                            {
                                this.McWork_1_ReceiveToWorking();
                                return LoopResult.Break;
                            }
                            return LoopResult.Continue;
                        });
                    }
                }
            }
            else if(this.McWork4Work != null && this.McWork4Work.EventStatus == McWorkEventStatus.ACTIVE_WORKING)
            {
                if(this.McObj.DV_Pre_Status == 99)
                {
                    this.PostCommand(McCommandType.CM_99, (mc) =>
                    {
                        if(mc.EventStatus == McObjectEventStatus.DONE)
                        {
                            this.McWork_2_WorkingToWorked();
                            this.McWork_3_WorkedToReceive_NextMC(mcGateOutFree.ID);
                            this.mcGateOutFree = null;
                            return LoopResult.Break;
                        }
                        return LoopResult.Continue;
                    });
                }
            }
        }

        protected void OnRun_WH8_Inbound()
        {
            if (this.McObj.DV_Pre_Status == 22)
            {
                var ps = McRuntimeController.GetInstant().GetMcRuntime("PS8-1");
                if(ps.McObj.DV_Pre_Status == 1)
                {
                    ps.PostCommand(McCommandType.CM_2, 0, 0, 1, "PL00000000", 1500,(mc)=>
                    {
                        if(this.McObj.DV_Pre_Status == 99)
                        {
                            this.PostCommand(McCommandType.CM_99);
                            return LoopResult.Break;
                        }
                        return LoopResult.Continue;
                    });
                }
            }
            //SRM รอรับงาน
            else if (this.McWork4Receive != null && this.McWork4Receive.EventStatus == McWorkEventStatus.ACTIVE_RECEIVE)
            {
                //ON Work
                var decArea = this.StaticValue.GetArea(this.McWork4Receive.Des_Area_ID);
                var decLoc = this.StaticValue.GetLocation(this.McWork4Receive.Des_Location_ID.Value);
                BaseMcRuntime _mcShuInRow = McRuntimeController.GetInstant().ListMcRuntimeByLocation(decArea.Warehouse_ID, null, decLoc.GetBay(), decLoc.GetLv()).FirstOrDefault();
                //1.ไม่พบ Shut ในแถว
                if (_mcShuInRow == null)
                {
                    BaseMcRuntime _mcShuFree =
                              _mcShuFreeID_wh8_in.HasValue ?
                              McRuntimeController.GetInstant().GetMcRuntime(_mcShuFreeID_wh8_in.Value) :
                              McRuntimeController.GetInstant().ListMcRuntimeByWarehouse(this.Cur_Area.ID.Value)
                              .OrderBy(x => x.McObj.CommandActionTime)
                              .FirstOrDefault(x =>
                                  x.McWork4Receive == null && 
                                  x.McWork4Work == null && 
                                  x.McObj.DV_Pre_Battery > 15.0f &&
                                  x.Code.StartsWith("SHU") &&
                                  (x.McMst.Info1 ?? "").ToUpper() == "IN");// && x.McObj.Battery > 20);

                    // 1 ไม่พบรถในแถว พบรถที่ว่าง
                    if (_mcShuFree != null)
                    {
                        //1.1 รถว่าง พร้อมทำงาน แต่ zone ไม่ถูกต้อง
                        if (_mcShuFree.EventStatus == McObjectEventStatus.IDEL &&
                        _mcShuFree.McObj.DV_Pre_Status == 90 && _mcShuFree.McObj.DV_Pre_Zone != 1 && StepTxt != "1.1")
                        {
                            if (_mcShuFree.PostCommand(McCommandType.CM_62))
                            {
                                StepTxt = "1.1";
                            }
                        }
                        //1.2 รถว่าง พร้อมทำงาน และ zone ถูกต้อง / สั่งปิดเครื่อง
                        else if (_mcShuFree.EventStatus == McObjectEventStatus.IDEL &&
                        _mcShuFree.McObj.DV_Pre_Status == 90 && _mcShuFree.McObj.DV_Pre_Zone == 1 && StepTxt != "1.2")
                        {
                            _mcShuFree.PostCommand(McCommandType.CM_60, ()=>this.StepTxt="1.2");
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
                                3, "0000000000", 1000,
                                (srm) =>
                                {
                                    if (srm.McObj.DV_Pre_Status == 99)
                                    {
                                        DisplayController.Events_Write($"{this.Code} > exec 1.3-99");
                                        var wh = this.StaticValue.GetWarehouse(srm.Cur_Area.Warehouse_ID);
                                        _mcShuFree.McObj.Cur_Location_ID = this.StaticValue.GetLocation(wh.Code,_srm_desLocCode.ToString("000000000")).ID.Value;
                                        _mcShuFreeID_wh8_in = null;
                                        this.PostCommand(McCommandType.CM_99);
                                        return LoopResult.Break;
                                    }
                                    return LoopResult.Continue;
                                }, ()=>this.StepTxt="1.3");
                        }
                        //1.4 รถปิดอยู่และไม่อยู่ zone 1 / เปิดรถสั่งกลับ home เตรียมย้าย
                        else if (_mcShuFree.McObj.DV_Pre_Status == 82 && _mcShuFree.McObj.DV_Pre_Zone != 1 && StepTxt != "1.4")
                        {
                            _mcShuFree.PostCommand(McCommandType.CM_1, ListKeyValue<string, object>
                                .New("Set_SouLoc", _mcShuFree.Cur_Location.Code.Get2<int>() % 1000000)
                                .Add("Set_ShtDi", 1), ()=>this.StepTxt="1.4");
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
                            .Add("Set_ShtDi", 1), ()=>this.StepTxt="2.1");
                    }
                    //2.2 รถ สถานะพร้อมทำงาน แต่รถไม่อยู่ที่ home / สั่งกลับ home
                    else if (_mcShuInRow.McObj.DV_Pre_Status == 90 && _mcShuInRow.McObj.DV_Pre_Zone != 2 && StepTxt != "2.2")
                    {
                        _mcShuInRow.PostCommand(McCommandType.CM_2, ()=>this.StepTxt="2.2");
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
            //3 SRM กำลังรับงาน
            else if (this.McWork4Work != null && this.McWork4Work.EventStatus == McWorkEventStatus.ACTIVE_WORKING)
            {
                var decArea = this.StaticValue.GetArea(this.McWork4Work.Des_Area_ID);
                var decLoc = this.StaticValue.GetLocation(this.McWork4Work.Des_Location_ID.Value);
                BaseMcRuntime _mcShuInRow = McRuntimeController.GetInstant().ListMcRuntimeByLocation(decArea.Warehouse_ID, null, decLoc.GetBay(), decLoc.GetLv()).FirstOrDefault();

                //3.1 แถวถูก แต่ zone ไม่ถูก / สั่งรถหลบ
                if(_mcShuInRow.McObj.DV_Pre_Zone != 2 && _mcShuInRow.McObj.DV_Pre_Status==90 && StepTxt != "3.1")
                {
                    _mcShuInRow.PostCommand(McCommandType.CM_2, ()=>this.StepTxt="3.1");
                }
                //3.2 แถวถูก โซนถูก สั่ง SRM ย้ายพาเลท
                else if (this.McObj.DV_Pre_Status == 90 && _mcShuInRow.McObj.DV_Pre_Zone == 2 && StepTxt != "3.2")
                {

                    var desArea = this.StaticValue.GetArea(this.McWork4Work.Des_Area_ID);
                    var desLoc = this.StaticValue.GetLocation(this.McWork4Work.Des_Location_ID.Value);
                    var souLocPLC = this.StaticValue.GetLocation(this.McWork4Work.Sou_Location_ID).Code.Get2<int>();
                    var desLocPLC = (desLoc.Code.Get2<int>() % 1000000) + 2000000;
                    var baseObj = ADO.WCSDB.BaseObjectADO.GetInstant().GetByID(this.McWork4Work.BaseObject_ID, this.BuVO);

                    this.PostCommand(McCommandType.CM_1, souLocPLC, desLocPLC, 1, baseObj.Code, 1500,
                        (mc) =>
                        {
                            if (mc.McObj.DV_Pre_Status == 99)
                            {
                                DisplayController.Events_Write($"{this.Code} > exec 3.2-99");
                                mc.PostCommand(McCommandType.CM_99);
                                //var _mcShuInRow = McRuntimeController.GetInstant().ListMcRuntimeByLocation(desArea.Warehouse_ID, null, desLoc.GetBay(), desLoc.GetLv()).FirstOrDefault();
                                var wh = this.StaticValue.GetWarehouse(desArea.Warehouse_ID);
                                var loc =this.StaticValue.GetLocation(wh.Code, desLocPLC.ToString("000000000"));
                                this.McWork_2_WorkingToWorked(loc.ID.Value);
                                this.McWork_3_WorkedToReceive_NextMC(_mcShuInRow.ID);
                                return LoopResult.Break;
                            }

                            return LoopResult.Continue;
                        }, ()=>this.StepTxt="3.2");
                }
                else if (this.McObj.DV_Pre_Status == 99 &&
                    _mcShuInRow.McObj.DV_Pre_Zone != 1 &&
                    _mcShuInRow.McObj.DV_Pre_Zone != 999 && StepTxt == "3.2" && StepTxt != "3.3")
                {
                    var desArea = this.StaticValue.GetArea(this.McWork4Work.Des_Area_ID);
                    var desLoc = this.StaticValue.GetLocation(this.McWork4Work.Des_Location_ID.Value);
                    var souLocPLC = this.StaticValue.GetLocation(this.McWork4Work.Sou_Location_ID).Code.Get2<int>();
                    var desLocPLC = (desLoc.Code.Get2<int>() % 1000000) + 2000000;
                    var baseObj = ADO.WCSDB.BaseObjectADO.GetInstant().GetByID(this.McWork4Work.BaseObject_ID, this.BuVO);

                    this.PostCommand(McCommandType.CM_99);
                    this.McWork_2_WorkingToWorked();
                    this.McWork_3_WorkedToReceive_NextMC(_mcShuInRow.ID);
                    this.StepTxt = "3.3";
                }
            }
        }

        protected override void OnStart()
        {
        }
    }
}
