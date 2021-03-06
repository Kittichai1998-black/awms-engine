using AMWUtil.Common;
using AMWUtil.Exception;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business
{
    public class UpdateSTOandDiSTOfromDoc : BaseEngine<UpdateSTOandDiSTOfromDoc.TReq, NullCriteria>
    {

        public class TReq
        {
            public long? distoID;
            public decimal? Quantity;
        }

        protected override NullCriteria ExecuteEngine(TReq reqVO)
        {
            var getDiSTO = ADO.WMSDB.DataADO.GetInstant().SelectByID<amt_DocumentItemStorageObject>(reqVO.distoID.Value, this.BuVO);

            if (getDiSTO == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูล Document Item Storage Object");
            var getStoPack = ADO.WMSDB.StorageObjectADO.GetInstant().Get(getDiSTO.Sou_StorageObject_ID, StorageObjectType.PACK, false, false, BuVO);
            if (getStoPack == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูลของ Pack");

            var baseUnitTypeConvt = StaticValue.ConvertToBaseUnitBySKU(getStoPack.skuID.Value, reqVO.Quantity.Value, getStoPack.unitID);

            getStoPack.qty = baseUnitTypeConvt.oldQty;
            getStoPack.baseQty = baseUnitTypeConvt.newQty;


            var getDocItem = ADO.WMSDB.DocumentADO.GetInstant().GetItemAndStoInDocItem(getDiSTO.DocumentItem_ID.Value, BuVO);
            if (getDocItem == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูล Document Item");
            getDocItem.DocItemStos.ForEach(x => {

                if (x.ID == getDiSTO.ID.Value)
                {
                    x.Quantity = getStoPack.qty;
                    x.BaseQuantity = getStoPack.baseQty;
                }
            });

            decimal sumQtyDisto = getDocItem.DocItemStos.Sum(z => z.Quantity ?? 0);
            decimal totalQty = getDocItem.Quantity ?? 0;
            if (sumQtyDisto > totalQty)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "จำนวนสินค้าของรายการ SKU: " + getDocItem.Code + " ที่ต้องการรับเข้าเกินจำนวนที่ระบุในเอกสาร");

            var stoIDUpdated = ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(getStoPack, this.BuVO);

            ADO.WMSDB.DistoADO.GetInstant().Update(getDiSTO.ID.Value, null, reqVO.Quantity.Value, baseUnitTypeConvt.newQty, EntityStatus.INACTIVE, BuVO);

            return null;
        }

    }
}