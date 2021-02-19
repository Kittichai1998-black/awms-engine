using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class ams_AreaRoute : BaseEntityCreateModify
    {
        public int Sou_AreaMaster_ID;
        public int? Sou_AreaLocationMaster_ID;
        public int Des_AreaMaster_ID;
        public int? Des_AreaLocationMaster_ID;
    }
}
