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
            public dynamic datas;
            public int status;
            public string message;
            public string stacktrace;
        }

        public SCADAResponse SendLocation(SCADA_SendLocation_REQ reqVO, VOCriteria buVO)
        {
            var res = this.SendJson<SCADAResponse>("SCADA_CONNECT", reqVO, null, buVO);
            return res;
        }
    }
}
