using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Criteria
{
    public class RootStoProcess
    {
        public List<DocItem> docItems;
        public class DocItem
        {
            public long docID;
            public long docItemID;

            public long bstoID;
            public string bstoCode;

            public long pstoID;
            public string pstoCode;
            public string pstoBatch;
            public string pstoLot;
            public string pstoOrderNo;
            public string pstoOptions;

            public decimal pickQty;
            public long pickUnitID;
            public decimal pickBaseQty;
            public long pickBaseUnitID;

            public bool useFullPick;

        }
        public long? workQueueID;
        public int priority;

        public long rstoID;
        public string rstoCode;

        public bool lockOnly = false;
        //public decimal pstoQty;
        //public long pstoUnitID;

        //public decimal pstoBaseQty;
        //public long pstoBaseUnitID;

        public long warehouseID;
        public long areaID;
        public long? locationID;

        public long souWarehouseID;
        public long souAreaID;

        public long desWarehouseID;
        public long? desAreaID;
        public long? desLocationID;

        public StorageObjectEventStatus? stoDoneSouEventStatus;
        public StorageObjectEventStatus? stoDoneDesEventStatus;
    }
}
