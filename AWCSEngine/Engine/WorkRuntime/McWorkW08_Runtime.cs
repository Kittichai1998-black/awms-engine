using ADO.WCSDB;
using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using AWCSEngine.Engine.McRuntime;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

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

            this.McShus = null;

            this.McSrmOut = null;

            this.McCVGOut = null;


            this.McAll.AddRange(McGateManualIn);
            this.McAll.AddRange(McGateAutoIn);
            this.McAll.Add(McSrmIn);
        }

        protected override void OnRun()
        {

        }

        private void Inbound_OnRun()
        {
            return;
            var mcWorkInactives = McWorkADO.GetInstant().ListInactive_inWarehouse("W8", this.BuVO);

            this.McAll.ForEach(mc =>
            {
                if(mc.McWork4Work != null &&
                    mc.McWork4Work.EventStatus == McWorkEventStatus.ACTIVE_WORKED)
                {
                    var nextLocIds = mc.McWork4Work.GetChild_TreeRoute().Select(x => x.Value);
                    BaseMcRuntime mcNext = this.McAll.FirstOrDefault(x => x.McWork4Work == null && nextLocIds.Contains(x.Cur_Location.ID.Value));
                    if(mcNext != null)
                    {
                        mcNext.McWork_WorkedToReceive_NextMC(mc.ID);
                    }
                    else
                    {
                        ///////สำหรับ Mc Location ไม่ตรง ต้องหา Mc ที่อยู่ Area เดียวกันมารับ
                    }
                } 
            });
        }

        protected override void OnStop()
        {

        }
    }
}
