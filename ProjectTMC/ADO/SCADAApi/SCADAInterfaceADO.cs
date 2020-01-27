using AWMSEngine.ADO;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static ProjectTMC.Model.SCADACriteria;

namespace ProjectTMC.ADO.SCADAApi
{
    public class SCADAInterfaceADO : BaseAPIAccess<SCADAInterfaceADO>
    {
        public class SCADAResponse
        {
            public object datas;
        }

        public SCADAResponse SendLocation(SCADA_UpdateLocation_REQ reqVO, VOCriteria buVO)
        {
            //return new TRes() { _result = new TRes.Result() { resultcheck = 1, resultmessage = "SUCCESS" } };
            var res = this.SendJson<SCADAResponse>("SCADA_CONNECT", reqVO, null, buVO);
            return res;
        }
    }
}
