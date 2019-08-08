using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class ams_APIService : BaseEntitySTD
    {
        public int Permission_ID;
        public int APIServiceGroup_ID;
        public string FullClassName;
        public string ActionCommand;
        public int Revision;
    }
}
