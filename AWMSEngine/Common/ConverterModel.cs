using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Common
{
    public static class ConverterModel
    {

        public static WorkQueueCriteria ToWorkQueueCriteria(this SPworkQueue workQ)
        {
            WorkQueueCriteria res = new WorkQueueCriteria()
            {
                //areaCode = ADO.StaticValue.StaticValueManager.GetInstant().AreaMasterLines.Find(x => x.ID == this.AreaMaster_ID).Code
            };
            return res;
        }
    }
}
