using AWMSEngine.ADO;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static ProjectTMC.Model.Criteria.SCADACriteria;

namespace ProjectTMC.ADO.SCADAApi
{
    public class SCADAInterfaceADO : BaseAPIAccess<SCADAInterfaceADO>
    {
         
        public class TRes
        {
            public dynamic data;
            public Result _result;

            public class Result
            {
                public int status;
                public string message;
            }
        }
        public TRes SendToSCADA(dynamic reqVO, VOCriteria buVO)
        {
            var res = new TRes();
            var resScada = this.SendJson<dynamic>("SCADA_CONNECT", reqVO, null, buVO);
            if(resScada.scada_status2 == 1)//case success
            {
                res.data = resScada;
                res._result = new TRes.Result()
                {
                    message = "SUCCESS",
                    status = 1
                };
            }
            else//case error
            {
                res.data = resScada;
                res._result = new TRes.Result()
                {
                    message = "Cannot connect to Scada.",
                    status = 0
                };
            }
            return res;
        }
        public TRes SendToSCADA(List<dynamic> reqVO, VOCriteria buVO)
        {
            var res = new TRes();
            var resScada = this.SendJson<dynamic>("SCADA_CONNECT", reqVO, null, buVO);
            if (resScada.scada_status2 == 1)//case success
            {
                res.data = resScada;
                res._result = new TRes.Result()
                {
                    message = "SUCCESS",
                    status = 1
                };
            }
            else//case error
            {
                res.data = resScada;
                res._result = new TRes.Result()
                {
                    message = "Cannot connect to Scada.",
                    status = 0
                };
            }
            return res;
        }
    }
}
