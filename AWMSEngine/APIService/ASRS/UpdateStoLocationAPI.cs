using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.ASRS
{
    public class UpdateStoLocationAPI : BaseAPIService
    {

        public override int APIServiceID()
        {
            return 22;
        }
        public class TReq
        {

            public string baseCode;
            public string souWarehouseCode;
            public string souAreaCode;
            public string souLocationCode;
            public string desWarehouseCode;
            public string desAreaCode;
            public string desLocationCode;
            public DateTime actualTime;
            
        }
        public UpdateStoLocationAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<TReq>(this.RequestVO);
            var wh = ADO.StaticValue.StaticValueManager.GetInstant().Warehouses.First(x => x.Code == req.souWarehouseCode);
            var am = ADO.StaticValue.StaticValueManager.GetInstant().AreaMasters.First(x => x.Code == req.souAreaCode && x.Warehouse_ID == wh.ID.Value);
            //var alm = ADO.StaticValue.StaticValueManager.GetInstant().Warehouses.First(x => x.Code == req.souWarehouseCode);
            var sto = ADO.StorageObjectADO.GetInstant().Get(req.baseCode, wh.ID.Value, am.ID.Value, false, true, this.BuVO);


            var desWH = ADO.StaticValue.StaticValueManager.GetInstant().Warehouses.First(x => x.Code == req.desWarehouseCode);
            var desAM = ADO.StaticValue.StaticValueManager.GetInstant().AreaMasters.First(x => x.Code == req.desAreaCode && x.Warehouse_ID == desWH.ID.Value);
            var desALM = ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(new SQLConditionCriteria[] {
                new SQLConditionCriteria("AreaMaster_ID",desAM.ID.Value, AWMSModel.Constant.EnumConst.SQLOperatorType.EQUALS),
                new SQLConditionCriteria("Code",req.desLocationCode, AWMSModel.Constant.EnumConst.SQLOperatorType.EQUALS)
            }, this.BuVO).FirstOrDefault();
            ADO.StorageObjectADO.GetInstant().UpdateLocationToChild(sto, desALM.ID.Value, this.BuVO);

            return null;
        }
    }
}
