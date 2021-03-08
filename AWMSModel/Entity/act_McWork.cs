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
        public PriorityType Priority;
        public long SeqGroup;
        public int SeqItem;
        public long? WMS_WorkQueue_ID;
        public long? Cur_McObject_ID;
        public long? Des_McObject_ID;
        public long BaseObject_ID;
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
        public McWorkEventStatus EventStatus;
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
