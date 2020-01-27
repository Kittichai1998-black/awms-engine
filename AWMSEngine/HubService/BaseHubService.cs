using AMWUtil.Common;
using AWMSModel.Entity;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.HubService
{
    public abstract class BaseHubService : Hub
    {
        private static List<ams_HubService> _HubServiceSetup = new List<ams_HubService>();
        public static void AddHubServiceSetup(ams_HubService hubService)
        {
            _HubServiceSetup.Add(hubService);
        }
        protected long HubServiceID { get; set; }
        private static readonly object _LockGetHubServiceID = new object();

        public BaseHubService()
        {
            lock (_LockGetHubServiceID)
            {
                this.HubServiceID = _HubServiceSetup.First(x => x.FullClassName == this.GetType().FullName).ID.Value;
                _HubServiceSetup.RemoveAll(x => x.ID == this.HubServiceID);
            }
        }
    }
}
