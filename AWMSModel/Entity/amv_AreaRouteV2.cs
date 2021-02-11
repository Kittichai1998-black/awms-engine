using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class amv_AreaRouteV2 : IEntityModel
    {
        public IOType IOType;
        public int souAreaID;
        public int desAreaID;
        public string souAreaName;
        public string desAreaName;
        public string souAreaCode;
        public string desAreaCode;
        public int souWarehouseID;
        public int desWarehouseID;
    }
}
