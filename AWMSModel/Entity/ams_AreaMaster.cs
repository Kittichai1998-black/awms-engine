using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace AMSModel.Entity
{
    public class ams_AreaMaster : BaseEntitySTD
    {
        public long? Warehouse_ID;
        [Display(Name = "ประเภทพื้นที่", Order = 11)]
        public AreaMasterTypeID AreaMasterType_ID;
    }
}
