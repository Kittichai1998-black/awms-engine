﻿using AMWUtil.Common;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System.Collections.Generic;
using System.Linq;

namespace AWMSEngine.Engine.V2.Business.Picking
{
    public class UpdateIssuedPickingManual : BaseEngine<UpdateIssuedPickingManual.TReq, UpdateIssuedPickingManual.TRes>
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

        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            reqVO.pickedList.ForEach(list =>
            {
                var stos = ADO.StorageObjectADO.GetInstant().Get(reqVO.palletID, StorageObjectType.BASE, false, true, this.BuVO);
                var stoList = stos.ToTreeList().Where(x => x.type == StorageObjectType.PACK).ToList();
                ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(stos.id.Value, null, null, StorageObjectEventStatus.PICKING, this.BuVO);
                stoList.ForEach(stosList =>
                {
                    var distos = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                    {
                            new SQLConditionCriteria("DocumentItem_ID", list.docItemID, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("Sou_StorageObject_ID", stosList.id, SQLOperatorType.EQUALS)
                    }, this.BuVO);

                    distos.ToList().ForEach(disto =>
                    {

                        if (stosList.qty == disto.Quantity)
                        {
                            ADO.DataADO.GetInstant().UpdateBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[] {
                                            new SQLConditionCriteria("DocumentItem_ID", disto.DocumentItem_ID, SQLOperatorType.EQUALS),
                                            new SQLConditionCriteria("Sou_StorageObject_ID", disto.Sou_StorageObject_ID, SQLOperatorType.EQUALS)
                                            }, new KeyValuePair<string, object>[]{
                                            new KeyValuePair<string, object>("Status", EntityStatus.ACTIVE),
                                            new KeyValuePair<string, object>("Des_StorageObject_ID", disto.Sou_StorageObject_ID)
                                            }, this.BuVO);

                            ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(stos.id.Value, null, null, StorageObjectEventStatus.PICKED, this.BuVO);

                            ADO.DocumentADO.GetInstant().UpdateStatusToChild(reqVO.docID,
                                null, null,
                                DocumentEventStatus.CLOSED,
                                this.BuVO);

                        }
                        else
                        {// เบิกไม่เต็ม
                            var updSto = new StorageObjectCriteria();
                            updSto = stosList.Clone();
                            updSto.baseQty -= disto.BaseQuantity.Value;
                            updSto.qty -= disto.Quantity.Value;
                            updSto.eventStatus = StorageObjectEventStatus.RECEIVED;

                            if (updSto.baseQty == 0)
                            {
                                updSto.eventStatus = StorageObjectEventStatus.PICKED;

                            }
                            else
                            {
                                var issuedSto = new StorageObjectCriteria();
                                issuedSto = stosList.Clone();
                                issuedSto.id = null;
                                issuedSto.baseQty = disto.BaseQuantity.Value;
                                issuedSto.qty = disto.Quantity.Value;
                                issuedSto.parentID = null;
                                issuedSto.mapstos = null;
                                issuedSto.eventStatus = StorageObjectEventStatus.PICKED;

                                var stoIDIssued = ADO.StorageObjectADO.GetInstant().PutV2(issuedSto, this.BuVO);

                                ADO.DistoADO.GetInstant().Update(disto.ID.Value, stoIDIssued, null, null, EntityStatus.ACTIVE, this.BuVO);
                            }
                            ADO.DataADO.GetInstant().UpdateByID<amt_StorageObject>(stos.id.Value, this.BuVO,
                            new KeyValuePair<string, object>[]
                            {
                                    new KeyValuePair<string, object>("EventStatus",StorageObjectEventStatus.RECEIVED)
                            });
                            var stoIDUpdated = ADO.StorageObjectADO.GetInstant().PutV2(updSto, this.BuVO);
                            ADO.DistoADO.GetInstant().Update(disto.ID.Value, stoIDUpdated, null, null, EntityStatus.ACTIVE, this.BuVO);

                            ADO.DocumentADO.GetInstant().UpdateStatusToChild(reqVO.docID,
                                null, null,
                                DocumentEventStatus.CLOSED,
                            this.BuVO);
                        }
                    });
                });
            });
            //======================================================================================

            var res = ADO.DataADO.GetInstant().SelectByID<amt_Document>(reqVO.docID, this.BuVO);

            return new TRes { doc = res };
            //return null;


        }
    }
}
