using AMWUtil.Exception;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO
{
    public class AreaADO : BaseMSSQLAccess<AreaADO>
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
            var wm = StaticValue.StaticValueManager.GetInstant().Warehouses.FirstOrDefault(x => x.Code == warehouseCode);
            var am = StaticValue.StaticValueManager.GetInstant().AreaMasters.FirstOrDefault(x => x.Code == areaCode);
            if (wm == null)
                throw new AMWException(buVO.Logger, AMWExceptionCode.V1001, "ไม่พบรหัส Warehouse '" + warehouseCode + "'");
            if (am == null)
                throw new AMWException(buVO.Logger, AMWExceptionCode.V1001, "ไม่พบรหัส Area '" + areaCode + "'");
            return CountItemInLocation(wm.ID.Value, am.ID.Value, null, null, bank, bay, level, buVO);
        }
        public List<SPOutAreaLineCriteria> ListDestinationArea(long souAreaID, VOCriteria buVO)
        {
            return this.ListDestinationArea(souAreaID, null, buVO);
        }
        public List<SPOutAreaLineCriteria> ListDestinationArea(long souAreaID, long? souLocationID, VOCriteria buVO)
        {
            Dapper.DynamicParameters datas = new Dapper.DynamicParameters();
            datas.Add("souAreaID", souAreaID);
            datas.Add("souLocationID", souLocationID);
            var res = this.Query<SPOutAreaLineCriteria>("SP_AREA_DES_LIST_BY_SOU", System.Data.CommandType.StoredProcedure, datas, buVO.Logger, buVO.SqlTransaction).ToList();
            return res;
        }
    }
}
