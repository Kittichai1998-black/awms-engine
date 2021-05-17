using AMWUtil.Common;
using AMWUtil.DataAccess.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace AWCSWebApp.Controllers
{
    [Route("v2")]
    [ApiController]
    public class TestConnectionV2 : Controller
    {
        string root = "E:/logs/test_conn/";
        private static Dictionary<string, string> Res_Json = new Dictionary<string, string>();
        public class TLog
        {
            public string api_name;
            public string method;
            public string msg_req;
            public string msg_res;
        }
        public TLog GenLogLine(string method, string api_name, string req_json, string res_json)
        {
            string uniq =  AMWUtil.Common.ObjectUtil.GenUniqID();
            var log =
                new TLog
                {
                    api_name = api_name,
                    method = method,
                    msg_req = string.Format("{3} [{0}] [{1}] [4] ==>> {2}", method, api_name, req_json, DateTime.Now.ToString("hh:mm:ss:fff"), uniq),
                    msg_res = string.Format("{3} [{0}] [{1}] [4] <<== {2}", method, api_name, res_json, DateTime.Now.ToString("hh:mm:ss:fff"), uniq)
                };

            if (!Directory.Exists(root))
                Directory.CreateDirectory(root);
            using (StreamWriter sw = new StreamWriter(root + DateTime.Now.ToString("yyyyMMdd") + ".log", true, Encoding.UTF8))
            {
                sw.WriteLine(log.msg_req);
                sw.WriteLine(log.msg_res);
            }

            return log;
        }

        [HttpPost("{api_name}")]
        public dynamic _Post(string api_name, [FromBody] dynamic req)
        {
            try
            {
                string res;
                if (!Res_Json.ContainsKey(api_name))
                {
                    res = ObjectUtil.Json( new { _result = new { status = 1, message = "success.." } });
                }
                else
                {
                    res = Res_Json[api_name];
                }
                GenLogLine("TO_WCS", api_name, ObjectUtil.Json(req), res);
                return res.Json<dynamic>();
            }
            catch(Exception ex)
            {
                GenLogLine("TO_WCS", api_name, ObjectUtil.Json(req), ex.Message);
                return new { _result = new { status = 0, code = "U0000", message = ex.Message } };
            }
        }

        [HttpPost("log")]
        public dynamic _GetLog([FromBody]dynamic req)
        {
            string search = req.search;
            string skip = req.skip;
            string len = req.len;
            List<string> res = new List<string>();
            using (StreamReader sr = new StreamReader(root + DateTime.Now.ToString("yyyyMMdd") + ".log"))
            {
                while (!sr.EndOfStream)
                {
                    string _s = sr.ReadLine();
                    if (Regex.IsMatch(_s, search))
                        res.Add(_s);
                }
            }
            int _skip = skip.Get2<int>();
            int _len = len.Get2<int>();
            return res.Skip(_skip).Take(_len);
        }
        [HttpPost("{api_name}/set")]
        public dynamic _PostSet(string api_name, [FromBody] dynamic req)
        {
            if (Res_Json.ContainsKey(api_name.ToLower()))
                Res_Json[api_name.ToLower()] = ObjectUtil.Json(req);
            else
                Res_Json.Add(api_name.ToLower(), ObjectUtil.Json(req));
            return new { _result = new { status = 1, message = "success..." } };
        }

        [HttpPost("to_sce")]
        public dynamic _Post2Sce(string api_name, [FromBody] dynamic req)
        {
            try
            {
                string endpoint = req._enpoint;
                var res = AMWUtil.DataAccess.Http.RESTFulAccess.SendJson<dynamic>(null, endpoint, RESTFulAccess.HttpMethod.POST, req._request);
                GenLogLine("TO_SCE", api_name, ObjectUtil.Json(req), res);
                return res;
            }
            catch(Exception ex)
            {
                GenLogLine("TO_WCS", api_name, ObjectUtil.Json(req), ex.Message);
                return new { _result = new { status = 0, code = "U0000", message = ex.Message } };
            }
        }
    }
}
