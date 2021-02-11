using AMWUtil.Exception;
using ADO.WMSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ADO.WMSDB
{
    public class MasterADO : BaseWMSDB<MasterADO>
    {
        public AMSModel.Entity.ams_PackMaster GetAreaLocationMaster(long locationID, VOCriteria buVO)
        {
            var packMst = DataADO.GetInstant().SelectBy<ams_PackMaster>(new KeyValuePair<string, object>[]
            {
                new KeyValuePair<string, object>("ID", locationID),
                new KeyValuePair<string, object>("Status",1)
            }, buVO).FirstOrDefault();
            return packMst;
        }
        public AMSModel.Entity.ams_AreaLocationMaster GetAreaLocationMaster(string locationCode,long areaID, VOCriteria buVO)
        {
            var mst = DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(new KeyValuePair<string, object>[]
            {
                new KeyValuePair<string, object>("Code", locationCode),
                new KeyValuePair<string, object>("AreaMaster_ID", areaID),
                new KeyValuePair<string, object>("Status",1)
            }, buVO).FirstOrDefault();
            return mst;
        }
        public AMSModel.Entity.ams_PackMaster GetPackMasterBySKU(long skuID, VOCriteria buVO)
        {
            var packMst = DataADO.GetInstant().SelectBy<ams_PackMaster>(new KeyValuePair<string, object>[]
            {
                new KeyValuePair<string, object>("SKUMaster_ID",skuID),
                new KeyValuePair<string, object>("Status",1)
            }, buVO).FirstOrDefault();
            return packMst;
        }
        public AMSModel.Entity.ams_PackMaster GetPackMasterBySKU(long skuID, string unitTypeCode, VOCriteria buVO)
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
        public AMSModel.Entity.ams_PackMaster GetPackMasterBySKU(string skuCode, VOCriteria buVO)
        {
            var skuMst = DataADO.GetInstant().SelectByCodeActive<ams_SKUMaster>(skuCode, buVO);
            if (skuMst == null)
                throw new AMWException(buVO.Logger, AMWExceptionCode.V1001, "SKUCode : " + skuCode);
            var packMst = GetPackMasterBySKU(skuMst.ID.Value, buVO); ;
            return packMst;
        }
        public AMSModel.Entity.ams_PackMaster GetPackMasterByPack(string packCode, string unitTypeCode, VOCriteria buVO)
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
        public AMSModel.Entity.ams_PackMaster GetPackMasterByPack(string packCode, VOCriteria buVO)
        {
            var packMst = DataADO.GetInstant().SelectBy<ams_PackMaster>(new KeyValuePair<string, object>[]
            {
                new KeyValuePair<string, object>("Code",packCode),
                new KeyValuePair<string, object>("Status",1)
            }, buVO).FirstOrDefault();
            return packMst;
        }


        public AMSModel.Entity.ams_SKUMaster GetSKUMaster(long packID, VOCriteria buVO)
        {
            var packMst = DataADO.GetInstant().SelectByID<ams_PackMaster>(packID, buVO);
            var skuMst = DataADO.GetInstant().SelectByID<ams_SKUMaster>(packMst.SKUMaster_ID, buVO);
            return skuMst;
        }
        public AMSModel.Entity.ams_SKUMaster GetSKUMasterByCode(string skuCode, VOCriteria buVO)
        {
            var skuMst = DataADO.GetInstant().SelectByCodeActive<ams_SKUMaster>(skuCode, buVO);
            return skuMst;
        }
    }
}
