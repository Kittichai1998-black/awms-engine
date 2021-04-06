using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.Logger;
using AWCSWebApp.GCLModel.Criteria;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace AWCSWebApp.Controllers
{
    public partial class PublicApiController : BaseController
    {
        [HttpGet("get_eventlog")]
        public dynamic get_eventlog(string app, string mc, int max)
        {
            var res = this.ExecBlock<List<dynamic>>("get_eventlog", (buVO) =>
            {
                buVO.Logger = null;
                var logs = DashboardADO.GetInstant().Dashboard_EventLog(app, mc, max, buVO);

                return logs;
            });

            return res;
        }
        [HttpPost("post_cmd")]
        public dynamic pos_cmd(string app, string cmd)
        {
            var res = this.ExecBlock<act_McCmdRemote>("get_eventlog", (buVO) =>
            {
                buVO.Logger = null;
                act_McCmdRemote rm = new act_McCmdRemote()
                {
                    AppName = app,
                    CmdLine = cmd
                };
                rm.ID = DataADO.GetInstant().Insert<act_McCmdRemote>(rm, buVO);

                return rm;
            });

            return res;
        }
    }
}
