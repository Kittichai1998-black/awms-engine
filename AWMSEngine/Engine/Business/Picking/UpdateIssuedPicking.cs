﻿using AMWUtil.Common;
using AMWUtil.DataAccess.Http;
using AMWUtil.Exception;
using AWMSEngine.APIService.Doc;
using AWMSEngine.Engine.Business.Issued;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Picking
{
    public class UpdateIssuedPicking : BaseEngine<UpdateIssuedPicking.TReq, UpdateIssuedPicking.TRes>
    {
        public class TReq
        {
            public string palletCode;
            public long palletID;
            public long docID;
            public PickingModeType pickMode;
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
            public amt_Document doc;
            public object closeDoc;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var itemList = ADO.DocumentADO.GetInstant().ListItem(reqVO.docID, this.BuVO);
            //var sto = ADO.StorageObjectADO.GetInstant().Get(reqVO.palletID, StorageObjectType.PACK, false, false, this.BuVO);
            //var listSto = sto.ToTreeList().Where(y => y.type == StorageObjectType.PACK).ToList();
            object close = null;
            reqVO.pickedList.ForEach(x =>
            {
                if (x.picked > x.palletQty)
                    throw new AMWException(this.Logger, AMWExceptionCode.B0002, "ไม่สามารถหยิบสินค้าเกินจำนวนในพาเลทได้");
                else if (x.picked > x.canPick)
                    throw new AMWException(this.Logger, AMWExceptionCode.B0002, "ไม่สามารถหยิบสินค้าเกินจำนวนที่ต้องหยิบได้");

                var setSTO = ADO.StorageObjectADO.GetInstant().Get(x.STOID, StorageObjectType.PACK, false, false, this.BuVO);
                //var setSTO = listSto.Where(y => y.id == x.STOID).First();
                var basePicked = ADO.StaticValue.StaticValueManager.GetInstant().ConvertToBaseUnitBySKU(setSTO.skuID.Value, x.picked, setSTO.unitID);

                setSTO.eventStatus = setSTO.qty - x.picked == 0 ? StorageObjectEventStatus.PICKED : StorageObjectEventStatus.PICKING;
                setSTO.qty = setSTO.qty - x.picked;
                setSTO.baseQty = setSTO.baseQty - basePicked.baseQty;

                ADO.StorageObjectADO.GetInstant().UpdatePicking(reqVO.palletCode, x.docItemID.Value, x.packCode, x.batch, x.lot, x.picked, basePicked.baseQty, reqVO.pickMode,  this.BuVO);

                ADO.StorageObjectADO.GetInstant().PutV2(setSTO, this.BuVO);

                var docTarget = ADO.DocumentADO.GetInstant().Target(reqVO.docID, DocumentTypeID.GOODS_ISSUED, this.BuVO);
                var target = docTarget.Any(z => z.needPackQty <= 0);
                if (target == true)
                {
                    ADO.DocumentADO.GetInstant().UpdateStatusToChild(reqVO.docID, null, EntityStatus.ACTIVE, DocumentEventStatus.WORKED, this.BuVO);
                    close = new { docIDs = new long[] { reqVO.docID }, auto = 0, _token = this.BuVO.Get<string>(BusinessVOConst.KEY_TOKEN) };
                }
            });

            var res = ADO.DataADO.GetInstant().SelectByID<amt_Document>(reqVO.docID, this.BuVO);

            return new TRes { doc = res, closeDoc = close };
        }
    }
}