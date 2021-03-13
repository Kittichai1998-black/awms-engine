using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using AMWUtil.Common;
using AWCSEngine.Controller;
using System.Linq;

namespace AWCSEngine.Engine.McRuntime
{
    public class McSrmCommon : BaseMcRuntime
    {
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
        protected void OnRun_WH8_Outbound()
        {
            //SRM 90 พร้อมเบิก
            //Shut Zone5 / status 90
            //Shut Stand / 5
            if(this.McObj.DV_Pre_Status == 90)
            {

            }
        }
        protected void OnRun_WH8_Inbound()
        {
            //SRM รอรับงาน
            if (this.McWork4Receive != null && this.McWork4Receive.EventStatus == McWorkEventStatus.ACTIVE_RECEIVE)
            {
                //ON Work
                var decArea = this.StaticValue.GetArea(this.McWork4Receive.Des_Area_ID);
                var decLoc = this.StaticValue.GetLocation(this.McWork4Receive.Des_Location_ID.Value);
                BaseMcRuntime _mcShuInRow = McRuntimeController.GetInstant().ListMcRuntimeByLocation(decArea.Warehouse_ID, null, decLoc.GetBay(), decLoc.GetLv()).FirstOrDefault();
                
                if (_mcShuInRow == null)
                {
                    BaseMcRuntime _mcShuFree =
                              _mcShuFreeID_wh8_in.HasValue ?
                              McRuntimeController.GetInstant().GetMcRuntime(_mcShuFreeID_wh8_in.Value) :
                              McRuntimeController.GetInstant().ListMcRuntimeByWarehouse(this.Cur_Area.ID.Value)
                              .OrderBy(x => x.McObj.CommandActionTime)
                              .FirstOrDefault(x => x.McWork4Receive == null && x.McWork4Work == null && x.Code.StartsWith("SHU"));

                    // 1 ไม่พบรถในแถว พบรถที่ว่าง
                    if (_mcShuFree != null)
                    {
                        //1.1 รถว่าง พร้อมทำงาน แต่ zone ไม่ถูกต้อง
                        if (_mcShuFree.McObj.DV_Pre_Status == 90 && _mcShuFree.McObj.DV_Pre_Zone != 1 && _mcShuFree.McObj.DV_Pre_Zone != 999)
                        {
                            _mcShuFree.PostCommand(McCommandType.CM_62);
                        }
                        //1.2 รถว่าง พร้อมทำงาน และ zone ถูกต้อง / สั่งปิดเครื่อง
                        else if (_mcShuFree.McObj.DV_Pre_Status == 90 && _mcShuFree.McObj.DV_Pre_Zone == 1)
                        {
                            _mcShuFree.PostCommand(McCommandType.CM_60);
                        }
                        //1.3 รถว่าง รถถูกปิด / สั่งเครนเตรียมย้าย
                        else if (_mcShuFree.McObj.DV_Pre_Status == 82)
                        {
                            var _srm_souLocCode = _mcShuFree.Cur_Location.Code.Get2<int>() % 1000000;
                            _srm_souLocCode += 2000000;
                            var desLoc = this.StaticValue.GetLocation(this.McWork4Receive.Des_Location_ID.Value);
                            var _srm_desLocCode = desLoc.Code.Get2<int>() % 1000000;
                            _srm_desLocCode += 2000000;
                            this.PostCommand(McCommandType.CM_1, _srm_souLocCode, _srm_desLocCode, 3, "0000000000", 1000, (srm) => {
                                if (srm.McObj.DV_Pre_Status == 90 && srm.EventStatus == McObjectEventStatus.IDEL)
                                {
                                    _mcShuFree.McObj.Cur_Location_ID = this.StaticValue.GetLocation(_srm_desLocCode.ToString("000000000")).ID.Value;
                                    _mcShuFreeID_wh8_in = null;
                                    return LoopResult.Break;
                                } 
                                return LoopResult.Continue;
                            });
                        }
                    }
                }
                //2.พบ Shut ในแถว
                else if (_mcShuInRow != null)
                {
                    //2.1 สั่งสตาร์รถ โซนด้านหน้า
                    if (_mcShuInRow.McObj.DV_Pre_Status == 82)
                    {
                        _mcShuInRow.PostCommand(McCommandType.CM_1, ListKeyValue<string, object>
                            .New("Set_SouLoc", _mcShuInRow.Code.Get2<int>() % 1000000)
                            .Add("Set_ShtDi", 1), null);
                    }
                    //2.2 รถ สถานะพร้อมทำงาน แต่รถไม่อยู่ที่ home / สั่งกลับ home
                    else if (_mcShuInRow != null && _mcShuInRow.McObj.DV_Pre_Status == 90 && _mcShuInRow.McObj.DV_Pre_Zone != 2)
                    {
                        _mcShuInRow.PostCommand(McCommandType.CM_2);
                    }
                    //2.3 รถ สถานะพร้อมทำงาน และอยู่ home ด้านหน้า / รับงานให้ SRM
                    else if (_mcShuInRow != null && _mcShuInRow.McObj.DV_Pre_Status == 90 && _mcShuInRow.McObj.DV_Pre_Zone == 2)
                    {
                        this.McWork_1_ReceiveToWorking();
                    }
                }
            }
            //SRM กำลังรับงาน
            else if (this.McWork4Work != null && this.McWork4Work.EventStatus == McWorkEventStatus.ACTIVE_WORKING)
            {
                if (this.McObj.DV_Pre_Status == 90)
                {
                    var desArea = this.StaticValue.GetArea(this.McWork4Work.Des_Area_ID);
                    var desLoc = this.StaticValue.GetLocation(this.McWork4Work.Des_Location_ID.Value);
                    var souLocPLC = this.StaticValue.GetLocation(this.McWork4Work.Cur_Location_ID).Code.Get2<int>();
                    var desLocPLC = (desLoc.Code.Get2<int>() % 1000000) + 2000000;
                    var baseObj = ADO.WCSDB.BaseObjectADO.GetInstant().GetByID(this.McWork4Work.BaseObject_ID, this.BuVO);

                    this.PostCommand(McCommandType.CM_1, souLocPLC, desLocPLC, 1, baseObj.Code, 1500,
                        (mc) =>
                        {
                            if (mc.McObj.DV_Pre_Status != 90 && mc.EventStatus != McObjectEventStatus.IDEL) return LoopResult.Continue;

                            var _mcShuInRow = McRuntimeController.GetInstant().ListMcRuntimeByLocation(desArea.Warehouse_ID, null, desLoc.GetBay(), desLoc.GetLv()).FirstOrDefault();
                            this.McWork_2_WorkingToWorked();
                            this.McWork_3_WorkedToReceive_NextMC(_mcShuInRow.ID);

                            return LoopResult.Break;
                        });
                }
            }
        }

        protected override void OnStart()
        {
        }
    }
}
