using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectPanKan.Engine.Business
{
    public class PickingAndConsilidate : BaseEngine<PickingAndConsilidate.TReq, PickingAndConsilidate.TRes>
    {
        public class TReq
        {
            public long docID;
            public string scanCode;
            public string baseConso;
            public string basePick;
            public decimal scanQty;
        }

        public class TRes
        {
            public long docID;
            public string baseConso;
            public BaseSto sto;

            public class BaseSto
            {
                public string baseCode;
                public long baseID;
                public string baseUnitCode;
                public List<PackSTO> packSTOs;

                public class PackSTO
                {
                    public string packCode;
                    public long packID;
                    public string packBaseUnitCode;
                    public decimal packBaseQty;
                }
            }
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var docItems = DocumentADO.GetInstant().ListItemAndDisto(reqVO.docID, this.BuVO);
            if (docItems.Count == 0)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Document Not Found");



            return null;
        }

        private TRes Pick(List<amt_DocumentItem> docItems, TReq reqVO, VOCriteria buVO)
        {
            var stoScan = StorageObjectADO.GetInstant().Get(string.IsNullOrWhiteSpace(reqVO.basePick) ? reqVO.scanCode : reqVO.basePick, null, null, false, true, this.BuVO);
            var res = new TRes();

            foreach(var docItem in docItems)
            {
                var basecode = AMWUtil.Common.ObjectUtil.QryStrGetValue(docItem.Options, "basecode");
                if (stoScan.code == basecode)
                {
                    if (stoScan.type != StorageObjectType.BASE)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Barcode " + stoScan.code + " is not BaseCode");

                    docItem.EventStatus = DocumentEventStatus.WORKED;

                    stoScan.mapstos.ForEach(sto =>
                    {
                        var disto = new amt_DocumentItemStorageObject()
                        {
                            DocumentType_ID = DocumentTypeID.GOODS_ISSUED,
                            DocumentItem_ID = docItem.ID.Value,
                            Sou_StorageObject_ID = sto.id.Value,
                            Des_StorageObject_ID = sto.id.Value,
                            BaseQuantity = sto.baseQty,
                            BaseUnitType_ID = sto.baseUnitID,
                            Quantity = sto.qty,
                            UnitType_ID = sto.unitID,
                        };
                        var distoRes = DocumentADO.GetInstant().InsertMappingSTO(disto, buVO);
                        DocumentADO.GetInstant().UpdateMappingSTO(distoRes.ID.Value, EntityStatus.ACTIVE, buVO);
                    });

                    DocumentADO.GetInstant().UpdateItemEventStatus(docItem.ID.Value, DocumentEventStatus.WORKED, buVO);
                    StorageObjectADO.GetInstant().UpdateStatusToChild(stoScan.id.Value, null, null, StorageObjectEventStatus.CONSOLIDATED, buVO);

                    break;
                }
                else
                {
                    if (stoScan.type == StorageObjectType.BASE)
                    {
                        return new TRes()
                        {
                            docID = docItem.Document_ID,
                            sto = new TRes.BaseSto()
                            {
                                baseCode = stoScan.code,
                                baseUnitCode = stoScan.baseUnitCode,
                                baseID = stoScan.id.Value,
                                packSTOs = stoScan.mapstos.Select(sto => new TRes.BaseSto.PackSTO() { packID = sto.id.Value, packCode = sto.code, packBaseQty = sto.baseQty, packBaseUnitCode = sto.baseUnitCode }).ToList()
                            }
                        };
                    }
                    else
                    {
                        var packs = stoScan.mapstos.Find(pack => pack.code == reqVO.scanCode);

                        if(packs.mstID != docItem.PackMaster_ID)
                            throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Cannot Pick " + stoScan.code);

                        var chkDisto = DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]{
                            new SQLConditionCriteria("Sou_StorageObject_ID", packs.id, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("DocumentItem_ID", docItem.ID, SQLOperatorType.EQUALS)
                            }, this.BuVO).FirstOrDefault();

                        packs.qty -= reqVO.scanQty;
                        packs.baseQty -= reqVO.scanQty;
                        if (packs.qty < 0)
                            throw new AMWException(buVO.Logger, AMWExceptionCode.B0002, "หยิบสินค้าเกินจำนวน");

                        if (chkDisto != null)
                        {
                            if(chkDisto.BaseQuantity + reqVO.scanQty > docItem.BaseQuantity)
                                throw new AMWException(buVO.Logger, AMWExceptionCode.B0002, "หยิบสินค้าเกินจำนวน");

                            DocumentADO.GetInstant().UpdateMappingSTO(chkDisto.ID.Value, chkDisto.Des_StorageObject_ID, chkDisto.Quantity + reqVO.scanQty, chkDisto.BaseQuantity + reqVO.scanQty, EntityStatus.ACTIVE, buVO);
                            
                            var pickedSto = StorageObjectADO.GetInstant().Get(chkDisto.Des_StorageObject_ID.Value, StorageObjectType.PACK, true, true, buVO);
                            pickedSto.qty += reqVO.scanQty;
                            pickedSto.baseQty += reqVO.scanQty;
                            pickedSto.eventStatus = StorageObjectEventStatus.CONSOLIDATED;

                            StorageObjectADO.GetInstant().PutV2(pickedSto, buVO);
                        }
                        else
                        {
                            if (reqVO.scanQty > docItem.BaseQuantity)
                                throw new AMWException(buVO.Logger, AMWExceptionCode.B0002, "หยิบสินค้าเกินจำนวน");

                            var pickedSto = packs.Clone();
                            pickedSto.id = null;
                            pickedSto.qty = reqVO.scanQty;
                            pickedSto.baseQty = reqVO.scanQty;
                            pickedSto.eventStatus = StorageObjectEventStatus.CONSOLIDATED;

                            var pickedStoID = StorageObjectADO.GetInstant().PutV2(pickedSto, buVO);

                            var disto = new amt_DocumentItemStorageObject()
                            {
                                DocumentType_ID = DocumentTypeID.GOODS_ISSUED,
                                DocumentItem_ID = docItem.ID.Value,
                                Quantity = reqVO.scanQty,
                                BaseQuantity = reqVO.scanQty,
                                UnitType_ID = stoScan.unitID,
                                BaseUnitType_ID = stoScan.baseUnitID,
                                Sou_StorageObject_ID = packs.id.Value,
                                Des_StorageObject_ID = pickedSto.id.Value
                            };

                            DocumentADO.GetInstant().InsertMappingSTO(disto, buVO);
                        }

                        StorageObjectADO.GetInstant().PutV2(packs, buVO);

                        res = new TRes()
                        {
                            docID = docItem.Document_ID,
                            sto = new TRes.BaseSto()
                            {
                                baseCode = stoScan.code,
                                baseUnitCode = stoScan.baseUnitCode,
                                baseID = stoScan.id.Value,
                                packSTOs = stoScan.mapstos.Select(sto => new TRes.BaseSto.PackSTO() { packID = sto.id.Value, packCode = sto.code, packBaseQty = sto.baseQty, packBaseUnitCode = sto.baseUnitCode }).ToList()
                            }
                        };
                    }
                }
            }
            return res;
        }

        private TRes Consolidate(List<amt_DocumentItem> docItems, TReq reqVO, VOCriteria buVO)
        {
            var getbaseConso = StorageObjectADO.GetInstant().Get(reqVO.baseConso, null, null, false, true, buVO);
            var getBasePick = StorageObjectADO.GetInstant().Get(reqVO.basePick, null, null, false, true, buVO);

            foreach (var docItem in docItems)
            {
                if (getbaseConso != null)
                {
                    var basecode = AMWUtil.Common.ObjectUtil.QryStrGetValue(docItem.Options, "basecode");
                    if (getbaseConso.eventStatus == StorageObjectEventStatus.CONSOLIDATED || getbaseConso.eventStatus == StorageObjectEventStatus.NEW)
                    {
                        var pack = getbaseConso.mapstos.Find(packSto => packSto.code == reqVO.basePick);
                    }
                }

            }


            return null;
        }
    }
}
