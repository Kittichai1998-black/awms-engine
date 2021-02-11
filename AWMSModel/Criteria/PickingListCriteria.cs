using AMSModel.Criteria.SP.Response;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Criteria
{
    public class PickingListCriteria : SPOutDocTargetCriteria
    {
        public List<STOPickingChoice> STOPickingChoices;
        public class STOPickingChoice
        {
            public long id;
            public string rootBaseMasterCode;
            public string rootBaseMasterName;
            public int packQty;

            public long areaLocationID;
            public string areaLocationCode;
            public int? areaLocationBank;
            public int? areaLocationBay;
            public int? areaLocationLevel;

        }
    }
}
