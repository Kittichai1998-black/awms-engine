using AMWUtil.Common;
using AWMSEngine.ADO;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectSTA.Engine.Business.Received
{
    public class RemoveFromPalletRecieve : BaseEngine<RemoveFromPalletRecieve.TReq, StorageObjectCriteria>
    {
        public class TReq
        {
            public string baseStoID;
            public long areaID;
        }

        protected override StorageObjectCriteria ExecuteEngine(TReq reqVO)
        {
            var stos = StorageObjectADO.GetInstant().Get(reqVO.baseStoID, null, reqVO.areaID, false, true, this.BuVO);
            stos.ToTreeList().FindAll(x => x.type == StorageObjectType.PACK).ForEach(x =>
            {
                StorageObjectADO.GetInstant().UpdateStatus(x.id.Value, StorageObjectEventStatus.NEW, null, StorageObjectEventStatus.REMOVED, this.BuVO);
            });

            return StorageObjectADO.GetInstant().Get(stos.id.Value, StorageObjectType.BASE, false, true, this.BuVO);
        }
    }
}
