using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria.SP.Response
{
    public class SPOutNotify : amt_NotifyPost
    {
        public int NotifyType;
        public int Priority;
    }
}
