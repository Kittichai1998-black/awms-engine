using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Common;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Picking
{
    public class ScanPickingReturn : BaseEngine<ScanPickingReturn.TReq, ScanPickingReturn.TRes>
    {
        public class TReq
        {
            public long? rootID;
            public long? docItemID;
            public string scanCode;
            public string orderNo;
            public string batch;
            public string lot;
            public decimal amount;
            public string unitCode;
            public DateTime? productDate;
            public long? warehouseID;
            public long? areaID;
            public string locationCode;
            public string options;
            public bool isRoot = true;
            public VirtualMapSTOModeType mode;
            public VirtualMapSTOActionType action;
        }

        public class TRes
        {
            public StorageObjectCriteria bsto;
            public dynamic docs;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var result = new TRes();
            var selectPalletSTO = new ScanMapStoNoDoc();
            if(StaticValue.IsFeature(FeatureCode.EXEWM_AllowMultiSKU))
            {
                //Multi SKU
                throw new Exception("API Not support Multi-SKU");
            }
            else
            {
                // mvt = FG_RETURN_WM = 51091
                if (reqVO.action == VirtualMapSTOActionType.SELECT)
                {
                    var resSto =  CallScanMapStoNoDoc(reqVO);
                    result.bsto = resSto;

                    if (resSto == null)
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Scan Code '" + reqVO.scanCode + "' Not Found");
                    }
                    else
                    {
                        result.docs = GetDocument(resSto, reqVO);
                    }
                }
                else if (reqVO.action == VirtualMapSTOActionType.ADD)
                {

                    var resSto = CallScanMapStoNoDoc(reqVO);
                    result.bsto = resSto;


                    if (reqVO.docItemID == null)
                    {
                        //check ก่อนว่ามีtype เป็น pack มั้ย ถ้ามี ให้มันเเสดงข้อมูลเดิมออกมา
                        var mapstoTree = resSto.ToTreeList();
                        var packs = mapstoTree.FindLast(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.NEW);
                        if (packs == null)
                        {
                            var doc = ADO.DocumentADO.GetInstant().ListDocs(DocumentTypeID.GOODS_RECEIVED, null,
                                    reqVO.warehouseID, null, MovementType.FG_RETURN_WM, this.BuVO)
                                    .Find(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.NEW);
                            if (doc == null) //จะให้มันreturn res.docs = null หรือ error 
                                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR Document with Movement Type 'PICKING RETURN' Not Found");
                            result.docs = doc;
                         
                        }
                        else
                        {
                            //result.docs = GetDocument(resSto, reqVO);
                            var docItems = ADO.DocumentADO.GetInstant()
                               .ListItem(DocumentTypeID.GOODS_RECEIVED, packs.mstID, null, reqVO.warehouseID, null, null, packs.unitID, packs.baseUnitID, packs.orderNo, packs.batch, packs.lot, null, this.BuVO)
                               .Find(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.NEW);
                            if(docItems == null)
                                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR Document Item of Scan Code '"+ reqVO.scanCode + "' Not Found");

                            var docItemStos = AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(ConverterModel.ToDocumentItemStorageObject(packs, null, null, docItems.ID), this.BuVO);
                            docItems.DocItemStos = new List<amt_DocumentItemStorageObject>() { docItemStos };
                            var doc = ADO.DocumentADO.GetInstant().Get(docItems.Document_ID, this.BuVO);
                            doc.DocumentItems = new List<amt_DocumentItem>() { docItems };
                            result.docs = doc;
                        }

                    }
                    else
                    {

                        
                        var mapstoTree = resSto.ToTreeList();
                        var packs = mapstoTree.FindLast(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.NEW);
                        if (packs == null)
                            throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Packs of Scan Code '" + reqVO.scanCode + "' Not Found");


                        var docItem = ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem((long)reqVO.docItemID, this.BuVO);
                        if (docItem == null)
                            throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR Document Item of Scan Code '" + reqVO.scanCode + "' Not Found");

                        //if (docItem.Code != reqVO.scanCode)
                        //    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR Document Item '" + reqVO.scanCode + "' Not Match");

                        if (docItem.PackMaster_ID != packs.mstID.Value)
                            throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR Document Item '" + docItem.Code + "' Not Match");

                        if (docItem.DocItemStos == null && docItem.DocItemStos.Count() == 0)
                        {
                            //add docItemSto
                            var docItemStos = AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(ConverterModel.ToDocumentItemStorageObject(packs, null, null, docItem.ID), this.BuVO);
                            docItem.DocItemStos = new List<amt_DocumentItemStorageObject>() { docItemStos };
                             
                        }
                        else
                        {
                            //long diStoID = 0;
                            //update docItemSto
                            var disto = docItem.DocItemStos.Find(distox => distox.Status == EntityStatus.INACTIVE && distox.Sou_StorageObject_ID == packs.id);

                            if(disto.Quantity == docItem.Quantity)
                            {
                                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Quantity Limit");
                            }
                            var diStoID = ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, disto.Des_StorageObject_ID, packs.qty, packs.baseQty, disto.Status, this.BuVO);

                            var docItemStos = ADO.DataADO.GetInstant().SelectByID<amt_DocumentItemStorageObject>(diStoID, this.BuVO);
                            docItem.DocItemStos = new List<amt_DocumentItemStorageObject>() { docItemStos };

                        }

                        var doc = ADO.DocumentADO.GetInstant().Get(docItem.Document_ID, this.BuVO);
                        doc.DocumentItems = new List<amt_DocumentItem>() { docItem };
                        result.docs = doc;
                    }

                }
                else if (reqVO.action == VirtualMapSTOActionType.REMOVE)
                {
                    StorageObjectCriteria resSto = null;

                    if (reqVO.rootID == null)
                    {
                        resSto = CallScanMapStoNoDoc(reqVO);
                        result.bsto = resSto;
                        result.docs = GetDocument(resSto, reqVO);
                    }
                    else
                    {
                        //จะลบ pack ส่ง rootID ของ base , scancode ของ pack

                        //จะลบ base ส่ง rootID ของ base , scancode ของ base => rootID-base =IDของscancode

                        var mapstoScan = ADO.StorageObjectADO.GetInstant().Get(reqVO.rootID.Value, StorageObjectType.BASE, reqVO.isRoot, true, this.BuVO);
                        var mapstoScanTree = mapstoScan.ToTreeList();
                        //var packsScan = mapstoScanTree.Where(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.NEW).ToList();
                        //List<long> packIDs = mapstoScan.ToTreeList().Where(x => x.type == StorageObjectType.PACK).Select(x => x.id.Value).ToList();
                        var packsScan = mapstoScanTree.FindLast(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.NEW);


                        resSto = CallScanMapStoNoDoc(reqVO);
                        result.bsto = resSto;
                        if(resSto == null) //ลบ pallet, pack ออกหมด
                        {
                            if (packsScan != null)
                            {
                                var docItems = ADO.DocumentADO.GetInstant()
                                      .ListItem(DocumentTypeID.GOODS_RECEIVED, packsScan.mstID, null, reqVO.warehouseID, null, null, packsScan.unitID, packsScan.baseUnitID, packsScan.orderNo, packsScan.batch, packsScan.lot, null, this.BuVO)
                                      .Find(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.NEW);
                                if (docItems == null)
                                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR Document Item of Scan Code '" + reqVO.scanCode + "' Not Found");

                                var resDiSto = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                                    new SQLConditionCriteria[] {
                                        new SQLConditionCriteria("DocumentItem_ID",docItems.ID.Value, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("Status", EntityStatus.INACTIVE, SQLOperatorType.EQUALS)
                                    }, this.BuVO);

                                resDiSto.ForEach(disto =>
                                {
                                    disto.Quantity = 0;
                                    disto.BaseQuantity = 0;
                                    disto.Status = EntityStatus.REMOVE;
                                    ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, null, disto.Quantity, disto.BaseQuantity, disto.Status, this.BuVO);
                                });

                                docItems.DocItemStos = resDiSto;
                                var doc = ADO.DocumentADO.GetInstant().Get(docItems.Document_ID, this.BuVO);
                                doc.DocumentItems = new List<amt_DocumentItem>() { docItems };
                                result.docs = doc;
                                
                            }
                            else
                            {
                                result.docs = null;
                            }
                            
                        }
                        else
                        {
                            var resStoTree = resSto.ToTreeList();
                            var resStoPack = resStoTree.Where(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.NEW).ToList();

                            //List<long> resStoPackIDs = resSto.ToTreeList().Where(x => x.type == StorageObjectType.PACK).Select(x => x.id.Value).ToList();
                            if (resStoPack != null)
                            {
                                
                                var doc = ADO.DocumentADO.GetInstant().ListBySTO(resStoPack.Select(x => x.id.Value).ToList(), DocumentTypeID.GOODS_RECEIVED, this.BuVO)
                                         .FirstOrDefault(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.NEW && x.MovementType_ID == MovementType.FG_RETURN_WM);
                                var resdocumentItems = new amt_DocumentItem();
                                if (reqVO.docItemID != null)
                                {
                                    resdocumentItems = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                                    new SQLConditionCriteria[] {
                                        new SQLConditionCriteria("ID",reqVO.docItemID, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("Document_ID",doc.ID.Value, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("EventStatus", string.Join(',', EnumUtil.ListValueInt(DocumentEventStatus.WORKING, DocumentEventStatus.NEW)), SQLOperatorType.IN),
                                        new SQLConditionCriteria("Status", string.Join(',', EnumUtil.ListValueInt(EntityStatus.INACTIVE, EntityStatus.ACTIVE)), SQLOperatorType.IN)
                                    }, this.BuVO).FirstOrDefault();
                                }
                                else
                                {
                                    resdocumentItems = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                                    new SQLConditionCriteria[] {
                                        new SQLConditionCriteria("Document_ID",doc.ID.Value, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("PackMaster_ID",resStoPack[0].mstID.Value, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("Batch",resStoPack[0].batch, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("Lot",resStoPack[0].lot, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("EventStatus", string.Join(',', EnumUtil.ListValueInt(DocumentEventStatus.WORKING, DocumentEventStatus.NEW)), SQLOperatorType.IN),
                                        new SQLConditionCriteria("Status", string.Join(',', EnumUtil.ListValueInt(EntityStatus.INACTIVE, EntityStatus.ACTIVE)), SQLOperatorType.IN)
                                    }, this.BuVO).FirstOrDefault();
                                }
                                
                                var resDiSto = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                                    new SQLConditionCriteria[] {
                                        new SQLConditionCriteria("DocumentItem_ID",resdocumentItems.ID, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("Status", EntityStatus.INACTIVE, SQLOperatorType.EQUALS)
                                    }, this.BuVO);

                                resDiSto.ForEach(disto =>
                                {
                                    disto.Quantity -= reqVO.amount;
                                    disto.BaseQuantity -= reqVO.amount; 
                                    ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, null, disto.Quantity, disto.BaseQuantity, disto.Status, this.BuVO);
                                });
                                //var docItem = ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem((long)resdocumentItems.ID, this.BuVO);
                                resdocumentItems.DocItemStos = resDiSto;
                                doc.DocumentItems = new List<amt_DocumentItem>() { resdocumentItems };
                                result.docs = doc;

                            }
                            else
                            {

                                if (reqVO.docItemID != null)
                                {
                                    //ลบ  pallet จนถึง sku ที่มีใน pallet
                                    var reqDocItem = ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem((long)reqVO.docItemID, this.BuVO);
                                    if(reqDocItem != null)
                                    {
                                        reqDocItem.DocItemStos.ForEach(disto =>
                                        {
                                            disto.Quantity = 0;
                                            disto.BaseQuantity = 0;
                                            ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, null, disto.Quantity, disto.BaseQuantity, disto.Status, this.BuVO);
                                        });
                                        var docx = ADO.DocumentADO.GetInstant().Get(reqDocItem.Document_ID, this.BuVO);
                                        //var docItem = ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem((long)reqVO.docItemID, this.BuVO);

                                        docx.DocumentItems = new List<amt_DocumentItem>() { reqDocItem };
                                        result.docs = docx;
                                    }
                                    else
                                    {
                                        result.docs = null;
                                    }

                                }
                                else
                                {
                                    //throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Must be Value of Document Item ID");
                                    result.docs = null;
                                }
                            }
 
                        }
                    }
                }
            }
            return result;

        }
        
        private amt_Document GetDocument(StorageObjectCriteria resSto, TReq reqVO)
        {
            var mapstoTree = resSto.ToTreeList();
            var packs = mapstoTree.FindLast(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.NEW);

            //var packs = mapstoTree.Where(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.NEW).ToList();
            //if (packs == null || packs.Count() == 0)
            if (packs == null)
                return null;
            //throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Packs of Scan Code '" + reqVO.scanCode + "' Not Found");
            /*var doc = ADO.DocumentADO.GetInstant().ListBySTO(packs.Select(x => x.id.Value).ToList(), DocumentTypeID.GOODS_RECEIVED, this.BuVO)
                      .FirstOrDefault(y => y.EventStatus == DocumentEventStatus.WORKING || y.EventStatus == DocumentEventStatus.NEW && y.MovementType_ID == MovementType.FG_RETURN_WM);
            if (doc == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Document of Scan Code '" + reqVO.scanCode + "' Not Found");

            var resdocumentItems = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                new SQLConditionCriteria[] {
                                     new SQLConditionCriteria("Document_ID",doc.ID.Value, SQLOperatorType.EQUALS),
                                     new SQLConditionCriteria("PackMaster_ID",packs[0].mstID.Value, SQLOperatorType.EQUALS),
                                     new SQLConditionCriteria("Batch",packs[0].batch, SQLOperatorType.EQUALS),
                                     new SQLConditionCriteria("Lot",packs[0].lot, SQLOperatorType.EQUALS),
                                     new SQLConditionCriteria("EventStatus", string.Join(',', EnumUtil.ListValueInt(DocumentEventStatus.WORKING, DocumentEventStatus.NEW)), SQLOperatorType.IN),
                                     new SQLConditionCriteria("Status", string.Join(',', EnumUtil.ListValueInt(EntityStatus.INACTIVE, EntityStatus.ACTIVE)), SQLOperatorType.IN)
                 }, this.BuVO).FirstOrDefault();*/
            //}, this.BuVO).FirstOrDefault(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.NEW);
            var docItems = ADO.DocumentADO.GetInstant()
                              .ListItem(DocumentTypeID.GOODS_RECEIVED, packs.mstID, null, reqVO.warehouseID, null, null, packs.unitID, packs.baseUnitID, packs.orderNo, packs.batch, packs.lot, null, this.BuVO)
                              .Find(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.NEW);
            if(docItems == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR Document Item of Scan Code '" + reqVO.scanCode + "' Not Found");

            var resDiSto = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                new SQLConditionCriteria[] {
                                new SQLConditionCriteria("DocumentItem_ID",docItems.ID.Value, SQLOperatorType.EQUALS),
                                new SQLConditionCriteria("Status", EntityStatus.INACTIVE, SQLOperatorType.EQUALS)
                }, this.BuVO);

            docItems.DocItemStos = resDiSto;
            var doc = ADO.DocumentADO.GetInstant().Get(docItems.Document_ID, this.BuVO);
            doc.DocumentItems = new List<amt_DocumentItem>() { docItems };
            return doc;
        }

        private StorageObjectCriteria CallScanMapStoNoDoc(TReq reqVO)
        {
            var selectPalletSTO = new ScanMapStoNoDoc();
            var createPalletData = new ScanMapStoNoDoc.TReq()
            {
                rootID = reqVO.rootID,
                scanCode = reqVO.scanCode,
                orderNo = reqVO.orderNo,
                batch = reqVO.batch,
                lot = reqVO.lot,
                amount = reqVO.amount,
                unitCode = reqVO.unitCode,
                productDate = reqVO.productDate,
                warehouseID = reqVO.warehouseID,
                areaID = reqVO.areaID,
                locationCode = reqVO.locationCode,
                options = reqVO.options,
                //isRoot = false,
                mode = reqVO.mode,
                action = reqVO.action,
            };

            return selectPalletSTO.Execute(this.Logger, this.BuVO, createPalletData);
             
        }

        private amt_Document GetDocumentxRemove(StorageObjectCriteria resSto, TReq reqVO)
        {
            var doc = new amt_Document();

            if(resSto == null)
            {

            }
            else
            {

            }

            return doc;
        }
    }
}
