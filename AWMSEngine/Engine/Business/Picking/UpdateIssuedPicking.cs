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
            public long docID;
            public List<UpdateQty> pickedList;

            public class UpdateQty
            {
                public long? docItemID;
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
            reqVO.pickedList.ForEach(x =>
            {
                var getItemID = ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[] {
                    new SQLConditionCriteria("ID", reqVO.docID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Batch", x.batch, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Lot", x.lot, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("EventStatus", StorageObjectEventStatus.PICKING, SQLOperatorType.EQUALS)}, this.BuVO).FirstOrDefault().ID;

                if (x.picked > x.palletQty)
                    throw new AMWException(this.Logger, AMWExceptionCode.B0002, "ไม่สามารถหยิบสินค้าเกินจำนวนในพาเลทได้");
                else if(x.picked > x.canPick)
                    throw new AMWException(this.Logger, AMWExceptionCode.B0002, "ไม่สามารถหยิบสินค้าเกินจำนวนที่ต้องหยิบได้");

                var getList = ADO.DocumentADO.GetInstant().ListItemCanMap(x.packCode, DocumentTypeID.GOODS_ISSUED, x.batch, x.lot, this.BuVO).Where(y=>y.DocumentItem_ID == x.docItemID).FirstOrDefault();

                if(x.palletQty == x.picked)
                {
                    ADO.DataADO.GetInstant().UpdateByID<amt_StorageObject>(getItemID.Value, this.BuVO, new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("BaseQur", StorageObjectEventStatus.PICKED)
                    });
                }


                ADO.StorageObjectADO.GetInstant().UpdatePicking(reqVO.palletCode, x.docItemID.Value, x.packCode, x.batch, x.lot, 0, x.picked );

            });

            throw new NotImplementedException();
        }
    }
}
