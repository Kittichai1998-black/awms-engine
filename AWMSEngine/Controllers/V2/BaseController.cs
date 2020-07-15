using AWMSEngine.HubService;
using DinkToPdf.Contracts;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Controllers.V2
{
    public class BaseController : ControllerBase
    {
        public readonly IHubContext<CommonMessageHub> CommonMsgHub;
        public readonly IWebHostEnvironment HostingEnvironment;
        public readonly IConverter Converter;

        public BaseController(IHubContext<CommonMessageHub> commonMsgHub,
            IWebHostEnvironment hostingEnvironment,
            IConverter converter)
        {
            this.CommonMsgHub = commonMsgHub;
            this.HostingEnvironment = hostingEnvironment;
            this.Converter = converter;
        }
    }
}
