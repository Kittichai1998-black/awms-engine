using AMWUtil.Logger;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMWUtil.DataAccess.Http
{
    public static class LineAccess
    {
        public static string Notify(AMWLogger logger, string token, string msg,  int retry = 0, int timeout = 30000)
        {
            var res = RESTFulAccess.SendJson<dynamic>(logger, "https://notify-api.line.me/api/notify", RESTFulAccess.HttpMethod.POST,
                new { message = msg },
                new BearerAuthentication(token), retry, timeout);

            return res;
        }
    }
}
