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
        public long BaseObject_ID;
        public long McObject_ID;
        public long Cur_Warehouse_ID;
        public long Cur_Area_ID;
        public long Cur_Location_ID;
        public long Sou_Area_ID;
        public long Sou_Location_ID;
        public long Des_Area_ID;
        public long Des_Location_ID;
        public DateTime? StartTime;
        public DateTime? EndTime;
        public DateTime? ActualTime;
        public string TreeRoute;
        public TreeNode<long> GetJsonTreeRoute()
        {
            return TreeRoute.Json<TreeNode<long>>();
        }
    }
}
