using AWMSEngine.APIService;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectMRK.APIService
{
    public class RegisterQueueAPI : BaseAPIService
    {
        public RegisterQueueAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        
        protected override dynamic ExecuteEngineManual()
        {
            RegisterWorkQueue.TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<RegisterWorkQueue.TReq>(this.RequestVO);
            this.BeginTransaction();
            var res = new RegisterWorkQueue().Execute(this.Logger, this.BuVO, req);
            return res;


            //try
            //{
            //    this.BeginTransaction();
            //    var res = new RegisterWorkQueue().Execute(this.Logger, this.BuVO, req);
            //    return res;
            //}
            //catch (Exception e)
            //{
            //    this.RollbackTransaction();
            //    if (req.areaCode == "OS")
            //        throw e;
            //    else
            //    {
            //        WorkQueueCriteria wq = new WorkQueueCriteria()
            //        {
            //            queueID = null,
            //            baseInfo = null,
            //            warehouseCode = req.warehouseCode,
            //            areaCode = req.areaCode,
            //            locationCode = req.locationCode,
            //            souWarehouseCode = req.warehouseCode,
            //            souAreaCode = req.areaCode,
            //            souLocationCode = req.locationCode,
            //            desWarehouseCode = req.warehouseCode,
            //            desAreaCode = "EJ",
            //            desLocationCode = "EJ01",
            //            queueParentID = null,
            //            queueRefID = null,
            //            queueStatus = WorkQueueEventStatus.NEW,
            //            seq = 0,
            //        };
            //        return wq;
            //    }

            //}

        }
    }
}
