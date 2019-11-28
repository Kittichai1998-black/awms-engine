using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Constant.EnumConst
{
    public enum AreaMasterTypeID
    {
        STORAGE_ASRS = 10,
        STORAGE_MANUAL = 11,

        MACHINE_GATE = 20,
        MACHINE_MOVE = 21,

        STATION_UNPACK = 30,
        STATION_PICKING = 31,
        STATION_CONSOLIDATE = 32,

        STAGING_RECEIVE = 40,
        STAGING_SHIPPING = 41,
    }
}
