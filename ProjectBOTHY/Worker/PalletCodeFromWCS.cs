using AMWUtil.Common;
using AMWUtil.DataAccess.Http;
using AWMSEngine.HubService;
using AWMSEngine.WorkerService;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectBOTHY.Worker
{
    public class PalletCodeFromWCS : BaseWorkerService
    {
        public class TRes
        {
            public string baseCode;
        }

        public PalletCodeFromWCS(long workerServiceID, IHubContext<CommonMessageHub> commonHub) : base(workerServiceID, commonHub)
        {
        }

        protected override void ExecuteEngine(Dictionary<string, string> options, VOCriteria buVO)
        {
            buVO.Logger.IsLogging = false;
            var bsto = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[]{
                    new SQLConditionCriteria("AreaMaster_ID", options.First(x => x.Key == "xx").Value, AWMSModel.Constant.EnumConst.SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status", EntityStatus.ACTIVE, AWMSModel.Constant.EnumConst.SQLOperatorType.EQUALS)
                }, buVO).FirstOrDefault();

            if(bsto != null)
            {
                var mapsto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(bsto.ID.Value, StorageObjectType.BASE, false, true, buVO);
                this.CommonMsgHub.Clients.All.SendAsync(options["_hubname"], mapsto.Json());
            }
        }
    }
}
