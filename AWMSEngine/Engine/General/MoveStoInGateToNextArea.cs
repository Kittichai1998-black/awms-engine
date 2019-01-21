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
            public long baseStoID;
        }
        public class TRes
        {
            public StorageObjectCriteria mapsto;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var mapsto = ADO.StorageObjectADO.GetInstant().Get(reqVO.baseStoID, StorageObjectType.BASE, false, true, this.BuVO);
            var desAreas = ADO.AreaADO.GetInstant().ListDestinationArea(IOType.OUTPUT,mapsto.areaID, this.BuVO);
            var nextArea = desAreas.FirstOrDefault(x => x.DefaultFlag == YesNoFlag.YES);
            if(nextArea != null)
            {
                mapsto.areaID = nextArea.Des_AreaMaster_ID.Value;
                if (nextArea.Des_AreaLocationMaster_ID.HasValue)
                {
                    mapsto.parentID = nextArea.Des_AreaLocationMaster_ID.Value;
                    mapsto.parentType = StorageObjectType.LOCATION;
                }
                ADO.StorageObjectADO.GetInstant().PutV2(mapsto, this.BuVO);
            }

            return new TRes() { mapsto = mapsto };
        }

    }
}
