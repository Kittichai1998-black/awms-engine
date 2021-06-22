using ADO.WMSDB;
using ADO.WMSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria.SP.Response;
using AMSModel.Entity;
using AMWUtil.Common;
using ProjectGCL.GCLModel.Criterie;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.Engine.v2
{
    public class SCE05_SkuMaster_Engine : AWMSEngine.Engine.BaseEngine<TREQ_SkuMaster, TRES__return>
    {
        protected override TRES__return ExecuteEngine(TREQ_SkuMaster reqVO)
        {
            reqVO.RECORD.LINE.ForEach(x =>
            {
                exec(x);
            });

            return new TRES__return();
        }
        private void exec(TREQ_SkuMaster.TRecord.TLine req)
        {
            var unit = this.StaticValue.UnitTypes.First(x => x.Code == req.BASE_UNIT);
            ams_SKUMaster sku = new ams_SKUMaster()
            {
                Code = req.SKU,
                Name = req.SKU_DES,
                Description = "",
                UnitType_ID = unit.ID,
                Status = EntityStatus.ACTIVE
            };
            sku.ID = DataADO.GetInstant().Insert<ams_SKUMaster>(sku, BuVO);
            ams_PackMaster pack = new ams_PackMaster()
            {
                SKUMaster_ID = sku.ID.Value,
                Name = sku.Name,
                Code = sku.Code,
                Description = sku.Description,
                ObjectSize_ID = 3,
                PackMasterType_ID = 1,
                Status = EntityStatus.ACTIVE,
                UnitType_ID = sku.UnitType_ID.Value,
            };
            pack.ID = DataADO.GetInstant().Insert<ams_PackMaster>(pack, BuVO);
            this.StaticValue.LoadPackUnitConvert();
        }
    }
}
