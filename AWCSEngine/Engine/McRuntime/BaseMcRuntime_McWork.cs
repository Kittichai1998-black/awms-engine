using ADO.WCSDB;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Exception;
using AWCSEngine.Controller;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine.McRuntime
{
    public abstract partial class BaseMcRuntime : BaseEngine<NullCriteria, NullCriteria>, IDisposable
    {
        public void McWork_0_Reload()
        {
            this.McWork4Work = McWorkADO.GetInstant().GetByCurMcObject(this.McMst.ID.Value, this.BuVO);
            this.McWork4Receive = McWorkADO.GetInstant().GetByDesMcObject(this.McMst.ID.Value, this.BuVO);
            if (this.McWork4Work == null && this.McWork4Work.EventStatus == McWorkEventStatus.ACTIVE_KEEP)
            {
                this.McWork4Work.EventStatus = McWorkEventStatus.ACTIVE_WORKED;
                DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork4Work, this.BuVO);
            }
        }
        public void McWork_0_WorkedToReceive_NextMC(long toMcID)
        {
            var nextMc = McRuntimeController.GetInstant().GetMcRuntime(toMcID);
            nextMc.McWork4Receive = this.McWork4Work;

            this.McWork4Work.Des_McObject_ID = toMcID;
            this.McWork4Work.EventStatus = McWorkEventStatus.ACTIVE_WORKED;
            this.McWork4Work.ActualTime = DateTime.Now;

            DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork4Work, this.BuVO);
        }
        public act_McWork McWork_1_ReceiveToWorking()
        {

            var fromMc = McRuntimeController.GetInstant().GetMcRuntime(this.McWork4Receive.Cur_McObject_ID.Value);
            if (this.McWork4Work == null && fromMc.McWork4Work.Des_McObject_ID != this.ID)
                throw new AMWException(this.Logger, AMWExceptionCode.V0_MC_CANT_WORKACTION, "McWork_ReceiveToWorking");
            this.McWork4Work = fromMc.McWork4Work;
            fromMc.McWork4Work = null;
            this.McWork4Receive = null;
            this.McWork4Work.Cur_McObject_ID = this.ID;
            this.McWork4Work.Des_McObject_ID = null;
            this.McWork4Work.EventStatus = McWorkEventStatus.ACTIVE_WORKING;
            this.McWork4Work.ActualTime = DateTime.Now;
            DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork4Work, this.BuVO);
            return this.McWork4Work;
        }
        public void McWork_2_WorkingToWorked()
        {
            if (this.McWork4Work == null || this.McWork4Work.EventStatus == McWorkEventStatus.ACTIVE_WORKED)
                throw new AMWException(this.Logger, AMWExceptionCode.V0_MC_CANT_WORKACTION, "McWork_WorkingToWorked");

            this.McObj.Cur_Location_ID = 0;
            this.McWork4Work.EventStatus = McWorkEventStatus.ACTIVE_WORKED;
            this.McWork4Work.ActualTime = DateTime.Now;
            DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork4Work, this.BuVO);
        }
        public void McWork_3_WorkedToKeep()
        {
            this.McWork4Work.EventStatus = McWorkEventStatus.ACTIVE_KEEP;
            this.McWork4Work.ActualTime = DateTime.Now;

            DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork4Work, this.BuVO);
        }
        public void McWork_4_WorkedToDone()
        {
            if (this.McWork4Work != null &&
                this.McWork4Work.EventStatus == McWorkEventStatus.ACTIVE_WORKED &&
                this.McWork4Work.Cur_Location_ID == (this.McWork4Work.Des_Location_ID ?? this.McWork4Work.Cur_Location_ID) &&
                this.McWork4Work.Cur_Area_ID == this.McWork4Work.Des_Area_ID)
            {
                this.McWork4Work.EventStatus = McWorkEventStatus.DONE_QUEUE;
                this.McWork4Work.Status = EntityStatus.DONE;
                this.McWork4Work.EndTime = DateTime.Now;
                this.McWork4Work.ActualTime = DateTime.Now;
                DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork4Work, this.BuVO);
                this.McWork4Work = null;
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V0_MC_CANT_WORKACTION, "McWork_Done");
            }
        }

    }
}
