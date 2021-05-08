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
    public class McSRMInbound : BaseMcRuntime
    {
        protected override McTypeEnum McType => McTypeEnum.CV;

        public McSRMInbound(acs_McMaster mcMst) : base(mcMst)
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
        private acs_McMaster _mcPS { get; set; }
        #endregion

        #region Methods
        private void Mc_OnRun()
        {
            if (this.McObj == null) { return; }

            switch (this.McObj.DV_Pre_Status)
            {
                case 22:
                    //Check Pallet stand
                    _mcPS = this.findPalletStand(baseObj);
                    if(_mcPS == null) { return; }

                    var ps = McRuntimeController.GetInstant().GetMcRuntime(_mcPS.Code);
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

        private acs_McMaster findPalletStand(act_BaseObject _bo)
        {
            var mcSRM = DataADO.GetInstant().SelectBy<acs_McMaster>(
                       ListKeyValue<string, object>
                       .New("Warehouse_ID", (_bo != null ? _bo.Warehouse_ID : 0))
                       .Add("Info1", "IN")
                       , this.BuVO).FirstOrDefault(x => x.Code.StartsWith("PS"));

            return mcSRM;
        }
        #endregion
    }


}
