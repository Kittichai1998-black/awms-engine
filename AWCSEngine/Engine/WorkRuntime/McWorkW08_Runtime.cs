using ADO.WCSDB;
using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using AMWUtil.Common;
using AWCSEngine.Engine.McRuntime;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;

namespace AWCSEngine.Engine.WorkRuntime
{
    public class McWorkW08_Runtime : BaseWorkRuntime
    {
        public McWorkW08_Runtime(string logref) : base(logref)
        {
        }

        private BaseMcRuntime McSrmIn { get; set; }
        private BaseMcRuntime McSrmOut { get; set; }
        private List<BaseMcRuntime> McShus { get; set; }
        private List<BaseMcRuntime> McGateManualIn { get; set; }
        private List<BaseMcRuntime> McGateAutoIn { get; set; }
        private List<BaseMcRuntime> McCVGOut { get; set; }

        private List<BaseMcRuntime> McAll { get; set; }

        protected override void OnStart()
        {
            this.McGateManualIn = new List<BaseMcRuntime>();
            this.McGateManualIn.Add(McController.GetMcRuntime("RC8-2"));

            this.McGateAutoIn = new List<BaseMcRuntime>();
            this.McGateAutoIn.Add(McController.GetMcRuntime("RC8-1"));

            this.McSrmIn = McController.GetMcRuntime("SRM11");

            this.McShus = new List<BaseMcRuntime>();
            this.McShus.Add(McController.GetMcRuntime("SHU#11"));

            this.McSrmOut = null;

            this.McCVGOut = null;

            this.McAll = new List<BaseMcRuntime>();
            this.McAll.AddRange(McGateManualIn);
            this.McAll.AddRange(McGateAutoIn);
            this.McAll.Add(McSrmIn);
            this.McAll.AddRange(McShus);
        }

        protected override void OnRun()
        {
            this.Inbound_OnRun();
        }

        private void Inbound_OnRun()
        {
            /*var mcWork_Workeds = McWorkADO.GetInstant().ListWorked_inWarehouse("W8", this.BuVO);
            var wh8 = this.StaticValue.GetWarehouse("W8");
            mcWork_Workeds.ForEach(work =>
            {
                var _mcGateIn = this.McGateManualIn.FirstOrDefault(x => x.McWork4Work != null && x.McWork4Work.ID == work.ID);
                if (_mcGateIn != null && _mcGateIn.McWork4Work != null && _mcGateIn.McWork4Work.EventStatus == McWorkEventStatus.ACTIVE_WORKED)//รับเข้า Gate INBOUND
                {
                    var workDesLoc = this.StaticValue.GetLocation(work.Des_Location_ID.Value);
                    var _mcShuInRow = McController.ListMcRuntimeByLocation(wh8.ID.Value, null, workDesLoc.GetBay(), workDesLoc.GetLv()).FirstOrDefault();
                    if (_mcShuInRow == null)//ไม่พบ Shuttle บนแถว
                    {
                        var _mcShuFree = this.McShus.FirstOrDefault(x => x.McWork4Receive == null && x.McWork4Work == null);
                        if (_mcShuFree != null)//มี SHU ที่สามารถย้ายได้
                        {
                            _mcGateIn.McWork_3_WorkedToKeep();
                            _mcShuFree.PostCommand(McCommandType.CM_62,//SHU กลับ Stanby หน้า
                                (_mcShuFree_90) =>
                                {
                                    if (_mcShuFree_90.McObj.DV_Pre_Status != 90) return LoopResult.Continue;

                                    _mcShuFree_90.PostCommand(McCommandType.CM_60,
                                        (_mcShuFree_82) =>//ปิดเครื่อง SHU เพื่อย้าย
                                            {
                                                if (_mcShuFree_82.McObj.DV_Pre_Status != 82) return LoopResult.Continue;

                                                var _srm_souLocCode = _mcShuFree_82.Cur_Location.Code.Get2<int>() % 1000000;
                                                _srm_souLocCode += 2000000;
                                                var _srm_desLocCode = workDesLoc.Code.Get2<int>() % 1000000;
                                                _srm_desLocCode += 2000000;
                                                this.McSrmOut.PostCommand(McCommandType.CM_1,
                                                    _srm_souLocCode, _srm_desLocCode, 3, "0000000000", 1000,
                                                    (_mcSrmOut_90) =>//SRM ย้าย SHU
                                                    {
                                                        if (_mcSrmOut_90.McObj.DV_Pre_Status != 90) return LoopResult.Continue;
                                                        _mcShuFree_82.PostCommand(McCommandType.CM_1,
                                                                ListKeyValue<string, object>
                                                                .New("Set_SouLoc", _srm_desLocCode % 1000000)
                                                                .Add("Set_ShtDi", 1),
                                                                (_mcShuFree_90) =>//เปิด SHU
                                                                    {
                                                                        if (_mcShuFree_90.McObj.DV_Pre_Status != 90) return LoopResult.Continue;
                                                                        _mcGateIn.McWork_0_WorkedToReceive_NextMC(_mcSrmOut_90.ID);
                                                                        return LoopResult.Break;
                                                                });
                                                        return LoopResult.Break;
                                                    });
                                                return LoopResult.Break;
                                        });
                                    return LoopResult.Break;//end _mcShuFree_90
                                });
                        }
                    }
                    else if (_mcShuInRow != null)//พบ shuttle ในแถว
                    {
                        _mcShuInRow.PostCommand(McCommandType.CM_2,
                        (_mcShuFree_90) =>//SHU กลับ Home
                        {
                            if (_mcShuFree_90.McObj.DV_Pre_Status != 90) return LoopResult.Continue;
                                _mcGateIn.McWork_0_WorkedToReceive_NextMC(this.McSrmOut.ID);
                            return LoopResult.Break;
                        });
                    }
                }
            });*/
        }

        protected override void OnStop()
        {
        }
    }
}
