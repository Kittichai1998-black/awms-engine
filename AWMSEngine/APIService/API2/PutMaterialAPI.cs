using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Engine.General;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Api2
{
    public class PutMaterialAPI : BaseAPIService
    {
        public class TModel
        {
            public List<TData> datas;
            public class TData
            {
                public string code;
                public string name;
                public string description;
                public decimal weight;
                public string type;
                public string unit;
                public EntityStatus status;
            }
        }

        public PutMaterialAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();

            TModel req = ObjectUtil.DynamicToModel<TModel>(this.RequestVO);
            var dataReqs = req.datas;
            List<string> unitReqs = dataReqs.GroupBy(x => x.unit).Select(x => x.Key).ToList();
            List<string> typeReqs = dataReqs.GroupBy(x => x.type).Select(x => x.Key).ToList();
            unitReqs.RemoveAll(x => StaticValueManager.GetInstant().UnitTypes.Any(y => y.Code == x));
            typeReqs.RemoveAll(x => StaticValueManager.GetInstant().SKUMasterTypes.Any(y => y.Code == x));
            if (unitReqs.Count() > 0)
            {
                var unitParams = unitReqs.Select(x => new ams_UnitType()
                {
                    Code = x,
                    Name = x,
                    Status = EntityStatus.ACTIVE
                }).ToList();
                new MasterPut<ams_UnitType>().Execute(this.Logger, this.BuVO, unitParams);
                StaticValueManager.GetInstant().LoadUnitType();
            }
            if (typeReqs.Count() > 0)
            {
                var typeParams = typeReqs.Select(x => new ams_SKUMasterType()
                {
                    Code = x,
                    Name = x,
                    ObjectSize_ID = 5,//Normal Pack
                    UnitType_ID = null,
                    Status = EntityStatus.ACTIVE
                }).ToList();
                new MasterPut<ams_SKUMasterType>().Execute(this.Logger, this.BuVO, typeParams);
                StaticValueManager.GetInstant().LoadSKUMasterType();
            }
            //------------------
            var skuParams = dataReqs.Select(x => new ams_SKUMaster()
            {
                Code = x.code,
                Name = x.name,
                Description = x.description,
                WeightKG = x.weight,
                SKUMasterType_ID = StaticValueManager.GetInstant().SKUMasterTypes.First(y => y.Code == x.type).ID.Value,
                ObjectSize_ID = StaticValueManager.GetInstant().SKUMasterTypes.First(y => y.Code == x.type).ObjectSize_ID.Value,
                UnitType_ID = StaticValueManager.GetInstant().UnitTypes.First(y => y.Code == x.unit).ID.Value,
                Status = x.status
            }).ToList();
            new MasterPut<ams_SKUMaster>().Execute(this.Logger, this.BuVO, skuParams);

            return dataReqs;
        }
    }
}
