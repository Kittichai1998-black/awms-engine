using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class ams_AreaLocationMaster : BaseEntitySTD
    {
        public int AreaMaster_ID;
        public string Gate;
        public int? Bank;
        public int? Bay;
        public int? Lavel;
        public int ObjectSize_ID;
    }
}
