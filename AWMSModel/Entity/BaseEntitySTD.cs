using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace AMSModel.Entity
{
    public abstract class BaseEntitySTD : BaseEntityCreateModify
    {
        [Display(Name = "รหัสพื้นที่", Order = 1)]
        public string Code;
        [Display(Name = "ชื่อพื้นที่", Order = 2)]
        public string Name;
        [Display(Name = "รายละเอียด", Order = 3)]
        public string Description;
    }
}
