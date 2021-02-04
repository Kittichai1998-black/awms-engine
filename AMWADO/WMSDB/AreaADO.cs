using AMWUtil.Exception;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Criteria.SP.Response;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ADO.WMSDB
{
    public class AreaADO : BaseWMSDB<AreaADO>
    {
        public List<SPOutCountItemInLocation> CountItemInLocation(
            long? warehouseID, long? areaID, string locationCode, string gate, string bank, int? bay, int? level, VOCriteria buVO)
        {
            //SP_LOCATION_COUNT_ITEM
            Dapper.DynamicParameters parameters = new Dapper.DynamicParameters();
            parameters.Add("warehouseID", warehouseID);
            parameters.Add("areaID", areaID);
            parameters.Add("locationCode", locationCode);
            parameters.Add("gate", gate);
            parameters.Add("bank", bank);
            parameters.Add("bay", bay);
            parameters.Add("level", level);

            var res = this.Query<SPOutCountItemInLocation>("SP_LOCATION_COUNT_ITEM", System.Data.CommandType.StoredProcedure, parameters, buVO.Logger, buVO.SqlTransaction).ToList();
            return res;
        }
        public List<SPOutCountItemInLocation> CountItemInLocation(
            string warehouseCode, string areaCode, string bank, int? bay, int level, VOCriteria buVO)
        {
            var wm = WMSStaticValue.StaticValueManager.GetInstant().Warehouses.FirstOrDefault(x => x.Code == warehouseCode);
            var am = WMSStaticValue.StaticValueManager.GetInstant().AreaMasters.FirstOrDefault(x => x.Code == areaCode);
            if (wm == null)
                throw new AMWException(buVO.Logger, AMWExceptionCode.V1001, "ไม่พบรหัส Warehouse '" + warehouseCode + "'");
            if (am == null)
                throw new AMWException(buVO.Logger, AMWExceptionCode.V1001, "ไม่พบรหัส Area '" + areaCode + "'");
            return CountItemInLocation(wm.ID.Value, am.ID.Value, null, null, bank, bay, level, buVO);
        }
        public List<SPOutAreaLineCriteria> ListDestinationArea(IOType ioType, long souAreaID, VOCriteria buVO)
        {
            return this.ListDestinationArea(ioType, souAreaID, null, buVO);
        }
        public List<SPOutAreaLineCriteria> ListDestinationArea(IOType ioType, long souAreaID, long? souLocationID, VOCriteria buVO)
        {
            Dapper.DynamicParameters datas = new Dapper.DynamicParameters();
            datas.Add("ioType", ioType);
            datas.Add("souAreaID", souAreaID);
            datas.Add("souLocationID", souLocationID);
            var res = this.Query<SPOutAreaLineCriteria>("SP_AREA_DES_LIST_BY_SOU", System.Data.CommandType.StoredProcedure, datas, buVO.Logger, buVO.SqlTransaction).ToList();
            return res;
        }

        public List<ams_AreaLocationMaster> ListAreaLocationMaster(long[] id, VOCriteria buVO)
        {
           var res = DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
               new SQLConditionCriteria("id", string.Join(",", id), SQLOperatorType.IN),
               buVO);
            return res;
        }
    }
}
