using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class ams_APIKey : BaseEntitySTD
    {
        public string APIKey;
        public int Revision;
        public int User_ID;
        public bool IsLogging;
    }
}
