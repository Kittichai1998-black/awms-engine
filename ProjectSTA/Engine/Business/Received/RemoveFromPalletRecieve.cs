using AMWUtil.Common;
using AWMSEngine.ADO;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
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
            public string cartons;
            public string productCode;
            public string orderNo;
            public decimal count;
        }

        protected override StorageObjectCriteria ExecuteEngine(TReq reqVO)
        {
            var stos = StorageObjectADO.GetInstant().Get(reqVO.baseStoID, null, reqVO.areaID, false, true, this.BuVO);
            var packs = new List<StorageObjectCriteria>();
            if (string.IsNullOrWhiteSpace(reqVO.orderNo))
            {
                packs = stos.ToTreeList().FindAll(x => x.type == StorageObjectType.PACK && x.code == reqVO.productCode );
            }
            else
            {
                packs = stos.ToTreeList().FindAll(x => x.type == StorageObjectType.PACK && x.code == reqVO.productCode && x.orderNo == reqVO.orderNo);
            }

            if (string.IsNullOrWhiteSpace(reqVO.cartons))
                packs.ForEach(x => StorageObjectADO.GetInstant().UpdateStatus(x.id.Value, StorageObjectEventStatus.NEW, null, StorageObjectEventStatus.REMOVED, this.BuVO));
            else
            {
                packs.ForEach(x =>
                {
                    var optionsNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(x.options, OptionVOConst.OPT_CARTON_NO, reqVO.cartons);
                    x.options = optionsNew;
                    x.qty = reqVO.count;
                    x.baseQty = this.StaticValue.ConvertToBaseUnitByPack(x.mstID.Value, reqVO.count, x.unitID).baseQty;
                    StorageObjectADO.GetInstant().PutV2(x, this.BuVO);
                });
            }
            return StorageObjectADO.GetInstant().Get(stos.id.Value, StorageObjectType.BASE, false, true, this.BuVO);
        }
    }
}
