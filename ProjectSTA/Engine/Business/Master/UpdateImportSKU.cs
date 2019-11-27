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
            public decimal? WeightKG;
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
                var checkSKU = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_SKUMaster>(
                    new SQLConditionCriteria[] {
                    new SQLConditionCriteria("Code",data.Code, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status",EntityStatus.ACTIVE,SQLOperatorType.EQUALS)
                }, this.BuVO);

                

                if (checkSKU.Count != 0)//มี SKU ซ็ำ
                {
                    var dataObjectSizeID = StaticValue.ObjectSizes.FirstOrDefault(x => x.Code == data.ObjectSize).ID.Value;
                    var dataBaseUnit = StaticValue.UnitTypes.FirstOrDefault(x => x.Code == data.Base_Unit_Type).ID.Value;
                    var checkBaseAndObject = checkSKU.FindAll(x => x.ObjectSize_ID == dataObjectSizeID || x.UnitType_ID == dataBaseUnit);
                    if (checkBaseAndObject.Count != 0)
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Code "+ data.Code + " มี ObjectSize หรือ BaseUnitType ที่ซ้ำกัน");
                    }

                    foreach (var dataSKU in checkSKU)
                    {
                    var skuUpdate = AWMSEngine.ADO.DataADO.GetInstant().UpdateBy<ams_SKUMaster>(
                            new SQLConditionCriteria[] {
                            new SQLConditionCriteria("ID", dataSKU.ID, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("Code", dataSKU.Code, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS)
                            },
                                new KeyValuePair<string, object>[] {
                                new KeyValuePair<string, object>("Code",data.Code),
                                new KeyValuePair<string, object>("Name",data.Name),
                                new KeyValuePair<string, object>("SKUMasterType_ID",StaticValue.SKUMasterTypes.FirstOrDefault(x => x.Code == data.SKUMasterType).ID.Value),
                                new KeyValuePair<string, object>("ObjectSize_ID",StaticValue.ObjectSizes.FirstOrDefault(x => x.Code == data.ObjectSize).ID.Value),
                                new KeyValuePair<string, object>("UnitType_ID",StaticValue.UnitTypes.FirstOrDefault(x => x.Code == data.Base_Unit_Type).ID.Value),
                                new KeyValuePair<string, object>("WeightKG",data.WeightKG),
                                new KeyValuePair<string, object>("Status",EntityStatus.ACTIVE)
                            }, this.BuVO);

                     var pack = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_PackMaster>(dataSKU.ID.Value, this.BuVO);

                       
                            var packUpdate = AWMSEngine.ADO.DataADO.GetInstant().UpdateBy<ams_PackMaster>(new SQLConditionCriteria[] {
                            new SQLConditionCriteria("ID",pack.ID, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("Status",EntityStatus.ACTIVE,SQLOperatorType.EQUALS)
                            },
                                new KeyValuePair<string, object>[] {
                                new KeyValuePair<string, object>("Code",data.Code),
                                new KeyValuePair<string, object>("Name",data.Name),
                                new KeyValuePair<string, object>("Description",data.Description),
                                new KeyValuePair<string, object>("SKUMaster_ID",StaticValue.SKUMasterTypes.FirstOrDefault(x => x.Code == data.SKUMasterType).ID.Value),
                                new KeyValuePair<string, object>("PackMasterType_ID",null),
                                new KeyValuePair<string, object>("Quantity",data.Sale_Qty),
                                new KeyValuePair<string, object>("UnitType_ID",StaticValue.UnitTypes.FirstOrDefault(x => x.Code == data.Sale_Unit_Type).ID.Value),
                                new KeyValuePair<string, object>("BaseQuantity",data.Base_Qty),
                                new KeyValuePair<string, object>("BaseUnitType_ID",StaticValue.UnitTypes.FirstOrDefault(x => x.Code == data.Base_Unit_Type).ID.Value),
                                new KeyValuePair<string, object>("ObjectSize_ID",StaticValue.ObjectSizes.FirstOrDefault(x => x.Code == data.ObjectSize).ID.Value),
                                new KeyValuePair<string, object>("ItemQty",0),
                                new KeyValuePair<string, object>("Status",EntityStatus.ACTIVE)

                            }, this.BuVO);
                     
                    }

                }
                else
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

                    if (skuInsert != null)
                    {
                        AWMSEngine.ADO.DataADO.GetInstant().Insert<ams_PackMaster>(this.BuVO, new ams_PackMaster()
                        {
                            Code = data.Code,
                            Name = data.Name,
                            Description = data.Description,
                            SKUMaster_ID = skuInsert.Value,
                            PackMasterType_ID = null,
                            Quantity = data.Sale_Qty,
                            UnitType_ID = StaticValue.UnitTypes.FirstOrDefault(x => x.Code == data.Sale_Unit_Type).ID.Value,
                            BaseQuantity = data.Base_Qty,
                            BaseUnitType_ID = StaticValue.UnitTypes.FirstOrDefault(x => x.Code == data.Base_Unit_Type).ID.Value,
                            ObjectSize_ID = StaticValue.ObjectSizes.FirstOrDefault(x => x.Code == data.ObjectSize).ID.Value,
                            ItemQty = 0,
                            Status = EntityStatus.ACTIVE

                        });
                    }
                    else
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Insert SKU Fail");
                    }
                }


            });


            return null;
        }
    }
}
