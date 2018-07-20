using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public abstract class BaseEntitySTD : BaseEntityCreateModify
    {
        public int? ID;
        public string Code;
        public string Name;
        public string Description;
    }
}
