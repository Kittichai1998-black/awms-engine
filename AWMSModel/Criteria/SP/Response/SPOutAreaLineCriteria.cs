using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Criteria.SP.Response
{
    public class SPOutAreaLineCriteria
    {
        public AreaMasterTypeID? Sou_AreaMasterType_ID;
        //public string Sou_AreaMasterType_Code;
        //public AreaMasterGroupType Sou_AreaMasterType_GroupType;
        public long? Sou_AreaMaster_ID;
        public string Sou_AreaMaster_Code;
        public long? Sou_AreaLocationMaster_ID;
        public string Sou_AreaLocationMaster_Code;
        public AreaMasterTypeID? Des_AreaMasterType_ID;
        //public string Des_AreaMasterType_Code;
        //public AreaMasterGroupType Des_AreaMasterType_GroupType;
        public long? Des_AreaMaster_ID;
        public string Des_AreaMaster_Code;
        public long? Des_AreaLocationMaster_ID;
        public string Des_AreaLocationMaster_Code;
        public YesNoFlag DefaultFlag;
        public string Condition_Eval;
    }
}
