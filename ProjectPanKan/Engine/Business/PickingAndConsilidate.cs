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
            public string mode;
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
            var docItems = DocumentADO.GetInstant().ListItemAndDisto(reqVO.docID, this.BuVO).FindAll(x => x.EventStatus == DocumentEventStatus.WORKING).OrderByDescending(x => x.Options).ToList();
            if (docItems.Count == 0)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Document Not Found");

            var res = this.Consolidate(docItems, reqVO);
            return res;
        }

        private TRes Consolidate(List<amt_DocumentItem> docItems, TReq reqVO)
        {
            var getBaseConso = StorageObjectADO.GetInstant().Get(reqVO.baseConso, null, null, false, true, this.BuVO);
            var stoScan = StorageObjectADO.GetInstant().Get(string.IsNullOrWhiteSpace(reqVO.basePick) ? reqVO.scanCode : reqVO.basePick, null, null, false, true, this.BuVO);
            var res = new TRes();

            if (getBaseConso == null && !string.IsNullOrWhiteSpace(reqVO.baseConso))
            {
                var baseConso = DataADO.GetInstant().SelectByCodeActive<ams_BaseMaster>(reqVO.baseConso, this.BuVO);
                getBaseConso = StorageObjectCriteria.CreateCriteriaBase(baseConso, 2, null, this.StaticValue);
                getBaseConso.eventStatus = StorageObjectEventStatus.CONSOLIDATED;
            }
            else if (getBaseConso != null)
            {
                if (getBaseConso.eventStatus != StorageObjectEventStatus.CONSOLIDATED && getBaseConso.eventStatus != StorageObjectEventStatus.NEW)
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่สามารถใช้กล่อง " + reqVO.baseConso + " นี้สำหรับ Consolidate ได้");
            }


            var checkDocItemFull = docItems.Find(x => ObjectUtil.QryStrGetValue(x.Options, "palletcode") == stoScan.code);

            if (checkDocItemFull != null)
            {
                if (stoScan.type != StorageObjectType.BASE)
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Barcode " + stoScan.code + " is not BaseCode");

                checkDocItemFull.EventStatus = DocumentEventStatus.WORKING;

                if (getBaseConso.id == null && !string.IsNullOrWhiteSpace(reqVO.baseConso))
                {
                    var resBaseConso = StorageObjectADO.GetInstant().PutV2(getBaseConso, this.BuVO);
                    getBaseConso.id = resBaseConso;
                }

                stoScan.mapstos.ForEach(sto =>
                {
                    var newSto = sto.Clone();
                    newSto.id = null;
                    newSto.parentID = string.IsNullOrWhiteSpace(reqVO.baseConso) ? null : getBaseConso.id;
                    newSto.eventStatus = StorageObjectEventStatus.CONSOLIDATED;

                    var packID = StorageObjectADO.GetInstant().PutV2(newSto, this.BuVO);

                    var disto = new amt_DocumentItemStorageObject()
                    {
                        DocumentType_ID = DocumentTypeID.GOODS_ISSUED,
                        DocumentItem_ID = checkDocItemFull.ID.Value,
                        Sou_StorageObject_ID = sto.id.Value,
                        Des_StorageObject_ID = packID,
                        BaseQuantity = sto.baseQty,
                        BaseUnitType_ID = sto.baseUnitID,
                        Quantity = sto.qty,
                        UnitType_ID = sto.unitID,
                    };
                    var distoRes = DocumentADO.GetInstant().InsertMappingSTO(disto, this.BuVO);
                    DocumentADO.GetInstant().UpdateMappingSTO(distoRes.ID.Value, EntityStatus.ACTIVE, this.BuVO);
                });

                DocumentADO.GetInstant().UpdateItemEventStatus(checkDocItemFull.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                checkDocItemFull.EventStatus = DocumentEventStatus.WORKED;
                StorageObjectADO.GetInstant().UpdateStatusToChild(stoScan.id.Value, null, null, StorageObjectEventStatus.REMOVED, this.BuVO);
            }
            else
            {
                if (stoScan.type == StorageObjectType.BASE && string.IsNullOrWhiteSpace(reqVO.basePick))
                {
                    return new TRes()
                    {
                        docID = reqVO.docID,
                        baseConso = reqVO.baseConso,
                        sto = new TRes.BaseSto()
                        {
                            baseCode = stoScan.code,
                            baseUnitCode = stoScan.baseUnitCode,
                            baseID = stoScan.id.Value,
                            packSTOs = stoScan.mapstos.Select(sto => new TRes.BaseSto.PackSTO() { packID = sto.id.Value, packCode = sto.code, packBaseQty = sto.baseQty, packBaseUnitCode = sto.baseUnitCode }).ToList()
                        }
                    };
                }

                foreach (var docItem in docItems.FindAll(x => ObjectUtil.QryStrGetValue(x.Options, "palletcode") == ""))
                {
                    var packs = stoScan.mapstos.Find(pack => pack.code == reqVO.scanCode);

                    if (packs.mstID == docItem.PackMaster_ID)
                    {
                        if (!string.IsNullOrWhiteSpace(reqVO.baseConso))
                        {
                            if (getBaseConso.id == null)
                            {
                                var resBaseConso = StorageObjectADO.GetInstant().PutV2(getBaseConso, this.BuVO);
                                getBaseConso.id = resBaseConso;
                            }
                        }

                        var chkDisto = docItem.DocItemStos.FindAll(disto => disto.Sou_StorageObject_ID == packs.id);

                        packs.qty -= reqVO.scanQty;
                        packs.baseQty -= reqVO.scanQty;

                        if (packs.qty == 0)
                        {
                            packs.eventStatus = StorageObjectEventStatus.REMOVED;
                        }

                        if (packs.qty < 0)
                            throw new AMWException(this.BuVO.Logger, AMWExceptionCode.B0002, "หยิบสินค้าเกินจำนวน");

                        if (chkDisto.Count > 0)
                        {
                            var sto = getBaseConso == null ? null : getBaseConso.ToTreeList().FindAll(x => x.type == StorageObjectType.PACK).Find(x => chkDisto.Any(d => d.Des_StorageObject_ID == x.id));
                            if (sto == null)
                            {
                                if (string.IsNullOrWhiteSpace(reqVO.baseConso))
                                {
                                    var noParent = StorageObjectADO.GetInstant().GetSTONoParent(chkDisto.Select(x => x.Des_StorageObject_ID.Value).ToList(), BuVO);
                                    if (noParent != null)
                                    {
                                        if (noParent.eventStatus != StorageObjectEventStatus.CONSOLIDATED)
                                            throw new AMWException(this.BuVO.Logger, AMWExceptionCode.B0002, "ไม่สามารถหยิบสินค้าได้ สถานะสินค้าเป็น " + noParent.eventStatus.GetValueString());

                                        var noParentDisto = chkDisto.Find(x => x.Des_StorageObject_ID == noParent.id);

                                        if (noParentDisto.BaseQuantity + reqVO.scanQty > docItem.BaseQuantity)
                                            throw new AMWException(this.BuVO.Logger, AMWExceptionCode.B0002, "หยิบสินค้าเกินจำนวน");

                                        DocumentADO.GetInstant().UpdateMappingSTO(noParentDisto.ID.Value,
                                            noParentDisto.Des_StorageObject_ID, noParentDisto.Quantity + reqVO.scanQty,
                                            noParentDisto.BaseQuantity + reqVO.scanQty, EntityStatus.ACTIVE, this.BuVO);

                                        noParent.qty += reqVO.scanQty;
                                        noParent.baseQty += reqVO.scanQty;
                                        noParent.eventStatus = StorageObjectEventStatus.CONSOLIDATED;

                                        StorageObjectADO.GetInstant().PutV2(noParent, this.BuVO);

                                        if (noParentDisto.BaseQuantity + reqVO.scanQty == docItem.BaseQuantity)
                                        {
                                            DocumentADO.GetInstant().UpdateItemEventStatus(docItem.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                                            docItem.EventStatus = DocumentEventStatus.WORKED;
                                        }
                                    }
                                    else
                                    {
                                        if (reqVO.scanQty > docItem.BaseQuantity)
                                            throw new AMWException(this.BuVO.Logger, AMWExceptionCode.B0002, "หยิบสินค้าเกินจำนวน");

                                        var pickedSto = packs.Clone();
                                        pickedSto.id = null;
                                        pickedSto.qty = reqVO.scanQty;
                                        pickedSto.baseQty = reqVO.scanQty;
                                        pickedSto.eventStatus = StorageObjectEventStatus.CONSOLIDATED;

                                        var pickedStoID = StorageObjectADO.GetInstant().PutV2(pickedSto, this.BuVO);

                                        var newDisto = new amt_DocumentItemStorageObject()
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

                                        DocumentADO.GetInstant().InsertMappingSTO(newDisto, this.BuVO);

                                        if (reqVO.scanQty == docItem.BaseQuantity)
                                        {
                                            DocumentADO.GetInstant().UpdateItemEventStatus(docItem.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                                            docItem.EventStatus = DocumentEventStatus.WORKED;
                                        }
                                    }
                                }
                                else
                                {
                                    if (reqVO.scanQty > docItem.BaseQuantity)
                                        throw new AMWException(this.BuVO.Logger, AMWExceptionCode.B0002, "หยิบสินค้าเกินจำนวน");

                                    var pickedSto = packs.Clone();
                                    pickedSto.id = null;
                                    pickedSto.qty = reqVO.scanQty;
                                    pickedSto.baseQty = reqVO.scanQty;
                                    pickedSto.eventStatus = StorageObjectEventStatus.CONSOLIDATED;
                                    pickedSto.parentID = getBaseConso.id;

                                    var pickedStoID = StorageObjectADO.GetInstant().PutV2(pickedSto, this.BuVO);

                                    var newDisto = new amt_DocumentItemStorageObject()
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

                                    DocumentADO.GetInstant().InsertMappingSTO(newDisto, this.BuVO);

                                    if (reqVO.scanQty == docItem.BaseQuantity)
                                    {
                                        DocumentADO.GetInstant().UpdateItemEventStatus(docItem.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                                        docItem.EventStatus = DocumentEventStatus.WORKED;
                                    }
                                }
                            }
                            else
                            {
                                var disto = chkDisto.Find(x => x.Des_StorageObject_ID == sto.id);
                                if (disto.BaseQuantity + reqVO.scanQty > docItem.BaseQuantity)
                                    throw new AMWException(this.BuVO.Logger, AMWExceptionCode.B0002, "หยิบสินค้าเกินจำนวน");

                                DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value,
                                    disto.Des_StorageObject_ID, disto.Quantity + reqVO.scanQty, disto.BaseQuantity + reqVO.scanQty, EntityStatus.ACTIVE, this.BuVO);

                                sto.qty += reqVO.scanQty;
                                sto.baseQty += reqVO.scanQty;
                                sto.eventStatus = StorageObjectEventStatus.CONSOLIDATED;

                                StorageObjectADO.GetInstant().PutV2(sto, this.BuVO);

                                if (disto.BaseQuantity + reqVO.scanQty == docItem.BaseQuantity)
                                {
                                    DocumentADO.GetInstant().UpdateItemEventStatus(docItem.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                                    docItem.EventStatus = DocumentEventStatus.WORKED;
                                }
                            }
                        }
                        else
                        {
                            if (reqVO.scanQty > docItem.BaseQuantity)
                                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.B0002, "หยิบสินค้าเกินจำนวน");

                            var pickedSto = packs.Clone();
                            pickedSto.id = null;
                            pickedSto.qty = reqVO.scanQty;
                            pickedSto.baseQty = reqVO.scanQty;
                            pickedSto.eventStatus = StorageObjectEventStatus.CONSOLIDATED;
                            pickedSto.parentID = string.IsNullOrWhiteSpace(reqVO.baseConso) ? null : getBaseConso.id;

                            var pickedStoID = StorageObjectADO.GetInstant().PutV2(pickedSto, this.BuVO);

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

                            DocumentADO.GetInstant().InsertMappingSTO(disto, this.BuVO);

                            if (reqVO.scanQty == docItem.BaseQuantity)
                            {
                                DocumentADO.GetInstant().UpdateItemEventStatus(docItem.ID.Value, DocumentEventStatus.WORKED, this.BuVO);
                                docItem.EventStatus = DocumentEventStatus.WORKED;
                            }
                        }

                        StorageObjectADO.GetInstant().PutV2(packs, this.BuVO);

                        if (DocumentADO.GetInstant().ListItem(reqVO.docID, this.BuVO).TrueForAll(x => x.EventStatus == DocumentEventStatus.WORKED))
                        {
                            DocumentADO.GetInstant().UpdateStatusToChild(reqVO.docID, null, null, DocumentEventStatus.WORKED, BuVO);
                        }

                        var createLD = this.ExectProject<object, List<amt_DocumentItemStorageObject>>(FeatureCode.EXEPJ_MappingDistoLD, new { reqVO.docID });

                        return new TRes()
                        {
                            docID = docItem.Document_ID,
                            baseConso = reqVO.baseConso,
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
    }
}
