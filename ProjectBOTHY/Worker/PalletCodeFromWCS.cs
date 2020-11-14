using AMWUtil.Common;
using AMWUtil.DataAccess.Http;
using AMWUtil.Logger;
using AWMSEngine.HubService;
using AWMSEngine.WorkerService;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using Microsoft.AspNetCore.SignalR;
using ProjectBOTHY.Hub;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectBOTHY.Worker
{
    public class PalletCodeFromWCS : BaseWorkerService
    {
        public PalletCodeFromWCS(long workerServiceID, AMWLogger logger, IHubContext<CommonMessageHub> commonHub)
            : base(workerServiceID, logger, commonHub)
        {
        }

        public class TRes
        {
            public string baseCode;
        }

        protected override void ExecuteEngine(Dictionary<string, string> options, VOCriteria buVO)
        {
            buVO.Logger.IsLogging = false;
            var bsto = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[]{
                    new SQLConditionCriteria("AreaMaster_ID", options.First(x => x.Key == "area").Value, AWMSModel.Constant.EnumConst.SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status", EntityStatus.ACTIVE, AWMSModel.Constant.EnumConst.SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("EventStatus", "10,14", AWMSModel.Constant.EnumConst.SQLOperatorType.IN)
                }, buVO).FirstOrDefault();
            StorageObjectCriteria mapsto = new StorageObjectCriteria();
            if (bsto != null)
            {
                
                mapsto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(bsto.ID.Value, StorageObjectType.BASE, false, true, buVO);
                this.CommonMsgHub.Clients.All.SendAsync(options["_hubname"], mapsto.Json());
            }
            else
            {
                var res = new Object();
                this.CommonMsgHub.Clients.All.SendAsync(options["_hubname"], res.Json());
            }
        }
    }
}
