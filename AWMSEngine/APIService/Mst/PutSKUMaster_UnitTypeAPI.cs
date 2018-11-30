using AWMSEngine.Engine.General;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using Microsoft.AspNetCore.Mvc;
using AWMSModel.Constant.EnumConst;
using AWMSEngine.ADO.StaticValue;

namespace AWMSEngine.APIService.Mst
{
    public class PutSKUUnitTypeMasterAPI : BaseAPIService
    {
        public PutSKUUnitTypeMasterAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        public class TReq
        {
            public string code;
            public string name;
            public string description;
            public decimal weight;
            public string unit;
            public EntityStatus status;
        }


        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();

            List<TReq> dataReqs = ObjectUtil.DynamicToModel<List<TReq>>(this.RequestVO);
            List<TReq> unitReqs = dataReqs.GroupBy(x => new TReq() { unit = x.unit }).Select(x => x.Key).ToList();
            unitReqs.RemoveAll(x => StaticValueManager.GetInstant().UnitTypes.Any(y => y.Code == x.unit));
            if (unitReqs.Count()>0)
            {
                var unitParams = unitReqs.Select(x => new ams_UnitType()
                {
                    Code = x.unit,
                    Name = x.unit,
                    Status = EntityStatus.ACTIVE
                }).ToList();
                new MasterPut<ams_UnitType>().Execute(this.Logger, this.BuVO, unitParams);
                StaticValueManager.GetInstant().LoadUnitType();
            }
            //------------------
            var skuParams = dataReqs.Select(x => new ams_SKUMaster()
            {
                Code = x.code,
                Name = x.name,
                Description = x.description,
                WeightKG = x.weight,
                UnitType_ID = StaticValueManager.GetInstant().UnitTypes.First(y => y.Code == x.unit).ID.Value,
                Status = x.status
            }).ToList();
            var res = new MasterPut<ams_SKUMaster>().Execute(this.Logger, this.BuVO, skuParams);

            return res;
        }
    }
}
