using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
{
    public class aml_SAPLog : IEntityModel
    {
        public long? ID;
        public string Description;
        public string Options;
        public DateTime LogDate;
    }
}
