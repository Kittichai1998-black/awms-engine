using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class act_BuWork : BaseEntityCreateModify
    {
        public IOType IOType;
        public long? Des_Warehouse_ID;
        public long? Des_Area_ID;
        public long? Des_Location_ID;
        public int Priority;
        public long SeqGroup;
        public int SeqIndex;
        public string Customer;
        public string ItemNo;
        public string SkuCode;
        public string SkuLot;
        public string SkuGrade;
        public string SkuStatus;
        public string LabelData;
        public decimal SkuQty;
        public string SkuUnit;
        public string DocRef;
        public string TrxRef;
        public string Remark;
        public long? WMS_WorkQueue_ID;

        public float DisCharge;
    }
}
