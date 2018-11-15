using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class ams_AreaMasterLine : BaseEntityID
    {
        public int Sou_AreaMaster_ID;
        public int? Sou_AreaLocationMaster_ID;
        public int Des_AreaMaster_ID;
        public int? Des_AreaLocationMaster_ID;
    }
}
