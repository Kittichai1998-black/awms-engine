using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class aml_SAPLog : IEntityModel
    {
        public long? ID;
        public string Description;
        public string Options;
        public DateTime LogDate;
    }
}
