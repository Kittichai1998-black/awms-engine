using AMSModel.Constant.EnumConst;
using AMWUtil.Common;
using AMWUtil.Model;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class act_McWork : BaseEntityCreateModify
    {
        public IOType IOType;
        public int QueueType;
        public int Priority;
        public long SeqGroup;
        public long SeqItem;
        public long? WMS_WorkQueue_ID;
        public long? Rec_McObject_ID;
        public long? Cur_McObject_ID;
        public long BaseObject_ID;
        public long? BuWork_ID;
        public long Cur_Warehouse_ID;
        public long Cur_Area_ID;
        public long Cur_Location_ID;
        public long Sou_Area_ID;
        public long Sou_Location_ID;
        public long Des_Area_ID;
        public long? Des_Location_ID;
        public DateTime? StartTime;
        public DateTime? EndTime;
        public DateTime? ActualTime;
        public string TreeRoute;
        public string DocRef;
        public string TrxRef;
        public string Remark;
        public McWorkEventStatus EventStatus;
        public int QueueStatus;
        public int Keep_Flag;
        public string MixLot;

        public List<TreeNode<long>> GetCur_TreeRoute()
        {
            return TreeRoute.Json<TreeNode<long>>().GetChildsByValue(this.Cur_Location_ID);
        }
        public List<TreeNode<long>> GetChild_TreeRoute()
        {
            List<TreeNode<long>> res = new List<TreeNode<long>>();
            TreeRoute.Json<TreeNode<long>>().GetChildsByValue(this.Cur_Location_ID)
                 .ForEach(node => {
                     res.AddRange(node.Childs);
                 });
            return res;
        }

    }
}
