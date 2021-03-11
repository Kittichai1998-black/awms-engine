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

        private long? _mcShuFreeID_tmp = null;
        protected override void OnRun()
        {
            if (this.McWork4Receive != null && this.McWork4Receive.EventStatus == McWorkEventStatus.ACTIVE_RECEIVE)
            {
                var decArea = this.StaticValue.GetArea(this.McWork4Receive.Des_Area_ID);
                var decLoc = this.StaticValue.GetLocation(this.McWork4Receive.Des_Location_ID.Value);
                var _mcShuInRow = McRuntimeController.GetInstant().ListMcRuntimeByLocation(decArea.Warehouse_ID, null, decLoc.GetBay(), decLoc.GetLv()).FirstOrDefault();

                if (this.McObj.DV_Pre_Status == 90)
                {
                    if (_mcShuInRow != null && _mcShuInRow.McObj.DV_Pre_Zone == 2)
                    {
                        this.McWork4Receive_MoveBaseObjectToRack(_mcShuInRow);
                    }
                    else if (_mcShuInRow != null && _mcShuInRow.McObj.DV_Pre_Zone != 2)
                    {
                        _mcShuInRow.PostCommand(McCommandType.CM_2, null);
                    }
                    else
                    {
                        var _mcShuFree =
                                       _mcShuFreeID_tmp.HasValue ?
                                       McRuntimeController.GetInstant().GetMcRuntime(_mcShuFreeID_tmp.Value) :
                                       McRuntimeController.GetInstant().ListMcRuntimeByWarehouse(this.Cur_Area.ID.Value).FirstOrDefault(x => x.McWork4Receive == null && x.McWork4Work == null && x.Code.StartsWith("SHU"));
                        if (_mcShuFree != null)
                            McWork4Receive_MoveShuToRack(_mcShuFree);
                    } 
                }
            }
            else if(this.McWork4Work != null && this.McWork4Work.EventStatus == McWorkEventStatus.ACTIVE_WORKING)
            {
                if (this.McObj.DV_Pre_Status == 90)
                {
                    var decArea = this.StaticValue.GetArea(this.McWork4Work.Des_Area_ID);
                    var decLoc = this.StaticValue.GetLocation(this.McWork4Work.Des_Location_ID.Value);
                    var _mcShuInRow = McRuntimeController.GetInstant().ListMcRuntimeByLocation(decArea.Warehouse_ID, null, decLoc.GetBay(), decLoc.GetLv()).FirstOrDefault();
                    this.McWork_2_WorkingToWorked();
                    this.McWork_3_WorkedToReceive_NextMC(_mcShuInRow.ID);
                }
            }
        }


        private bool _move_shu_to_des_working = false;
        private bool _wait_srm_90 = false;
        private void McWork4Receive_MoveShuToRack(BaseMcRuntime _mcShuFree)
        {
            if (_mcShuFree.McObj.DV_Pre_Status == 90 && _mcShuFree.McObj.DV_Pre_Zone != 1 && _mcShuFree.McObj.DV_Pre_Zone != 999)
            {
                _mcShuFree.PostCommand(McCommandType.CM_62, null);
            }
            else if (_mcShuFree.McObj.DV_Pre_Status == 90 && _mcShuFree.McObj.DV_Pre_Zone == 1)
            {
                _mcShuFree.PostCommand(McCommandType.CM_60, null);
                this._move_shu_to_des_working = false;
            }
            else if (_mcShuFree.McObj.DV_Pre_Status == 82 && !_move_shu_to_des_working)
            {
                var _srm_souLocCode = _mcShuFree.Cur_Location.Code.Get2<int>() % 1000000;
                _srm_souLocCode += 2000000;
                var desLoc = this.StaticValue.GetLocation(this.McWork4Receive.Des_Location_ID.Value);
                var _srm_desLocCode = desLoc.Code.Get2<int>() % 1000000;
                _srm_desLocCode += 2000000;
                _wait_srm_90 = true;
                this.PostCommand(McCommandType.CM_1, _srm_souLocCode, _srm_desLocCode, 3, "0000000000", 1000, (srm)=> {
                    if (srm.McObj.DV_Pre_Status != 90) return LoopResult.Continue;
                    _wait_srm_90 = false;
                    return LoopResult.Break;
                });
                this._move_shu_to_des_working = true;
            }
            else if(_mcShuFree.McObj.DV_Pre_Status == 82 && !_wait_srm_90)
            {
                var desLoc = this.StaticValue.GetLocation(this.McWork4Receive.Des_Location_ID.Value);
                var _srm_desLocCode = desLoc.Code.Get2<int>() % 1000000;
                _srm_desLocCode += 2000000;
                _mcShuFree.PostCommand(McCommandType.CM_1, ListKeyValue<string, object>.New("Set_SouLoc", _srm_desLocCode % 1000000).Add("Set_ShtDi", 1), null);
                _mcShuFree.McObj.Cur_Location_ID = this.StaticValue.GetLocation( _srm_desLocCode.ToString("000000000")).ID.Value;
                _mcShuFreeID_tmp = null;
            }
        }
        private void McWork4Receive_MoveBaseObjectToRack(BaseMcRuntime _mcShuInRow)
        {
            //var nextLocID = this.McWork4Receive.GetCur_TreeRoute().First().Value;
            var souLoc = this.StaticValue.GetLocation(this.McWork4Receive.Cur_Location_ID);
            var nextLoc = this.StaticValue.GetLocation(this.McWork4Receive.Des_Location_ID.Value);
            var desLoc = (nextLoc.Code.Get2<int>()%1000000)+2000000;
            var baseObj = ADO.WCSDB.BaseObjectADO.GetInstant().GetByID(this.McWork4Receive.BaseObject_ID, this.BuVO);
            this.PostCommand(McCommandType.CM_1, souLoc.Code.Get2<int>(), desLoc, 1, baseObj.Code, 1500, 
                (mc)=>
                {
                    if (mc.McObj.DV_Pre_Status == 90 && mc.EventStatus == McObjectEventStatus.IDEL) return LoopResult.Continue;
                    this.McWork_1_ReceiveToWorking();
                    return LoopResult.Break;
                });
            
        }
        protected override void OnStart()
        {
        }
    }
}
