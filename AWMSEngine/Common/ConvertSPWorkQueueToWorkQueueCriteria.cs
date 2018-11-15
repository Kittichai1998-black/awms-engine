using AWMSModel.Criteria.SP.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Common
{
    public class ConvertSPWorkQueueToWorkQueueCriteria
    {

        public SPOutQueueResponseCriteria ConvertToSPOutQueueResponseCriteria()
        {
            SPOutQueueResponseCriteria res = new SPOutQueueResponseCriteria()
            {
                //areaCode = ADO.StaticValue.StaticValueManager.GetInstant().AreaMasterLines.Find(x => x.ID == this.AreaMaster_ID).Code
            };
            return res;
        }
    }
}
