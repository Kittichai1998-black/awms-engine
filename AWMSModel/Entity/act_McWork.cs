using AMWUtil.Common;
using AMWUtil.Model;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class act_McWork : BaseEntityCreateModify
    {
        public long WMS_WorkQueue_ID;
        public long BaseObject_ID;
        public long Sou_Area_ID;
        public long Sou_Location_ID;
        public long Des_Area_ID;
        public long Des_Location_ID;
        public long Area_ID;
        public long Location_ID;
        public string TreeRoute;
        public TreeNode<long> GetJsonTreeRoute()
        {
            return TreeRoute.Json<TreeNode<long>>();
        }
    }
}
