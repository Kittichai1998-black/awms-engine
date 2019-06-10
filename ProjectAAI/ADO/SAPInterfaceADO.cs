using AMWUtil.DataAccess.Http;
using AMWUtil.Logger;
using AWMSEngine.ADO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectAAI.ADO
{
    public class SAPInterfaceADO : BaseMSSQLAccess<SAPInterfaceADO>
    {
        public T postSAP<T>(object datas, AMWLogger logger, string apiUri)
            where T : class, new()
        {
            var res = RESTFulAccess.SendJson<T>(logger, apiUri, RESTFulAccess.HttpMethod.POST, datas);
            return res;
        }
        
    }
}
