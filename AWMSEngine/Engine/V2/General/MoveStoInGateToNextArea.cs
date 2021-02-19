using AMWUtil.Common;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.General
{
    public class MoveStoInGateToNextArea : BaseEngine<MoveStoInGateToNextArea.TReq, MoveStoInGateToNextArea.TRes>
    {
        public class TReq
        {
            public long? stoID;
            public StorageObjectType? stoType;

        }
        public class TRes
        {
            public StorageObjectCriteria mapsto;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var mapsto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(reqVO.stoID.Value, reqVO.stoType.Value, false, true, this.BuVO);
            if (mapsto != null)
            {
                var desAreas = ADO.WMSDB.AreaADO.GetInstant().ListDestinationArea(IOType.OUTBOUND, mapsto.areaID.Value, this.BuVO);

                var nextArea = desAreas.FirstOrDefault(x => x.DefaultFlag == YesNoFlag.YES);

                if (nextArea != null && nextArea.Sou_AreaMasterType_ID == AreaMasterTypeID.MC_GATE)
                {
                    if (nextArea.Des_AreaLocationMaster_ID.HasValue)
                    {
                        mapsto.parentType = StorageObjectType.LOCATION;
                        mapsto.parentID = nextArea.Des_AreaLocationMaster_ID.Value;
                    }
                    else
                    {
                        mapsto.parentID = null;
                    }
                    mapsto.ToTreeList().ForEach(x =>
                    {
                        x.areaID = nextArea.Des_AreaMaster_ID.Value;
                        ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(x, this.BuVO);
                    });
                    //ADO.WMSDB.StorageObjectADO.GetInstant().UpdateLocationToChild(mapsto, nextArea.Des_AreaLocationMaster_ID.Value, this.BuVO);
                }
            }

            return new TRes() { mapsto = mapsto };
        }

    }
}
