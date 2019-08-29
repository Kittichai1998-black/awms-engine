using AMWUtil.DataAccess.Http;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO
{
    public class ApiADO
    {
        private static ApiADO instant;
        public static ApiADO GetInstant()
        {
            if (instant == null)
                instant = new ApiADO();
            return instant;
        }
        private ApiADO() { }

        public T SendJson<T>(VOCriteria buVO, string apiUrl, RESTFulAccess.HttpMethod method, object data,  IAuthentication authen = null, int retry = 0, int timeout = 30000)
            where T : class
        {
            List<HttpResultModel> outResults = new List<HttpResultModel>();
            T res = RESTFulAccess.SendJson<T>(buVO.Logger, apiUrl, method, data, outResults, authen, retry, timeout);
            buVO.FinalLogSendAPIEvent.AddRange(outResults);
            return res;
        }
        public T SendForm<T>(VOCriteria buVO, string apiUrl, RESTFulAccess.HttpMethod method, object data,  IAuthentication authen = null, int retry = 0, int timeout = 30000)
            where T : class
        {
            List<HttpResultModel> outResults = new List<HttpResultModel>();
            T res = RESTFulAccess.SendForm<T>(buVO.Logger, apiUrl, method, data, outResults, authen, retry, timeout);
            buVO.FinalLogSendAPIEvent.AddRange(outResults);
            return res;
        }

    }
}
