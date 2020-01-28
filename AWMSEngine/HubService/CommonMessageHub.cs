using AMWUtil.Common;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.HubService
{
    public class CommonMessageHub : BaseHubService
    {
        public async Task JsonMsg(string method, object msg)
        {
            await Clients.All.SendAsync(method, msg.Json());
        }
        public async Task StringMsg(string method, string msg)
        {
            await Clients.All.SendAsync(method, msg);
        }
    }
}
