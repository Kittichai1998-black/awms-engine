using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Engine.General;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
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
                public string weightUnit;
                public string type;
                public string unit;
                public EntityStatus status;
                public List<ConvertUnit> converts;
                public class ConvertUnit
                {
                    public decimal qtyNum;
                    public decimal qtyDen;
                    public string unit;
                }
            }
        }

        public PutMaterialAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            TModel req = ObjectUtil.DynamicToModel<TModel>(this.RequestVO);

            var dataReqs = req.datas;

            this.PutUnitType(dataReqs);
            this.PutSKUMasterType(dataReqs);
            //this.PutPackMasterType(dataReqs);

            this.BeginTransaction();
            this.PutSKUMaster(dataReqs);
            this.PutPackMaster(dataReqs);

            return dataReqs;
        }

        private void PutUnitType(List<TModel.TData> dataReqs)
        {
            List<string> unitReqs = new List<string>();
            dataReqs.ForEach(x => { unitReqs.Add(x.unit); x.converts.ForEach(y => unitReqs.Add(y.unit)); });
            unitReqs = unitReqs.Distinct().Where(x => !StaticValueManager.GetInstant().UnitTypes.Any(y => y.Code == x && y.ObjectType == StorageObjectType.PACK)).ToList();
            
            if (unitReqs.Count() > 0)
            {
                this.BeginTransaction();
                var putDatas = unitReqs.Select(x => new ams_UnitType()
                {
                    Code = x,
                    Name = x,
                    ObjectType = StorageObjectType.PACK,
                    Status = EntityStatus.ACTIVE
                }).ToList();
                new PutMaster<ams_UnitType>().Execute(
                    this.Logger,
                    this.BuVO,
                    new PutMaster<ams_UnitType>.TReq() { datas = putDatas, whereFields = new List<string> { "Code" } });
                StaticValueManager.GetInstant().LoadUnitType(this.BuVO);
                this.CommitTransaction();
            }
        }

        private void PutSKUMasterType(List<TModel.TData> dataReqs)
        {
            List<string> typeReqs = dataReqs.GroupBy(x => x.type).Select(x => x.Key).ToList();
            typeReqs.RemoveAll(x => StaticValueManager.GetInstant().SKUMasterTypes.Any(y => y.Code == x));

            if (typeReqs.Count() > 0)
            {
                this.BeginTransaction();
                var putDatas = typeReqs.Select(x => new ams_SKUMasterType()
                {
                    Code = x,
                    Name = x,
                    ObjectSize_ID = StaticValueManager.GetInstant().ObjectSizes.First(y => y.ObjectType == StorageObjectType.PACK).ID,//Normal Pack
                    UnitType_ID = null,
                    Status = EntityStatus.ACTIVE
                }).ToList();
                new PutMaster<ams_SKUMasterType>().Execute(
                    this.Logger,
                    this.BuVO,
                    new PutMaster<ams_SKUMasterType>.TReq() { datas = putDatas, whereFields = new List<string> { "Code" } });
                StaticValueManager.GetInstant().LoadSKUMasterType(this.BuVO);
                this.CommitTransaction();
            }
        }

        private void PutPackMasterType(List<TModel.TData> dataReqs)
        {
            List<string> typeReqs = dataReqs.GroupBy(x => x.type).Select(x => x.Key).ToList();
            typeReqs.RemoveAll(x => StaticValueManager.GetInstant().PackMasterTypes.Any(y => y.Code == x));

            if (typeReqs.Count() > 0)
            {
                this.BeginTransaction();
                var putDatas = typeReqs.Select(x => new ams_PackMasterType()
                {
                    Code = x,
                    Name = x,
                    ObjectSize_ID = StaticValueManager.GetInstant().ObjectSizes.First(y=>y.ObjectType == StorageObjectType.PACK).ID,//Normal Pack
                    UnitType_ID = null,
                    Status = EntityStatus.ACTIVE
                }).ToList();
                new PutMaster<ams_PackMasterType>().Execute(
                    this.Logger,
                    this.BuVO,
                    new PutMaster<ams_PackMasterType>.TReq() { datas = putDatas, whereFields = new List<string> { "Code" } });
                StaticValueManager.GetInstant().LoadPackMasterType(this.BuVO);
                this.CommitTransaction();
            }
        }

        private void PutSKUMaster(List<TModel.TData> dataReqs)
        {
            //------------------
            var putDatas = dataReqs.Select(x => new ams_SKUMaster()
            {
                Code = x.code,
                Name = x.name,
                Description = x.description,
                WeightKG = WeightUtil.ConvertToKG(x.weight, x.weightUnit),
                SKUMasterType_ID = StaticValueManager.GetInstant().SKUMasterTypes.First(y => y.Code == x.type).ID.Value,
                ObjectSize_ID = StaticValueManager.GetInstant().SKUMasterTypes.First(y => y.Code == x.type).ObjectSize_ID.Value,
                UnitType_ID = StaticValueManager.GetInstant().UnitTypes.First(y => y.Code == x.unit).ID.Value,
                Status = x.status
            }).ToList();
            
            new PutMaster<ams_SKUMaster>().Execute(
                this.Logger,
                this.BuVO,
                new PutMaster<ams_SKUMaster>.TReq() { datas = putDatas, whereFields = new List<string> { "Code" } });


        }

        private void PutPackMaster(List<TModel.TData> dataReqs)
        {
            dataReqs.ForEach(sku =>
            {
                List<ams_PackMaster> putDatas = new List<ams_PackMaster>();
                
                sku.converts.ForEach(pack =>
                {
                    decimal itemQty = pack.qtyNum / pack.qtyDen;
                    var putData = new ams_PackMaster()
                    {
                        Code = sku.code,
                        Name = sku.name,
                        SKUMaster_ID = ADO.DataADO.GetInstant().SelectByCodeActive<ams_SKUMaster>(sku.code, this.BuVO).ID.Value,
                        Description = sku.description,
                        WeightKG = sku.weight * pack.qtyNum,
                        Quantity = pack.qtyDen,
                        UnitType_ID = StaticValueManager.GetInstant().UnitTypes.First(y => y.Code == pack.unit).ID.Value,
                        BaseQuantity = pack.qtyNum,
                        ItemQty = itemQty,
                        BaseUnitType_ID = StaticValueManager.GetInstant().UnitTypes.First(y => y.Code == sku.unit).ID.Value,
                        Revision = 1,
                        PackMasterType_ID = null,
                        ObjectSize_ID = StaticValueManager.GetInstant().SKUMasterTypes.First(y => y.Code == sku.type).ObjectSize_ID.Value,
                        Status = EntityStatus.ACTIVE
                    };
                    putDatas.Add(putData);
                });

                var packMasters = ADO.DataADO.GetInstant().SelectBy<ams_PackMaster>(new SQLConditionCriteria[] {
                    new SQLConditionCriteria("Code",sku.code, SQLOperatorType.EQUALS)
                }, this.BuVO);
                packMasters.ForEach(x => {
                    if (!putDatas.Any(y =>
                                        y.Code == x.Code &&
                                        y.UnitType_ID == x.UnitType_ID && 
                                        y.BaseUnitType_ID == x.BaseUnitType_ID))
                    {
                        x.Status = EntityStatus.REMOVE;
                        putDatas.Add(x);
                    }
                });
                new PutMaster<ams_PackMaster>().Execute(
                    this.Logger,
                    this.BuVO,
                    new PutMaster<ams_PackMaster>.TReq() { datas = putDatas, whereFields = new List<string> { "Code", "UnitType_ID", "BaseUnitType_ID" } });
                StaticValueManager.GetInstant().LoadPackUnitConvert(this.BuVO);
            });

        }
    }
}
