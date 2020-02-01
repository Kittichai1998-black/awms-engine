using AMWUtil.Common;
using AWMSEngine.ADO.StaticValue;
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
        protected ams_HubService HubService { get; set; }

        public BaseHubService()
        {
            this.HubService = StaticValueManager.GetInstant().HubService.FirstOrDefault(x => x.FullClassName == this.GetType().FullName);
            //lock (_LockGetHubServiceID)
            //{
            //    this.HubServiceID = _HubServiceSetup.First(x => x.FullClassName == this.GetType().FullName).ID.Value;
            //    _HubServiceSetup.RemoveAll(x => x.ID == this.HubServiceID);
            //}
        }
    }
}
