using AWMSEngine.Engine;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.IO;
using Microsoft.Extensions.Hosting;
using System.Threading;
using AMWUtil.DataAccess;
using AWMSModel.Entity;
using AWMSEngine.Engine.V2.Business.Received;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using System.Dynamic;
using AWMSEngine.WorkerService;
using AWMSEngine.HubService;
using Microsoft.AspNetCore.SignalR;

namespace ProjectSTGT.Engine.Worker
{
    public class ReadExcelFileWorker : BaseWorkerService
    {

        public class TRes
        {
            public string skuCode;
            public string orderNo;
            public string SOM;
            public decimal qty;
            public string unit;
            public string carton;
            public string status;
            public string remark;
        }

        public ReadExcelFileWorker(long workerServiceID, IHubContext<CommonMessageHub> commonHub) : base(workerServiceID, commonHub)
        {
        }

        protected override void ExecuteEngine(Dictionary<string, string> options, VOCriteria buVO)
        {
            var createGRDoc = new ProjectSTGT.APIService.ReadExcelAPI();
            var obj = new { apikey = "FREE01" };
            var res = createGRDoc.Execute(obj);
        }
    }
}
