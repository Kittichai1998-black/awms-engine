using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AMSModel.Entity
{
    public class acl_EventLog : BaseEntityID
    {
        public string AppName;
        public string McCode;
        public string EventLog;
        public DateTime ActionTime;
    }
}
