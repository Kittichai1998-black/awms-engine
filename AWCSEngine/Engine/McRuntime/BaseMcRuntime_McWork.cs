using ADO.WCSDB;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Exception;
using AWCSEngine.Controller;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AWCSEngine.Engine.McRuntime
{
    public abstract partial class BaseMcRuntime : BaseEngine<NullCriteria, NullCriteria>, IDisposable
    {
        public void McWork_9_Remove()
        {
            if (this.McWork4Work != null)
            {
                this.McWork4Work.EventStatus = McWorkEventStatus.REMOVE_QUEUE;
                this.McWork4Work.Status = EntityStatus.REMOVE;
                DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork4Work, this.BuVO);
            }
            if (this.McWork4Receive != null)
            {
                this.McWork4Receive.EventStatus = McWorkEventStatus.REMOVE_QUEUE;
                this.McWork4Receive.Status = EntityStatus.REMOVE;
                DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork4Receive, this.BuVO);
            }
            this.McWork_0_Reload();
        }
        public void McWork_0_Reload()
        {
            this.McWork4Work = McWorkADO.GetInstant().GetByCurMcObject(this.McMst.ID.Value, this.BuVO);
            this.McWork4Receive = McWorkADO.GetInstant().GetByRecMcObject(this.McMst.ID.Value, this.BuVO);
            if (this.McWork4Work != null && this.McWork4Work.EventStatus == McWorkEventStatus.ACTIVE_KEEP)
            {
                this.McWork4Work.EventStatus = McWorkEventStatus.ACTIVE_WORKED;
                DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork4Work, this.BuVO);
            }

            DisplayController.Events_Write(this.Code, "McWork_0_Reload");
        }
        public void McWork_3_WorkedToReceive_NextMC(long toMcID)
        {
            var nextMc = McRuntimeController.GetInstant().GetMcRuntime(toMcID);
            nextMc.McWork4Receive = this.McWork4Work;

            this.McWork4Work.Rec_McObject_ID = toMcID;
            this.McWork4Work.EventStatus = McWorkEventStatus.ACTIVE_RECEIVE;
            this.McWork4Work.ActualTime = DateTime.Now;

            DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork4Work, this.BuVO);

            DisplayController.Events_Write(this.Code , "McWork_3_WorkedToReceive_NextMC : " + nextMc.Code);
        }
        public bool McWork_1_ReceiveToWorking()
        {
            if (this.McWork4Work != null) return false;

            if (this.McWork4Receive.Cur_McObject_ID.HasValue)
            {
                var oldMc = Controller.McRuntimeController.GetInstant().GetMcRuntime(this.McWork4Receive.Cur_McObject_ID.Value);
                oldMc.McWork4Work = oldMc.McWork4Work = null;
            }
            long q_id = this.McWork4Receive.ID.Value;
            string q_label = this.McWork4Receive_LabelData;
            this.McWork4Work = this.McWork4Receive;
            this.McWork4Receive = null;
            this.McWork4Work.Cur_McObject_ID = this.ID;
            this.McWork4Work.Rec_McObject_ID = null;
            this.McWork4Work.EventStatus = McWorkEventStatus.ACTIVE_WORKING;
            this.McWork4Work.ActualTime = DateTime.Now;
            DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork4Work, this.BuVO);


            var baseObject = BaseObjectADO.GetInstant().GetByID(this.McWork4Work.BaseObject_ID, this.BuVO);
            baseObject.Location_ID = this.McObj.Cur_Location_ID.Value;
            baseObject.McObject_ID = null;
            DataADO.GetInstant().UpdateBy(baseObject, this.BuVO);

            DisplayController.Events_Write(this.Code , "McWork_1_ReceiveToWorking QID=" + q_id + " | LABEL=" + q_label);
            return true;
        }
        public void McWork_2_WorkingToWorked(long? locID = null)
        {

            this.McWork4Work.EventStatus = McWorkEventStatus.ACTIVE_WORKED;
            this.McWork4Work.ActualTime = DateTime.Now;
            DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork4Work, this.BuVO);


            var baseObject = BaseObjectADO.GetInstant().GetByID(this.McWork4Work.BaseObject_ID, this.BuVO);
            baseObject.Location_ID = locID.HasValue?locID.Value:this.McObj.Cur_Location_ID.Value;
            baseObject.McObject_ID = null;
            DataADO.GetInstant().UpdateBy(baseObject, this.BuVO);

            DisplayController.Events_Write(this.Code, "McWork_2_WorkingToWorked");
        }
        public void McWork_3_WorkedToKeep()
        {
            this.McWork4Work.EventStatus = McWorkEventStatus.ACTIVE_KEEP;
            this.McWork4Work.ActualTime = DateTime.Now;

            DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork4Work, this.BuVO);

            DisplayController.Events_Write(this.Code , "McWork_3_WorkedToKeep");
        }
        public void McWork_4_WorkedToDone(string receiveZone = "in")
        {

            this.McWork4Work.EventStatus = McWorkEventStatus.DONE_QUEUE;
            this.McWork4Work.Status = EntityStatus.DONE;
            this.McWork4Work.EndTime = DateTime.Now;
            this.McWork4Work.ActualTime = DateTime.Now;
            DataADO.GetInstant().UpdateBy<act_McWork>(this.McWork4Work, this.BuVO);

            var baseObject = BaseObjectADO.GetInstant().GetByID(this.McWork4Work.BaseObject_ID, this.BuVO);
            var desLoc = this.StaticValue.GetLocation(this.McWork4Work.Des_Location_ID.Value);
            var locInBays = this.StaticValue.ListLocationByBayLv(desLoc.GetBay(), desLoc.GetLv());
            locInBays.RemoveAll(x => x.GetBank() == locInBays.Max(x => x.GetBank()));
            locInBays.RemoveAll(x => x.GetBank() == locInBays.Min(x => x.GetBank()));
            var baseInBays =
                DataADO.GetInstant().SelectBy<act_BaseObject>(new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("Location_ID",locInBays.Select(x=>x.ID.Value).ToArray(), SQLOperatorType.IN),
                    new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS),
                }, this.BuVO);
            locInBays.RemoveAll(x => baseInBays.Any(y => y.Location_ID == x.ID));
            var locRec = (receiveZone == "in" ?
                locInBays.OrderByDescending(x => x.GetBank()).First() : // FIFO by zone out > zone in
                locInBays.OrderBy(x => x.GetBank()).First() // FIFO by zone out > zone in
                );

            baseObject.Location_ID = locRec.ID.Value;
            baseObject.McObject_ID = null;
            baseObject.EventStatus = BaseObjectEventStatus.IDLE;
            DataADO.GetInstant().UpdateBy(baseObject, this.BuVO);

            act_BuWork buWork = DataADO.GetInstant().SelectByID<act_BuWork>(this.McWork4Work.BuWork_ID, this.BuVO);
            if(buWork != null)
            {
                buWork.Status = EntityStatus.DONE;
                DataADO.GetInstant().UpdateBy<act_BuWork>(buWork, this.BuVO);
            }
            this.McWork4Work = null;

            DisplayController.Events_Write(this.Code, "McWork_4_WorkedToDone");
        }

    }
}
