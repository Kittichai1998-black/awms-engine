using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Validation;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectSTA.Engine.Business
{
    public class UpdateImportSKU : BaseEngine<UpdateImportSKU.TDocReq, UpdateImportSKU.TDocRes>
    {
        public class TDocReq
        {
            public List<ListReq> data;
        }

        public class ListReq
        {   
            public string Code;
            public string Name;
            public string Description;
            public string SKUMasterType;
            public long Base_Qty;
            public string Base_Unit_Type;
            public long Sale_Qty;
            public string Sale_Unit_Type;
            public long WeightKG;
            public string ObjectSize;
        }
        public class TDocRes
        {
            public ams_SKUMaster data;
        }

        protected override TDocRes ExecuteEngine(TDocReq reqVO)
        {
            reqVO.data.ForEach(data =>
            {
             var skuInsert = AWMSEngine.ADO.DataADO.GetInstant().Insert<ams_SKUMaster>(this.BuVO, new ams_SKUMaster()
                {
                    Code = data.Code,
                    Name = data.Name,
                    SKUMasterType_ID = StaticValue.SKUMasterTypes.FirstOrDefault(x => x.Code == data.SKUMasterType).ID.Value,
                    ObjectSize_ID = StaticValue.ObjectSizes.FirstOrDefault(x => x.Code == data.ObjectSize).ID.Value,
                    Status = EntityStatus.ACTIVE,
                    UnitType_ID = StaticValue.UnitTypes.FirstOrDefault(x => x.Code == data.Base_Unit_Type).ID.Value,
                    WeightKG = data.WeightKG
                });

                var x = skuInsert;
                if (skuInsert != null)
                {
                    AWMSEngine.ADO.DataADO.GetInstant().Insert<ams_PackMaster>(this.BuVO, new ams_PackMaster()
                    {
                        Code= data.Code,
                        Name=data.Name,
                        Description = data.Description,
                        SKUMaster_ID = skuInsert.Value,
                        PackMasterType_ID = null,
                        Quantity = data.Sale_Qty,
                        UnitType_ID = StaticValue.UnitTypes.FirstOrDefault(x => x.Code == data.Sale_Unit_Type).ID.Value,
                        BaseQuantity = data.Base_Qty,
                        BaseUnitType_ID = StaticValue.UnitTypes.FirstOrDefault(x => x.Code == data.Base_Unit_Type).ID.Value,
                        ObjectSize_ID = StaticValue.ObjectSizes.FirstOrDefault(x => x.Code == data.ObjectSize).ID.Value,
                        ItemQty = 0 ,
                        Status = EntityStatus.ACTIVE

                    });
                }
                else
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Insert SKU Fail");
                }
            });


            return null;
        }
    }
}
