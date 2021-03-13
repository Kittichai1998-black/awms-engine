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
            this.McWork4Receive = McWorkADO.GetInstant().GetByRecMcObject(this.McMst.ID.Value, this.BuVO);
            if (this.McWork4Work != null && this.McWork4Work.EventStatus == McWorkEventStatus.ACTIVE_KEEP)
            {
                this.McWork4Work.EventStatus = McWorkEventStatus.ACTIVE_WORKED;
                DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork4Work, this.BuVO);
            }

            DisplayController.Events_Write(this.Code + " > McWork_0_Reload");
        }
        public void McWork_3_WorkedToReceive_NextMC(long toMcID)
        {
            var nextMc = McRuntimeController.GetInstant().GetMcRuntime(toMcID);
            nextMc.McWork4Receive = this.McWork4Work;

            this.McWork4Work.Rec_McObject_ID = toMcID;
            this.McWork4Work.EventStatus = McWorkEventStatus.ACTIVE_RECEIVE;
            this.McWork4Work.ActualTime = DateTime.Now;

            DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork4Work, this.BuVO);

            DisplayController.Events_Write(this.Code + " > McWork_3_WorkedToReceive_NextMC : " + nextMc.Code);
        }
        public void McWork_1_ReceiveToWorking()
        {
            this.McWork4Work = this.McWork4Receive;
            this.McWork4Receive = null;
            this.McWork4Work.Cur_McObject_ID = this.ID;
            this.McWork4Work.Rec_McObject_ID = null;
            this.McWork4Work.EventStatus = McWorkEventStatus.ACTIVE_WORKING;
            this.McWork4Work.ActualTime = DateTime.Now;
            DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork4Work, this.BuVO);


            var baseObject = BaseObjectADO.GetInstant().GetByID(this.McWork4Work.BaseObject_ID, this.BuVO);
            baseObject.Location_ID = this.McWork4Work.Des_Location_ID.Value;
            baseObject.McObject_ID = null;
            DataADO.GetInstant().UpdateBy(baseObject, this.BuVO);

            DisplayController.Events_Write(this.Code + " > McWork_1_ReceiveToWorking");
        }
        public void McWork_2_WorkingToWorked()
        {

            this.McWork4Work.EventStatus = McWorkEventStatus.ACTIVE_WORKED;
            this.McWork4Work.ActualTime = DateTime.Now;
            DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork4Work, this.BuVO);


            var baseObject = BaseObjectADO.GetInstant().GetByID(this.McWork4Work.BaseObject_ID, this.BuVO);
            baseObject.Location_ID = this.McWork4Work.Des_Location_ID.Value;
            baseObject.McObject_ID = null;
            DataADO.GetInstant().UpdateBy(baseObject, this.BuVO);

            DisplayController.Events_Write(this.Code + " > McWork_2_WorkingToWorked");
        }
        public void McWork_3_WorkedToKeep()
        {
            this.McWork4Work.EventStatus = McWorkEventStatus.ACTIVE_KEEP;
            this.McWork4Work.ActualTime = DateTime.Now;

            DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork4Work, this.BuVO);

            DisplayController.Events_Write(this.Code + " > McWork_3_WorkedToKeep");
        }
        public void McWork_4_WorkedToDone()
        {

            this.McWork4Work.EventStatus = McWorkEventStatus.DONE_QUEUE;
            this.McWork4Work.Status = EntityStatus.DONE;
            this.McWork4Work.EndTime = DateTime.Now;
            this.McWork4Work.ActualTime = DateTime.Now;
            DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork4Work, this.BuVO);

            var baseObject = BaseObjectADO.GetInstant().GetByID(this.McWork4Work.BaseObject_ID, this.BuVO);
            baseObject.Location_ID = this.McWork4Work.Des_Location_ID.Value;
            baseObject.McObject_ID = null;
            DataADO.GetInstant().UpdateBy(baseObject, this.BuVO);
            this.McWork4Work = null;

            DisplayController.Events_Write(this.Code + " > McWork_4_WorkedToDone");
        }

    }
}
