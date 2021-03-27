using ADO.WMSDB;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria.API;
using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class UpdateBaseStoLocation : BaseEngine<WMReq_UpdateBaseStoLocation, WMRes_UpdateBaseStoLocation>
    {
        protected override WMRes_UpdateBaseStoLocation ExecuteEngine(WMReq_UpdateBaseStoLocation reqVO)
        {
            var wh = this.StaticValue.Warehouses.First(x => x.Code == reqVO.warehouseCode);
            var bsto = ADO.WMSDB.StorageObjectADO.GetInstant()
                .Get(reqVO.baseCode, wh.ID.Value, null, false, false, this.BuVO);
            if(bsto != null && bsto.parentType== StorageObjectType.LOCATION)
            {
                var area = this.StaticValue.GetAreaMaster(reqVO.areaCode);
                var loc = ADO.WMSDB.MasterADO.GetInstant().GetAreaLocationMaster(reqVO.locationCode, area.ID.Value, this.BuVO);
                StorageObjectADO.GetInstant().UpdateLocationToChild(bsto, loc.ID.Value, this.BuVO);
            }
            return reqVO.Cast2<WMRes_UpdateBaseStoLocation>();
        }


    }
}
