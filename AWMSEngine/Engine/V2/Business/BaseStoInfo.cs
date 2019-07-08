using AMWUtil.Exception;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business
{
    public class BaseStoInfo : BaseEngine<string, BaseStoInfo.TRes>
    {
        public class TRes : amt_StorageObject
        {
            public string AreaLocationCode;
            public string AreaMasterCode;
            public string BaseUnitTypeCode;
            public string UnitTypeCode;
            public string ObjectSizeCode;
            public List<TRes> mapstos;
        }
        protected override TRes ExecuteEngine(string reqVO)
        {
            var bSto = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[]{
                new SQLConditionCriteria("Code", reqVO, AWMSModel.Constant.EnumConst.SQLOperatorType.EQUALS)
            }, this.BuVO).OrderByDescending(x => x.ID).FirstOrDefault();

            if (bSto == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, reqVO + " Not Found");

            var stos = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[]{
                    new SQLConditionCriteria("ParentStorageObject_ID", bSto.ID, AWMSModel.Constant.EnumConst.SQLOperatorType.EQUALS)
                }, this.BuVO).OrderByDescending(x => x.ID).ToList();

            var mapStos = new List<TRes>();

            stos.ForEach(y =>
            {
                var newSto = MapValue(y);
                newSto.BaseUnitTypeCode = StaticValue.UnitTypes.FirstOrDefault(x => x.ID == newSto.BaseUnitType_ID).Code;
                newSto.UnitTypeCode = StaticValue.UnitTypes.FirstOrDefault(x => x.ID == newSto.UnitType_ID).Code;
                newSto.AreaMasterCode = StaticValue.AreaMasters.FirstOrDefault(x => x.ID == newSto.AreaMaster_ID).Code;
                mapStos.Add(newSto);
            });

            var sto = new TRes();

            sto = MapValue(bSto);

            sto.BaseUnitTypeCode = StaticValue.UnitTypes.FirstOrDefault(x => x.ID == sto.BaseUnitType_ID).Code;
            sto.UnitTypeCode = StaticValue.UnitTypes.FirstOrDefault(x => x.ID == sto.UnitType_ID).Code;
            sto.AreaLocationCode = sto.AreaLocationMaster_ID.HasValue ? AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_AreaLocationMaster>(sto.AreaLocationMaster_ID, this.BuVO).Code : null;
            sto.AreaMasterCode = StaticValue.AreaMasters.FirstOrDefault(x => x.ID == sto.AreaMaster_ID).Code;
            sto.mapstos = mapStos;

            return sto;
        }

        private TRes MapValue(amt_StorageObject data)
        {
            var sto = new TRes();
            foreach (var field in data.GetType().GetFields())
            {
                var getStoValue = field.GetValue(data);
                sto.GetType().GetField(field.Name).SetValue(sto, getStoValue);
            }
            return sto;
        }
    }
}
