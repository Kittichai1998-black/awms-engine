using AMWUtil.Common;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.General
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
            var mapsto = ADO.StorageObjectADO.GetInstant().Get(reqVO.stoID.Value, reqVO.stoType.Value, false, true, this.BuVO);
            var desAreas = ADO.AreaADO.GetInstant().ListDestinationArea(IOType.OUTPUT, mapsto.areaID.Value, this.BuVO);

            var nextArea = desAreas.FirstOrDefault(x => x.DefaultFlag == YesNoFlag.YES);

            if (nextArea != null && nextArea.Sou_AreaMasterType_ID == AreaMasterTypeID.MACHINE_GATE)
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
                    ADO.StorageObjectADO.GetInstant().PutV2(x, this.BuVO);
                });
                //ADO.StorageObjectADO.GetInstant().UpdateLocationToChild(mapsto, nextArea.Des_AreaLocationMaster_ID.Value, this.BuVO);
            }


            return new TRes() { mapsto = mapsto };
        }

    }
}
