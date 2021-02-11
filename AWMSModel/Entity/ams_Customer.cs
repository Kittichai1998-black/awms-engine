using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class ams_Customer : BaseEntitySTD
    {
        public long? ShelfLifeDay;
        public long? ShelfLifePercent;
        public long? IncubationDay;
        public string Info1;
        public string Info2;
        public string Info3;
    }
}
