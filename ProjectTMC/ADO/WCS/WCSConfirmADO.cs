using AWMSEngine.ADO;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectTMC.ADO.WCS
{
    public class WCSConfirmADO : BaseAPIAccess<WCSConfirmADO>
    {

        public class TRes : WorkQueueCriteria
        {
            public Result _result;

            public class Result
            {
                public dynamic resultmessage;
                public int resultcheck;
            }
        }
        public TRes SendConfirm(WorkQueueCriteria datas, VOCriteria buVO)
        {
            return new TRes() { _result = new TRes.Result() { resultcheck = 1, resultmessage = "SUCCESS" } };
            //var res = this.SendJson<TRes>("WCS_SEND_CONFIRM", datas, null, buVO);
            //return res;
        }

    }
}
