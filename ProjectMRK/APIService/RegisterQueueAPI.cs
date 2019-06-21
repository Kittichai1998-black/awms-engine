using AWMSEngine.APIService;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
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
        public RegisterQueueAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        public override int APIServiceID()
        {
            return 92;
        }

        protected override dynamic ExecuteEngineManual()
        {
            RegisterWorkQueue.TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<RegisterWorkQueue.TReq>(this.RequestVO);
            try
            {
                this.BeginTransaction();
                var res = new RegisterWorkQueue().Execute(this.Logger, this.BuVO, req);
                return res;
            }
            catch (Exception e)
            {
                this.RollbackTransaction();
                if (req.areaCode == "OS")
                    throw e;
                else
                {
                    this.BeginTransaction();
                    var sto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get("EJ00000000", null, null, false, false, this.BuVO);
                    var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
                    SPworkQueue workQ = new SPworkQueue()
                    {
                        ID = null,
                        IOType = IOType.OUTPUT,
                        ActualTime = null,
                        Parent_WorkQueue_ID = null,
                        Priority = 1,
                        TargetStartTime = null,
                                                                    
                        StorageObject_ID = sto.id,
                        StorageObject_Code = sto.code,

                        Warehouse_ID = 1,
                        AreaMaster_ID = 1,
                        AreaLocationMaster_ID = null,

                        Sou_Warehouse_ID = StaticValue.AreaMasters.First(x => x.Code == req.warehouseCode).Warehouse_ID.Value,
                        Sou_AreaMaster_ID = StaticValue.AreaMasters.First(x => x.Code == req.areaCode).ID.Value,
                        Sou_AreaLocationMaster_ID = null,

                        Des_Warehouse_ID = StaticValue.Warehouses.First(x => x.Code == req.desWarehouseCode).ID.Value,
                        Des_AreaMaster_ID = 7,
                        Des_AreaLocationMaster_ID = null,

                        EventStatus = WorkQueueEventStatus.WORKING,
                        Status = EntityStatus.ACTIVE,
                        StartTime = req.actualTime,

                        DocumentItemWorkQueues = null
                    };
                    workQ = AWMSEngine.ADO.WorkQueueADO.GetInstant().PUT(workQ, this.BuVO);
                }

                return null;
            }
            
        }
    }
}
