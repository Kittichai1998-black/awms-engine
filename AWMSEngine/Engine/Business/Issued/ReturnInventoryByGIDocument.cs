using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Issued
{
    public class ReturnInventoryByGIDocument : BaseEngine<ReturnInventoryByGIDocument.TReq, StorageObjectCriteria>
    {
        public class TReq
        {
            public long baseID;
            public long docItemID;
            public string packCode;
            public string batch;
            public string lot;
            public string order;
            public decimal baseQty;
        }

        protected override StorageObjectCriteria ExecuteEngine(TReq reqVO)
        {
            var baseInfo = ADO.StorageObjectADO.GetInstant().Get(reqVO.baseID, StorageObjectType.BASE, false, true, this.BuVO);
            var baseTree = baseInfo.ToTreeList();
            if (baseTree.Any(x => x.type == StorageObjectType.PACK) &&
                !baseTree.FindAll(x => x.type == StorageObjectType.PACK)
                    .TrueForAll(x => x.batch == reqVO.batch && x.lot == reqVO.lot && x.orderNo == reqVO.order))
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "สินค้าใน Pallet มี Batch, Lot หรือ Order No ไม่ตรงกับสินค้าที่จะรับคืน");
            }
            return null;
            //ADO.DocumentADO.GetInstant().ListItemAndStoInDoc
        }


    }
}
