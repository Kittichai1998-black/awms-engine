using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Picking
{
    public class UpdateIssuedPicking : BaseEngine<UpdateIssuedPicking.TReq, string>
    {
        public class TReq
        {
            public string palletCode;
            public long palletID;
            public long docID;
            public List<UpdateQty> pickedList;

            public class UpdateQty
            {
                public long? docItemID;
                public long STOID;
                public string packCode;
                public string batch;
                public string lot;
                public decimal palletQty;
                public decimal picked;
                public decimal canPick;
            }
        }

        public class TRes
        {
            public string palletCode;
            public long? docID;
        }

        protected override string ExecuteEngine(TReq reqVO)
        {
            var itemList = ADO.DocumentADO.GetInstant().ListItem(reqVO.docID, this.BuVO);
            var sto = ADO.StorageObjectADO.GetInstant().Get(reqVO.palletID, StorageObjectType.BASE, false, false, this.BuVO);
            var listSto = sto.ToTreeList().Where(y => y.type == StorageObjectType.PACK).Distinct().ToList();

            reqVO.pickedList.ForEach(x =>
            {
                if (x.picked > x.palletQty)
                    throw new AMWException(this.Logger, AMWExceptionCode.B0002, "ไม่สามารถหยิบสินค้าเกินจำนวนในพาเลทได้");
                else if(x.picked > x.canPick)
                    throw new AMWException(this.Logger, AMWExceptionCode.B0002, "ไม่สามารถหยิบสินค้าเกินจำนวนที่ต้องหยิบได้");
                
                var basePicked = ADO.StaticValue.StaticValueManager.GetInstant().ConvertToBaseUnitBySKU(sto.id.Value, x.picked, sto.unitID);

                var setSTO = listSto.Where(y => y.id == x.STOID).First();

                setSTO.qty = sto.qty - x.picked;
                setSTO.baseQty = sto.baseQty - basePicked.baseQty;
                setSTO.eventStatus = sto.qty - x.picked == 0 ? StorageObjectEventStatus.PICKED : StorageObjectEventStatus.PICKING;

                ADO.StorageObjectADO.GetInstant().UpdatePicking(reqVO.palletCode, x.docItemID.Value, x.packCode, x.batch, x.lot, x.picked, basePicked.baseQty, this.BuVO);
                ADO.StorageObjectADO.GetInstant().PutV2(sto, this.BuVO);

                var docTarget = ADO.DocumentADO.GetInstant().Target(reqVO.docID, DocumentTypeID.GOODS_ISSUED, this.BuVO);
                var res = docTarget.Any(z => z.needPackQty == 0);
                if(res == true)
                {
                    ADO.DocumentADO.GetInstant().UpdateStatusToChild(reqVO.docID, null, EntityStatus.ACTIVE, DocumentEventStatus.WORKED, this.BuVO);
                }
            });

            return "yep";
        }
    }
}
