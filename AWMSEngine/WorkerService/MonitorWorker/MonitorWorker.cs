using AMWUtil.Common;
using AMWUtil.Logger;
using AWMSEngine.HubService;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.WorkerService.MonitorWorker
{
    public class MonitorWorker : BaseWorkerService

    {
        public class TRes
        {
            public List<GateDetail> gateDetails;
            public class GateDetail
            {
                public string gateCode;
                public string skuCode;
                public string lot;
                public decimal qty;
                public decimal allQty;
            }
        }
        public MonitorWorker(long workerServiceID, AMWLogger logger, IHubContext<CommonMessageHub> commonHub)
           : base(workerServiceID, logger, commonHub)
        {
        }
        protected override void ExecuteEngine(Dictionary<string, string> options, VOCriteria buVO)
        {
            var res = new List<TRes.GateDetail>();
            var wh = ADO.WMSStaticValue.StaticValueManager.GetInstant().Warehouses.Find(x => x.Code == options["Code"]);
            var al = ADO.WMSStaticValue.StaticValueManager.GetInstant().AreaMasters.FindAll(x => x.Warehouse_ID == wh.ID && x.AreaMasterType_ID == AreaMasterTypeID.MC_GATE);
            var stos = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[] { 
                new SQLConditionCriteria("AreaMaster_ID",string.Join(",",al.Select(x=>x.ID).ToArray()),SQLOperatorType.IN),
                new SQLConditionCriteria("Status",EntityStatus.ACTIVE,SQLOperatorType.EQUALS)

            },buVO ).ToList();
            var res1 = stos.GroupBy(x => x.AreaMaster_ID).Select(x => new { AreaMaster_ID = x.Key, data = x.ToList() });


            this.CommonMsgHub.Clients.All.SendAsync(options["_hubname"], res1.Json());
        }
    }
}
