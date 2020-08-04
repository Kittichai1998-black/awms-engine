using AMWUtil.Logger;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMWUtil.DataAccess.Http
{
    public static class LineAccess
    {
        public static dynamic Notify(AMWLogger logger, string token, string msg, List<HttpResultModel> outResultModel = null, int retry = 0, int timeout = 3000)
        {
            //var message = "message=" + msg;
            var res = RESTFulAccess.SendJson<dynamic>(logger, "https://notify-api.line.me/api/notify", RESTFulAccess.HttpMethod.POST,"message="+msg, outResultModel,
                new BearerAuthentication(token), retry, timeout);
            return res;
        }
    }
}
