using AMSModel.Constant.EnumConst;
using AMWUtil.Common;
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

        public int GetBank() { return Code.Substring(0, 3).Get2<int>(); }
        public int GetBay() { return Code.Substring(3, 3).Get2<int>(); }
        public int GetLv() { return Code.Substring(6, 3).Get2<int>(); }
    }
}
