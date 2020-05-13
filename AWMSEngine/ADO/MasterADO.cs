using AMWUtil.Exception;
using AWMSEngine.ADO.StaticValue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO
{
    public class MasterADO : BaseMSSQLAccess<MasterADO>
    {
        public AWMSModel.Entity.ams_PackMaster GetAreaLocationMaster(long locationID, VOCriteria buVO)
        {
            var packMst = DataADO.GetInstant().SelectBy<ams_PackMaster>(new KeyValuePair<string, object>[]
            {
                new KeyValuePair<string, object>("ID", locationID),
                new KeyValuePair<string, object>("Status",1)
            }, buVO).FirstOrDefault();
            return packMst;
        }
        public AWMSModel.Entity.ams_AreaLocationMaster GetAreaLocationMaster(string locationCode,long areaID, VOCriteria buVO)
        {
            var mst = DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(new KeyValuePair<string, object>[]
            {
                new KeyValuePair<string, object>("Code", locationCode),
                new KeyValuePair<string, object>("AreaMaster_ID", areaID),
                new KeyValuePair<string, object>("Status",1)
            }, buVO).FirstOrDefault();
            return mst;
        }
        public AWMSModel.Entity.ams_PackMaster GetPackMasterBySKU(long skuID, VOCriteria buVO)
        {
            var packMst = DataADO.GetInstant().SelectBy<ams_PackMaster>(new KeyValuePair<string, object>[]
            {
                new KeyValuePair<string, object>("SKUMaster_ID",skuID),
                new KeyValuePair<string, object>("Status",1)
            }, buVO).FirstOrDefault();
            return packMst;
        }
        public AWMSModel.Entity.ams_PackMaster GetPackMasterBySKU(long skuID, string unitTypeCode, VOCriteria buVO)
        {
            var unitType = StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(x => x.ObjectType == StorageObjectType.PACK && x.Code == unitTypeCode);
            if (unitType == null)
                return null;
            var packMst = DataADO.GetInstant().SelectBy<ams_PackMaster>(new KeyValuePair<string, object>[]
            {
                new KeyValuePair<string, object>("SKUMaster_ID",skuID),
                new KeyValuePair<string, object>("UnitType_ID",unitType.ID.Value),
                new KeyValuePair<string, object>("Status",1)
            }, buVO).FirstOrDefault();
            return packMst;
        }
        public AWMSModel.Entity.ams_PackMaster GetPackMasterBySKU(string skuCode, VOCriteria buVO)
        {
            var skuMst = DataADO.GetInstant().SelectByCodeActive<ams_SKUMaster>(skuCode, buVO);
            if (skuMst == null)
                throw new AMWException(buVO.Logger, AMWExceptionCode.V1001, "SKUCode : " + skuCode);
            var packMst = GetPackMasterBySKU(skuMst.ID.Value, buVO); ;
            return packMst;
        }
        public AWMSModel.Entity.ams_PackMaster GetPackMasterByPack(string packCode, string unitTypeCode, VOCriteria buVO)
        {
            var unitType = StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(x => x.ObjectType == StorageObjectType.PACK && x.Code == unitTypeCode);
            if (unitType == null)
                return null;
            var packMst = DataADO.GetInstant().SelectBy<ams_PackMaster>(new KeyValuePair<string, object>[]
            {
                new KeyValuePair<string, object>("Code",packCode),
                new KeyValuePair<string, object>("UnitType_ID",unitType.ID.Value),
                new KeyValuePair<string, object>("Status",1)
            }, buVO).FirstOrDefault();
            return packMst;
        }
        public AWMSModel.Entity.ams_PackMaster GetPackMasterByPack(string packCode, VOCriteria buVO)
        {
            var packMst = DataADO.GetInstant().SelectBy<ams_PackMaster>(new KeyValuePair<string, object>[]
            {
                new KeyValuePair<string, object>("Code",packCode),
                new KeyValuePair<string, object>("Status",1)
            }, buVO).FirstOrDefault();
            return packMst;
        }


        public AWMSModel.Entity.ams_SKUMaster GetSKUMaster(long packID, VOCriteria buVO)
        {
            var packMst = DataADO.GetInstant().SelectByID<ams_PackMaster>(packID, buVO);
            var skuMst = DataADO.GetInstant().SelectByID<ams_SKUMaster>(packMst.SKUMaster_ID, buVO);
            return skuMst;
        }
        public AWMSModel.Entity.ams_SKUMaster GetSKUMasterByCode(string skuCode, VOCriteria buVO)
        {
            var skuMst = DataADO.GetInstant().SelectByCodeActive<ams_SKUMaster>(skuCode, buVO);
            return skuMst;
        }
    }
}
