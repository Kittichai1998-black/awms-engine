using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class ams_AreaLocationMaster : BaseEntitySTD
    {
        public int AreaMaster_ID;
        public int PosX;
        public int PosY;
        public int PosZ;
        public int? Bank;
        public int? Bay;
        public int? Lv;
        public int ObjectSize_ID;
        public int UnitType_ID;
    }
}
