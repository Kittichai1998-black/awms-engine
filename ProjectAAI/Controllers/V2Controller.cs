using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.HubService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace ProjectAAI.Controllers
{
    public class V2Controller : AWMSEngine.Controllers.V2.BaseV2Controller
    {
        public V2Controller(IHubContext<CommonMessageHub> hubContext) : base(hubContext)
        {
        }
    }
}