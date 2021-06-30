﻿using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AWMSModel.Entity;
using System.Linq;

namespace AWMSEngine.Engine.V2.Business.MaintenancePlan
{
    public class GetMaintenanceDetail : BaseEngine<GetMaintenanceDetail.TReq, GetMaintenanceDetail.TRes>
    {
        public class TReq
        {
            public long maintenanceID;
        }
        public class TRes : amt_MaintenanceResult
        {
            public string WarehouseCode;
            public string WarehouseName;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var maintenanceResult = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_MaintenanceResult>(
                new SQLConditionCriteria() { field="ID", operatorType=SQLOperatorType.EQUALS, value=reqVO.maintenanceID }
            , this.BuVO).FirstOrDefault();

            maintenanceResult.maintenanceItems = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_MaintenanceResultItem>(
                new SQLConditionCriteria() { field = "MaintenanceResult_ID", operatorType = SQLOperatorType.EQUALS, value = reqVO.maintenanceID }
            , this.BuVO);

            var res = new TRes()
            {
                ID = maintenanceResult.ID,
                Code = maintenanceResult.Code,
                Name = maintenanceResult.Name,
                Description = maintenanceResult.Description,
                MaintenanceDate = maintenanceResult.MaintenanceDate,
                maintenanceItems = maintenanceResult.maintenanceItems,
                EventStatus = maintenanceResult.EventStatus,
                Status = maintenanceResult.Status,
                MaintenancePlan_ID = maintenanceResult.MaintenancePlan_ID,
                WarehouseCode = StaticValue.GetWarehousesCode(maintenanceResult.Warehouse_ID),
                Warehouse_ID = maintenanceResult.Warehouse_ID,
                WarehouseName = StaticValue.Warehouses.Find(x => x.ID == maintenanceResult.Warehouse_ID).Name,
                CreateTime = maintenanceResult.CreateTime,
                CreateBy = maintenanceResult.CreateBy,
                ModifyTime = maintenanceResult.ModifyTime,
                ModifyBy = maintenanceResult.ModifyBy
            };

            return res;
        }
    }
}
