using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class ams_Config : BaseEntityCreateModify
    {
        public string Namespace;
        public string DataType;
        public string DataKey;
        public string DataValue;
    }
}
