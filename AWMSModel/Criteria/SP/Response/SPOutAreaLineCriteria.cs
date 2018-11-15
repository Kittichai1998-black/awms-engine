using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria.SP.Response
{
    public class SPOutAreaLineCriteria
    {
        public int? Sou_AreaMasterType_ID;
        public string Sou_AreaMasterType_Code;
        public AreaMasterGroupType Sou_AreaMasterType_GroupType;
        public int? Sou_AreaMaster_ID;
        public string Sou_AreaMaster_Code;
        public int? Sou_AreaLocationMaster_ID;
        public string Sou_AreaLocationMaster_Code;
        public int? Des_AreaMasterType_ID;
        public string Des_AreaMasterType_Code;
        public AreaMasterGroupType Des_AreaMasterType_GroupType;
        public int? Des_AreaMaster_ID;
        public string Des_AreaMaster_Code;
        public int? Des_AreaLocationMaster_ID;
        public string Des_AreaLocationMaster_Code;
        public YesNoFlag DefaultFlag;
    }
}
