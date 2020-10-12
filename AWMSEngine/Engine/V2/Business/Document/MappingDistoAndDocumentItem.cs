using AMWUtil.Common;
using AMWUtil.Exception;

using ADO.WMSStaticValue;
using ADO.WMSDB;
using AWMSEngine.Common;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using iTextSharp.text.pdf;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Document
{
    public class MappingDistoAndDocumentItem : BaseEngine<MappingDistoAndDocumentItem.TReq, MappingDistoAndDocumentItem.TRes>
    {
        public class TReq
        {
            public long packID;
            public DocumentProcessTypeID docProcessType;
        }

        public class TRes
        {
            public amt_StorageObject sto;
            public List<Documents> documents;

            public class Documents
            {
                public long? GR_ID;
                public string GR_Code;
                public long? PA_ID;
                public string PA_Code; 
            }
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var chkCreatePA = StaticValueManager.GetInstant().GetConfigValue(ConfigFlow.USE_AUTO_CREATE_GR, reqVO.docProcessType);
            var chkCreateGR = StaticValueManager.GetInstant().GetConfigValue(ConfigFlow.USE_AUTO_CREATE_PA, reqVO.docProcessType);
            var res = new TRes();

            var psto = DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[]
            {
                new SQLConditionCriteria("ID", reqVO.packID, SQLOperatorType.EQUALS)
            }, this.BuVO).FirstOrDefault();

            if (psto == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V0_STO_NOT_FOUND);

            var docItems = DataADO.GetInstant().SelectBy<amt_DocumentItem>(new SQLConditionCriteria[]
            {
                new SQLConditionCriteria("RefID", psto.RefID, SQLOperatorType.EQUALS),
                new SQLConditionCriteria("EventStatus","10", SQLOperatorType.IN),
                new SQLConditionCriteria("ParentDocumentItem_ID", "", SQLOperatorType.ISNOTNULL)
            }, this.BuVO);

            var distos = DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
            {
                new SQLConditionCriteria("DocumentItem_ID", string.Join(',', docItems.Select(x=> x.ID).ToArray()), SQLOperatorType.IN),
                new SQLConditionCriteria("Status", "2", SQLOperatorType.NOTIN)
            }, this.BuVO).OrderByDescending(x => x.CreateTime).ToList();

            var newBaseQty = psto.BaseQuantity - distos.FindAll(disto => disto.Sou_StorageObject_ID == psto.ID).Sum(x => x.BaseQuantity).Value;
            var newQty = psto.Quantity - distos.FindAll(disto => disto.Sou_StorageObject_ID == psto.ID).Sum(x => x.Quantity).Value;

            res.sto = psto;
            res.documents = new List<TRes.Documents>();


            if (docItems.Count > 0)
            {
                var docs = new List<amt_Document>();
                docItems.ForEach(docItem =>
                {
                    var doc = DocumentADO.GetInstant().GetDocumentAndDocItems(docItem.Document_ID, this.BuVO);
                    docs.Add(doc);
                });

                docs = docs.FindAll(x => x.DocumentProcessType_ID == reqVO.docProcessType);
                if (docs.Count == 0)
                    throw new AMWException(this.Logger, AMWExceptionCode.V0_DOC_NOT_FOUND);

                foreach (var docItem in docItems)
                {
                    if (newBaseQty == 0)
                        break;

                    var doc = docs.Find(x => x.ID == docItem.Document_ID);
                    if (doc == null)
                        continue;
                    var qtyDistos = ADO.WMSDB.DocumentADO.GetInstant().GetItemAndStoInDocItem(docItem.ID.Value, this.BuVO);
                    var distoQty = qtyDistos.DocItemStos.Sum(x => x.BaseQuantity.Value);

                    //if ((psto.BaseQuantity + distoQty) > docItem.BaseQuantity)
                    //    throw new AMWException(this.Logger, AMWExceptionCode.V0_STO_OVER_DOC);

                    if (doc.DocumentProcessType_ID != reqVO.docProcessType)
                        continue;

                    var parentDoc = DocumentADO.GetInstant().GetDocumentAndDocItems(doc.ParentDocument_ID.Value, this.BuVO);
                    var disto = distos.Find(x => x.DocumentItem_ID == docItem.ID && x.Sou_StorageObject_ID == psto.ID);
                    if (docItem.BaseQuantity != null)
                    {
                        var remainBaseRecv = docItem.BaseQuantity.Value - distos.FindAll(x => x.DocumentItem_ID == docItem.ID).Sum(x => x.BaseQuantity).Value;
                        var remainRecv = docItem.Quantity.Value - distos.FindAll(x => x.DocumentItem_ID == docItem.ID).Sum(x => x.Quantity).Value;

                        if (disto != null)
                        {
                            if (remainBaseRecv > 0 && newBaseQty > 0)
                            {
                                if (remainBaseRecv >= newBaseQty)
                                {
                                    disto.BaseQuantity = disto.BaseQuantity + newBaseQty;
                                    disto.Quantity = disto.Quantity + newQty;
                                    DistoADO.GetInstant().Update(disto, this.BuVO);
                                    newBaseQty = 0;
                                    newQty = 0;
                                }
                                else if (remainBaseRecv < newBaseQty)
                                {
                                    disto.BaseQuantity = disto.BaseQuantity + remainBaseRecv;
                                    disto.Quantity = disto.Quantity + remainRecv;
                                    DistoADO.GetInstant().Update(disto, this.BuVO);
                                    newBaseQty = newBaseQty - remainBaseRecv;
                                    newQty = newQty - remainRecv;
                                }
                            }
                            else if (newBaseQty < 0)
                            {
                                if (psto.EventStatus == StorageObjectEventStatus.REMOVED || disto.BaseQuantity.Value + newBaseQty <= 0)
                                {
                                    // 50 + (-100)
                                    if (disto.BaseQuantity + newBaseQty <= 0)
                                        newBaseQty = disto.BaseQuantity.Value + newBaseQty;

                                    disto.BaseQuantity = 0;
                                    disto.Quantity = 0;
                                    disto.Status = EntityStatus.REMOVE;
                                    DistoADO.GetInstant().Update(disto, this.BuVO);

                                    newBaseQty = 0;

                                    if (ObjectUtil.QryStrGetValue(doc.Options, OptionVOConst.OPT_AUTO_DOC) == "true")
                                    {
                                        var _docItem = doc.DocumentItems.Find(x => x.ID == docItem.ID);
                                        var _distos = DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                                       {
                                            new SQLConditionCriteria("DocumentItem_ID", _docItem.ID, SQLOperatorType.EQUALS),
                                       }, this.BuVO);
                                        if (_distos.TrueForAll(y => y.Status == EntityStatus.REMOVE))
                                        {
                                            _docItem.EventStatus = DocumentEventStatus.REMOVED;
                                            _docItem.Status = EntityStatus.REMOVE;
                                            DocumentADO.GetInstant().UpdateItemEventStatus(_docItem.ID.Value, DocumentEventStatus.REMOVED, BuVO);
                                        }

                                        if (doc.DocumentItems.TrueForAll(x => x.Status == EntityStatus.REMOVE))
                                        {
                                            doc.EventStatus = DocumentEventStatus.REMOVED;
                                            doc.Status = EntityStatus.REMOVE;
                                            DocumentADO.GetInstant().UpdateEventStatus(doc.ID.Value, DocumentEventStatus.REMOVED, BuVO);
                                        }

                                        if (doc.ParentDocument_ID != null)
                                        {
                                            var getParentDoc = ADO.WMSDB.DocumentADO.GetInstant().GetDocumentAndDocItems(doc.ParentDocument_ID.Value, this.BuVO);
                                            var ParentDoc = doc.DocumentItems.GroupBy(
                                                    p => p.ParentDocumentItem_ID, (key, g) => new { ParentItemID = key, DocItems = g.ToList() }).ToList();
                                            ParentDoc.ForEach(group => {
                                                if (group.DocItems.TrueForAll(xx => xx.EventStatus == DocumentEventStatus.REMOVED))
                                                {
                                                    var qrItems = getParentDoc.DocumentItems.FindAll(y => y.ID == group.ParentItemID);
                                                    qrItems.ForEach(grItem =>
                                                    {
                                                        grItem.EventStatus = DocumentEventStatus.REMOVED;
                                                        ADO.WMSDB.DocumentADO.GetInstant().UpdateItemEventStatus(grItem.ID.Value, DocumentEventStatus.REMOVED, this.BuVO);
                                                    });
                                                }

                                            });

                                            if (getParentDoc.DocumentItems.TrueForAll(xx => xx.EventStatus == DocumentEventStatus.REMOVED))
                                            {
                                                ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(doc.ParentDocument_ID.Value, DocumentEventStatus.REMOVED, this.BuVO);
                                            }
                                        }
                                    }
                                }
                                else if (disto.BaseQuantity + newBaseQty > 0)
                                {
                                    disto.Quantity += newQty;
                                    disto.BaseQuantity += newBaseQty;
                                    DistoADO.GetInstant().Update(disto, this.BuVO);
                                    newBaseQty = 0;
                                    newQty = 0;
                                }
                            }
                            else if (remainRecv == 0)
                            {
                                continue;
                            }
                        }
                        else
                        {
                            if (remainRecv == 0)
                            {
                                continue;
                            }

                            // update incubatedate, shelflifedate
                            var packSto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(psto.ID.Value, StorageObjectType.PACK, false, false, this.BuVO);

                            DateTime? incubatedate = null;
                            DateTime? shelflifedate = null;

                            if (psto.IncubationDate == null)
                            {
                                incubatedate = docItem.ProductionDate == null ? (DateTime?)null : docItem.IncubationDay != null ?
                                    docItem.ProductionDate.Value.AddDays(Convert.ToDouble(docItem.IncubationDay) - 1) : (DateTime?)null;

                                packSto.incubationDate = incubatedate;
                            }
                            if (psto.ShelfLiftDate == null)
                            {
                                shelflifedate = docItem.ExpireDate == null ? (DateTime?)null : docItem.ShelfLifeDay != null ?
                                    docItem.ExpireDate.Value.AddDays(Convert.ToDouble(-docItem.ShelfLifeDay) + 1) : (DateTime?)null;

                                packSto.shelfLifeDate = shelflifedate;
                            }
                            if (packSto.incubationDate != null || packSto.shelfLifeDate != null)
                            {
                                var resStopack = ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(packSto, BuVO);
                            }
                            disto = new amt_DocumentItemStorageObject()
                            {
                                ID = null,
                                BaseQuantity = remainBaseRecv > newBaseQty ? newBaseQty : remainBaseRecv,
                                BaseUnitType_ID = psto.BaseUnitType_ID,
                                Quantity = remainRecv > newQty ? newQty : remainRecv,
                                UnitType_ID = psto.UnitType_ID,
                                Sou_StorageObject_ID = psto.ID.Value,
                                Des_StorageObject_ID = psto.ID.Value,
                                DocumentItem_ID = docItem.ID.Value,
                                DocumentType_ID = doc.DocumentType_ID,
                                Status = EntityStatus.INACTIVE
                            };

                            DistoADO.GetInstant().Insert(disto, this.BuVO);
                            newBaseQty = remainBaseRecv > newBaseQty ? 0 : newBaseQty - remainBaseRecv;
                            newQty = remainRecv > newQty ? 0 : newQty - remainRecv;
                        }
                    }
                    else
                    {   //docitem ไม่ระบุจำนวนรับเข้า
                        if (newBaseQty < 0)
                        {
                            if (psto.EventStatus == StorageObjectEventStatus.REMOVED) {
                                disto.BaseQuantity = 0;
                                disto.Quantity = 0;
                                disto.Status = EntityStatus.REMOVE;
                                DistoADO.GetInstant().Update(disto, this.BuVO);

                                newBaseQty = 0;

                                if (ObjectUtil.QryStrGetValue(doc.Options, OptionVOConst.OPT_AUTO_DOC) == "true")
                                {

                                    var _docItem = doc.DocumentItems.Find(x => x.ID == docItem.ID);
                                    var _distos = DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                                       {
                                            new SQLConditionCriteria("DocumentItem_ID", _docItem.ID, SQLOperatorType.EQUALS),
                                       }, this.BuVO);
                                    if (_distos.TrueForAll(y => y.Status == EntityStatus.REMOVE))
                                    {
                                        _docItem.EventStatus = DocumentEventStatus.REMOVED;
                                        _docItem.Status = EntityStatus.REMOVE;
                                        DocumentADO.GetInstant().UpdateItemEventStatus(_docItem.ID.Value, DocumentEventStatus.REMOVED, BuVO);
                                    }

                                    if (doc.DocumentItems.TrueForAll(y => y.EventStatus == DocumentEventStatus.REMOVED))
                                    {
                                        doc.EventStatus = DocumentEventStatus.REMOVED;
                                        doc.Status = EntityStatus.REMOVE;
                                        ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(doc.ID.Value, DocumentEventStatus.REMOVED, this.BuVO);
                                        
                                    }
                                    if (doc.ParentDocument_ID != null)
                                    { 
                                        var getParentDoc = ADO.WMSDB.DocumentADO.GetInstant().GetDocumentAndDocItems(doc.ParentDocument_ID.Value, this.BuVO);
                                        var ParentDoc = doc.DocumentItems.GroupBy(
                                                p => p.ParentDocumentItem_ID, (key, g) => new { ParentItemID = key, DocItems = g.ToList() }).ToList();
                                        ParentDoc.ForEach(group => {
                                            if (group.DocItems.TrueForAll(xx => xx.EventStatus == DocumentEventStatus.REMOVED))
                                            {
                                                var qrItems = getParentDoc.DocumentItems.FindAll(y => y.ID == group.ParentItemID);
                                                qrItems.ForEach(grItem =>
                                                {
                                                    grItem.EventStatus = DocumentEventStatus.REMOVED;
                                                    ADO.WMSDB.DocumentADO.GetInstant().UpdateItemEventStatus(grItem.ID.Value, DocumentEventStatus.REMOVED, this.BuVO);
                                                });
                                            }

                                        });

                                        if (getParentDoc.DocumentItems.TrueForAll(xx => xx.EventStatus == DocumentEventStatus.REMOVED))
                                        {
                                            ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(doc.ParentDocument_ID.Value, DocumentEventStatus.REMOVED, this.BuVO);
                                        }
                                    }

                                   
                                }
                                newBaseQty = 0;
                                newQty = 0;
                            }
                        }
                        else
                        {
                            disto = new amt_DocumentItemStorageObject()
                            {
                                ID = null,
                                BaseQuantity = newBaseQty,
                                BaseUnitType_ID = psto.BaseUnitType_ID,
                                Quantity = newQty,
                                UnitType_ID = psto.UnitType_ID,
                                Sou_StorageObject_ID = psto.ID.Value,
                                Des_StorageObject_ID = psto.ID.Value,
                                DocumentItem_ID = docItem.ID.Value,
                                DocumentType_ID = doc.DocumentType_ID,
                                Status = EntityStatus.INACTIVE
                            };

                            DistoADO.GetInstant().Insert(disto, this.BuVO);
                            newBaseQty = 0;
                            newQty = 0;
                        }
                    }
                    res.documents.Add(new TRes.Documents()
                    {
                       GR_ID = parentDoc.ID,
                       GR_Code = parentDoc.Code,
                       PA_ID = doc.ID,
                       PA_Code = doc.Code
                    });
                };
            }
            else
            {
                if (chkCreatePA == "true")
                {
                    newBaseQty = 0;
                    var packSto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(reqVO.packID, StorageObjectType.PACK, false, false, this.BuVO);
                    var area = StaticValue.AreaMasters.Find(x => x.ID == psto.AreaMaster_ID);
                    var warehouse = StaticValue.Warehouses.Find(x => x.ID == area.Warehouse_ID);
                    var checkdocPA = DataADO.GetInstant().SelectBy<amt_Document>(new SQLConditionCriteria[]
                    {
                        new SQLConditionCriteria("Sou_Branch_ID", warehouse.Branch_ID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Sou_Warehouse_ID", warehouse.ID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("For_Customer_ID", psto.For_Customer_ID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("EventStatus", DocumentEventStatus.NEW, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Options", OptionVOConst.OPT_AUTO_DOC+"=true", SQLOperatorType.LIKE),
                        new SQLConditionCriteria("ParentDocument_ID", "", SQLOperatorType.ISNOTNULL),
                        new SQLConditionCriteria("DocumentProcessType_ID", reqVO.docProcessType, SQLOperatorType.ISNOTNULL),

                    }, this.BuVO);

                    if(checkdocPA != null && checkdocPA.Count() > 0)
                    {
                        var listDocitemGA = new List<amt_DocumentItem>();
                        checkdocPA.ForEach(x =>
                        {
                            x.DocumentItems = ADO.WMSDB.DocumentADO.GetInstant().ListItem(x.ParentDocument_ID.Value, this.BuVO);
                            listDocitemGA.AddRange(x.DocumentItems);
                        });
                        var canmap_Item = listDocitemGA.Find(item => item.RefID == psto.RefID && (item.EventStatus == DocumentEventStatus.NEW || item.EventStatus == DocumentEventStatus.WORKING));
                         if(canmap_Item != null)
                        {
                            if (canmap_Item.BaseQuantity >= psto.BaseQuantity)
                            {
                                var get_docPA = checkdocPA.Find(pa => pa.ParentDocument_ID == canmap_Item.Document_ID);

                                amt_DocumentItem docItemPA = new amt_DocumentItem()
                                {
                                    Document_ID = get_docPA.ID.Value,
                                    ParentDocumentItem_ID = canmap_Item.ID.Value,
                                    Code = psto.Code,
                                    SKUMaster_ID = psto.SKUMaster_ID,
                                    PackMaster_ID = psto.PackMaster_ID,
                                    Quantity = reqVO.docProcessType == DocumentProcessTypeID.ESP_TRANSFER_WM ? (decimal?)null : psto.Quantity,
                                    UnitType_ID = reqVO.docProcessType == DocumentProcessTypeID.ESP_TRANSFER_WM ? (long?)null : psto.UnitType_ID,
                                    BaseQuantity = reqVO.docProcessType == DocumentProcessTypeID.ESP_TRANSFER_WM ? (decimal?)null : psto.BaseQuantity,
                                    BaseUnitType_ID = reqVO.docProcessType == DocumentProcessTypeID.ESP_TRANSFER_WM ? (long?)null : psto.BaseUnitType_ID,
                                    Options = psto.Options,
                                    EventStatus = DocumentEventStatus.NEW,
                                    Ref1 = psto.Ref1,
                                    Ref2 = psto.Ref2,
                                    Ref3 = psto.Ref3,
                                    Ref4 = psto.Ref4,
                                    CartonNo = psto.CartonNo,
                                    OrderNo = psto.OrderNo,
                                    ItemNo = psto.ItemNo,
                                    Batch = psto.Batch,
                                    Lot = psto.Lot,
                                    AuditStatus = psto.AuditStatus,
                                    ProductionDate = psto.ProductDate,
                                    ExpireDate = psto.ExpiryDate,
                                    DocItemStos = new List<amt_DocumentItemStorageObject>()
                                        { ConverterModel.ToDocumentItemStorageObject(packSto, null, null, null) }
                                        };
                                var docPAID = ADO.WMSDB.DocumentADO.GetInstant().CreateItem(docItemPA, BuVO);

                                var _docGR = ADO.WMSDB.DocumentADO.GetInstant().GetDocumentAndDocItems(get_docPA.ParentDocument_ID.Value, BuVO);

                                res.documents.Add(new TRes.Documents()
                                {
                                    GR_ID = _docGR.ID,
                                    GR_Code = _docGR.Code,
                                    PA_ID = get_docPA.ID,
                                    PA_Code = get_docPA.Code
                                });
                            }
                        }
                    }
                    else
                    {
                        //สร้างใหม่
                        amt_Document _docGR = new amt_Document();
                        if (chkCreateGR == "true")
                        {
                            var checkdocGR = DataADO.GetInstant().SelectBy<amt_Document>(new SQLConditionCriteria[]
                              {
                                    new SQLConditionCriteria("Sou_Branch_ID", warehouse.Branch_ID, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("Sou_Warehouse_ID", warehouse.ID, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("For_Customer_ID", psto.For_Customer_ID, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("EventStatus", "10,11", SQLOperatorType.IN),
                                    new SQLConditionCriteria("Options", OptionVOConst.OPT_AUTO_DOC+"=true", SQLOperatorType.LIKE),
                                    new SQLConditionCriteria("ParentDocument_ID", "", SQLOperatorType.ISNULL),
                                    new SQLConditionCriteria("DocumentProcessType_ID", reqVO.docProcessType, SQLOperatorType.ISNOTNULL),

                              }, this.BuVO).FirstOrDefault();
                            if (checkdocGR != null)
                            {
                                _docGR = ADO.WMSDB.DocumentADO.GetInstant().GetDocumentAndDocItems(checkdocGR.ID.Value, BuVO);
                            }
                            else
                            {

                                amt_DocumentItem docItemGR = new amt_DocumentItem()
                                {
                                    Code = psto.Code,
                                    SKUMaster_ID = psto.SKUMaster_ID,
                                    PackMaster_ID = psto.PackMaster_ID,
                                    Quantity = reqVO.docProcessType == DocumentProcessTypeID.ESP_TRANSFER_WM ? (decimal?)null : psto.Quantity,
                                    UnitType_ID = reqVO.docProcessType == DocumentProcessTypeID.ESP_TRANSFER_WM ? (long?)null : psto.UnitType_ID,
                                    BaseQuantity = reqVO.docProcessType == DocumentProcessTypeID.ESP_TRANSFER_WM ? (decimal?)null : psto.BaseQuantity,
                                    BaseUnitType_ID = reqVO.docProcessType == DocumentProcessTypeID.ESP_TRANSFER_WM ? (long?)null : psto.BaseUnitType_ID,
                                    Options = psto.Options,
                                    EventStatus = DocumentEventStatus.NEW,
                                    Ref1 = psto.Ref1,
                                    Ref2 = psto.Ref2,
                                    Ref3 = psto.Ref3,
                                    Ref4 = psto.Ref4,
                                    CartonNo = psto.CartonNo,
                                    OrderNo = psto.OrderNo,
                                    ItemNo = psto.ItemNo,
                                    Batch = psto.Batch,
                                    Lot = psto.Lot,
                                    AuditStatus = psto.AuditStatus,
                                    ProductionDate = psto.ProductDate,
                                    ExpireDate = psto.ExpiryDate,
                                };
                                amt_Document docGR = new amt_Document()
                                {
                                    DocumentType_ID = DocumentTypeID.GOODS_RECEIVE,
                                    DocumentProcessType_ID = reqVO.docProcessType,
                                    ParentDocument_ID = null,
                                    Sou_Branch_ID = warehouse.Branch_ID,
                                    Des_Branch_ID = warehouse.Branch_ID,
                                    Sou_Warehouse_ID = area.Warehouse_ID,
                                    Des_Warehouse_ID = area.Warehouse_ID,
                                    For_Customer_ID = psto.For_Customer_ID,
                                    DocumentDate = DateTime.Now,
                                    ActionTime = DateTime.Now,
                                    DocumentItems = new List<amt_DocumentItem> { docItemGR },
                                    EventStatus = DocumentEventStatus.NEW,
                                    Options = AMWUtil.Common.ObjectUtil.QryStrSetValue("", OptionVOConst.OPT_AUTO_DOC, "true")
                                };
                                var docGRID = ADO.WMSDB.DocumentADO.GetInstant().Create(docGR, BuVO).ID;
                                _docGR = ADO.WMSDB.DocumentADO.GetInstant().GetDocumentAndDocItems(docGRID.Value, BuVO);
                            }
                        }
                        else
                        {
                            var docItemsGR = DataADO.GetInstant().SelectBy<amt_DocumentItem>(new SQLConditionCriteria[]
                               {
                                new SQLConditionCriteria("RefID", psto.RefID, SQLOperatorType.EQUALS),
                                new SQLConditionCriteria("EventStatus", "10", SQLOperatorType.IN),
                                new SQLConditionCriteria("ParentDocumentItem_ID", "", SQLOperatorType.ISNULL)
                               }, this.BuVO).FirstOrDefault();

                            if (docItemsGR == null)
                            {
                                throw new AMWException(this.Logger, AMWExceptionCode.V0_DOC_NOT_FOUND);
                            }
                            else
                            {
                                _docGR = ADO.WMSDB.DocumentADO.GetInstant().GetDocumentAndDocItems(docItemsGR.Document_ID, BuVO);
                            }
                        }

                        var canmap_Item = _docGR.DocumentItems.Find(item => item.RefID == psto.RefID && item.EventStatus == DocumentEventStatus.NEW);
                        if (canmap_Item != null)
                        {

                            amt_DocumentItem docItemPA = new amt_DocumentItem()
                            {
                                ParentDocumentItem_ID = canmap_Item.ID.Value,
                                Code = psto.Code,
                                SKUMaster_ID = psto.SKUMaster_ID,
                                PackMaster_ID = psto.PackMaster_ID,
                                Quantity = reqVO.docProcessType == DocumentProcessTypeID.ESP_TRANSFER_WM ? (decimal?)null : psto.Quantity,
                                UnitType_ID = reqVO.docProcessType == DocumentProcessTypeID.ESP_TRANSFER_WM ? (long?)null : psto.UnitType_ID,
                                BaseQuantity = reqVO.docProcessType == DocumentProcessTypeID.ESP_TRANSFER_WM ? (decimal?)null : psto.BaseQuantity,
                                BaseUnitType_ID = reqVO.docProcessType == DocumentProcessTypeID.ESP_TRANSFER_WM ? (long?)null : psto.BaseUnitType_ID,
                                Options = psto.Options,
                                EventStatus = DocumentEventStatus.NEW,
                                Ref1 = psto.Ref1,
                                Ref2 = psto.Ref2,
                                Ref3 = psto.Ref3,
                                Ref4 = psto.Ref4,
                                CartonNo = psto.CartonNo,
                                OrderNo = psto.OrderNo,
                                ItemNo = psto.ItemNo,
                                Batch = psto.Batch,
                                Lot = psto.Lot,
                                AuditStatus = psto.AuditStatus,
                                ProductionDate = psto.ProductDate,
                                ExpireDate = psto.ExpiryDate,
                                DocItemStos = new List<amt_DocumentItemStorageObject>()
                            { ConverterModel.ToDocumentItemStorageObject(packSto, null, null, null) }
                            };
                            amt_Document docPA = new amt_Document()
                            {
                                DocumentType_ID = DocumentTypeID.PUTAWAY,
                                DocumentProcessType_ID = reqVO.docProcessType,
                                ParentDocument_ID = _docGR.ID,
                                Sou_Branch_ID = warehouse.Branch_ID,
                                Des_Branch_ID = warehouse.Branch_ID,
                                Sou_Warehouse_ID = area.Warehouse_ID,
                                Des_Warehouse_ID = area.Warehouse_ID,
                                For_Customer_ID = psto.For_Customer_ID,
                                DocumentDate = DateTime.Now,
                                ActionTime = DateTime.Now,
                                DocumentItems = new List<amt_DocumentItem> { docItemPA },
                                EventStatus = DocumentEventStatus.NEW,
                                Options = AMWUtil.Common.ObjectUtil.QryStrSetValue("", OptionVOConst.OPT_AUTO_DOC, "true")
                            };
                            var docPAID = ADO.WMSDB.DocumentADO.GetInstant().Create(docPA, BuVO).ID;
                            var new_docPA = ADO.WMSDB.DocumentADO.GetInstant().GetDocumentAndDocItems(docPAID.Value, BuVO);

                            res.documents.Add(new TRes.Documents()
                            {
                                GR_ID = _docGR.ID,
                                GR_Code = _docGR.Code,
                                PA_ID = new_docPA.ID,
                                PA_Code = new_docPA.Code
                            });
                        }
                    }
                }
                else
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V0_DOC_NOT_FOUND);
                }
            }


            if (newBaseQty > 0)
                throw new AMWException(this.Logger, AMWExceptionCode.V0_STO_OVER_DOC);

            return res;
        }
    }
}
