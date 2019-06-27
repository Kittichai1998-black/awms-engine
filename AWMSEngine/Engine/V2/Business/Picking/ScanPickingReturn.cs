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
        private ams_Warehouse _warehouseASRS;
        private ams_AreaMaster _areaASRS; 

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            this.InitDataASRS(reqVO);

            var result = new TRes();
            var selectPalletSTO = new ScanMapStoNoDoc();
            if(StaticValue.IsFeature(FeatureCode.EXEWM_AllowMultiSKU))
            {
                //Multi SKU
                throw new Exception("API Not support Multi-SKU");
            }
            else
            {
                // mvt = FG_RETURN_WM = 1091
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
                    var mapstoTree = resSto.ToTreeList();
                    var packs = mapstoTree.FindLast(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.NEW);
                    if (packs == null)
                    {   //add new pallet ยังไม่มี pack จะยังไม่มี document
                        //result.docs = GetDocument(resSto, reqVO);
                        result.docs = null;
                    }
                    else
                    {  
                        if (reqVO.docItemID == null)
                        {
                            //2 case  
                            var resDiSto = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                                      new SQLConditionCriteria[] {
                                            new SQLConditionCriteria("Sou_StorageObject_ID",packs.id, SQLOperatorType.EQUALS),
                                            new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS)
                                      }, this.BuVO).FirstOrDefault();
                            if (resDiSto == null)
                            {
                                //เพิ่มเข้าไปใหม่
                                //add new Pack ลงใน new pallet ก่อนหน้านี้ โดยยังไม่มี docItemID ให้อ้างอิง
                                //ต้องเซ็คหา docItem ที่มี pack master id ตรงกัน 
                                var docItems = ADO.DocumentADO.GetInstant()
                                         .ListItem(DocumentTypeID.GOODS_RECEIVED, packs.mstID, _warehouseASRS.Branch_ID.Value, reqVO.warehouseID, null, null, packs.unitID, packs.baseUnitID, packs.orderNo, packs.batch, packs.lot, null, this.BuVO)
                                         .FindAll(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.NEW);
                                if (docItems == null)
                                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR Document Item of Scan Code '" + reqVO.scanCode + "' Not Found");
                                var grDocs = docItems.GroupBy(x => new { DocID = x.Document_ID, DocPackID = x.PackMaster_ID })
                                    .Select(x => x.Key.DocID);
                                var tempDoc = new amt_Document();
                                List<amt_DocumentItem> tempDocItems = new List<amt_DocumentItem>();

                                foreach (var docid in grDocs)
                                {
                                    var resDoc = ADO.DocumentADO.GetInstant().Get(docid, this.BuVO);
                                    if (resDoc.MovementType_ID != MovementType.FG_RETURN_WM)
                                    {
                                        continue;
                                    }
                                    else
                                    {
                                        tempDoc = resDoc;
                                        docItems.Where(x => x.Document_ID == docid).ToList().ForEach(x=>
                                        {
                                            tempDocItems.Add(ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem(x.ID.Value, this.BuVO));
                                        });

                                        break;
                                    }
                                } 
                                if(tempDoc == null)
                                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR Document of Scan Code '" + reqVO.scanCode + "' Not Found");

                                var sumqtyDocItems = tempDocItems.Sum(x => x.Quantity);
                                if(sumqtyDocItems < packs.qty)
                                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Can't add pack");
                               
                                var di = tempDocItems.SelectMany(r => r.DocItemStos)
                                    .GroupBy(r => r.DocumentItem_ID)
                                    .Select(grp => new
                                    {
                                        ditID = grp.Key,
                                        Sum = grp.Sum(t => t.Quantity)
                                    });
                                var sumall = di.Sum(x => x.Sum);
                                if (sumqtyDocItems == sumall || (sumqtyDocItems - sumall) < packs.qty)
                                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Can't add pack");
                                int numLoc = 0;
                                int countDocitem = tempDocItems.Count();
                                var tempCurDocItem = new List<amt_DocumentItem>();

                                foreach (var dix in tempDocItems)
                                {
                                    numLoc++;
                                    if(dix.DocItemStos == null || dix.DocItemStos.Count() == 0)
                                    {
                                        if(numLoc == countDocitem)
                                        {
                                            if(tempCurDocItem.Count() > 0)
                                            {
                                                var addDocItemStos = AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(ConverterModel.ToDocumentItemStorageObject(packs, packs.baseQty, packs.unitID, tempCurDocItem[0].ID.Value), this.BuVO);
                                                tempCurDocItem[0].DocItemStos = new List<amt_DocumentItemStorageObject>() { addDocItemStos };
                                                tempDoc.DocumentItems = new List<amt_DocumentItem>() { tempCurDocItem[0] };

                                            }
                                            else
                                            {
                                                var addDocItemStos = AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(ConverterModel.ToDocumentItemStorageObject(packs, packs.baseQty, packs.unitID, dix.ID.Value), this.BuVO);
                                                dix.DocItemStos = new List<amt_DocumentItemStorageObject>() { addDocItemStos };
                                                tempDoc.DocumentItems = new List<amt_DocumentItem>() { dix };
                                                // break;
                                            }
                                        }
                                        else
                                        {

                                        tempCurDocItem.Add(dix);
                                        }
                                    }
                                    else {

                                    var sumt = dix.DocItemStos.Sum(x => x.Quantity);
                                        var tempSto = new List<amt_DocumentItemStorageObject>();
                                        var haveSto = false;
                                    foreach (var disto in dix.DocItemStos)
                                    {
                                        if (disto.Sou_StorageObject_ID == packs.id.Value && disto.Status == EntityStatus.INACTIVE)
                                        {
                                            var addqty = sumt + reqVO.amount;
                                            if (addqty <= dix.Quantity)
                                            {
                                                    haveSto = true;
                                                    //can add pack
                                                    var packConvert = StaticValue.ConvertToBaseUnitByPack(packs.mstID.Value, reqVO.amount, packs.unitID);

                                                    disto.Quantity += packConvert.qty;
                                                    disto.BaseQuantity += packConvert.baseQty;

                                                    ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, disto.Des_StorageObject_ID, disto.Quantity, disto.BaseQuantity, disto.Status, this.BuVO);
                                                    //tempSto.Add(disto);
                                                    //break;
                                            }else
                                                {
                                                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Can't add pack");
                                                }
                                         }else
                                            {
                                                //tempSto.Add(disto);
                                                continue;
                                            }

                                    }

                                        if (haveSto)
                                        {
                                            tempDoc.DocumentItems.Add(dix);
                                            break;
                                        }
                                        else
                                        {
                                            //continue;
                                            if (numLoc == countDocitem)
                                            {
                                                if (tempCurDocItem.Count() > 0)
                                                {
                                                    var addDocItemStos = AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(ConverterModel.ToDocumentItemStorageObject(packs, packs.baseQty, packs.unitID, tempCurDocItem[0].ID.Value), this.BuVO);
                                                    tempCurDocItem[0].DocItemStos = new List<amt_DocumentItemStorageObject>() { addDocItemStos };
                                                    tempDoc.DocumentItems = new List<amt_DocumentItem>() { tempCurDocItem[0] };

                                                }
                                                else
                                                {
                                                    var addDocItemStos = AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(ConverterModel.ToDocumentItemStorageObject(packs, packs.baseQty, packs.unitID, dix.ID.Value), this.BuVO);
                                                    dix.DocItemStos = new List<amt_DocumentItemStorageObject>() { addDocItemStos };
                                                    tempDoc.DocumentItems = new List<amt_DocumentItem>() { dix };
                                                }
                                            }
                                            else
                                            {
                                                if(dix.Quantity == sumt)
                                                {
                                                    continue;
                                                }
                                                else
                                                {
                                                    tempCurDocItem.Add(dix);

                                                }
                                            }

                                        }
                                    }
                                }
                                var listdoc = new List<amt_Document>() { tempDoc };
                                result.docs = listdoc;
                            }
                            else
                            {   //select pallet ที่มี pack อยู่ในนั้นเเล้ว
                                var resDocItem = ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem(resDiSto.DocumentItem_ID, this.BuVO);
                                if (resDocItem == null)
                                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR Document Item of Scan Code '" + reqVO.scanCode + "' Not Found");

                                var resDoc = ADO.DocumentADO.GetInstant().Get(resDocItem.Document_ID, this.BuVO);
                                if (resDoc.MovementType_ID != MovementType.FG_RETURN_WM)
                                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Movement Type of GR Document didn't 'FG_RETURN_WM'");

                                resDoc.DocumentItems = new List<amt_DocumentItem>() { resDocItem };
                                var listdoc = new List<amt_Document>() { resDoc };
                                result.docs = listdoc;
                                
                            }
                        }
                        else
                        {
                            //add Pack แล้ว map เข้า DiSto ตัวเดิม อิงจาก reqVO.docItemID
                            var resDocItem = ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem(reqVO.docItemID.Value, this.BuVO);
                            if (resDocItem == null)
                                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR Document Item of Scan Code '" + reqVO.scanCode + "' Not Found");

                            if (resDocItem.DocItemStos == null || resDocItem.DocItemStos.Count() == 0)
                            {
                                /*if (resDocItem.Quantity > packs.qty)
                                {
                                    var addDocItemStos = AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(ConverterModel.ToDocumentItemStorageObject(packs, packs.baseQty, packs.unitID, resDocItem.ID.Value), this.BuVO);
                                    resDocItem.DocItemStos = new List<amt_DocumentItemStorageObject>() { addDocItemStos };
                                    var docv = ADO.DocumentADO.GetInstant().Get(resDocItem.Document_ID, this.BuVO);
                                    docv.DocumentItems.Add(resDocItem);
                                    result.docs = docv;
                                }
                                else
                                {
                                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Can't Mapping this Pack in this Document Item. Quantity ของ DocItem ไม่พอ");
                                }*/
                                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR DocItemStos of Scan Code '" + reqVO.scanCode + "' Not Found");

                            }
                            else
                            {
                                var sumqtyDiSto = resDocItem.DocItemStos.Sum(x => x.Quantity);
                                if (sumqtyDiSto == resDocItem.Quantity)
                                {
                                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Completed the specified amount");
                                }
                                resDocItem.DocItemStos.ForEach(disto =>
                                {

                                    if (disto.Sou_StorageObject_ID == packs.id)
                                    {
                                        var addqty = sumqtyDiSto + reqVO.amount;
                                        if (addqty <= resDocItem.Quantity)
                                        {
                                            var packConvert = StaticValue.ConvertToBaseUnitByPack(packs.mstID.Value, reqVO.amount, packs.unitID);

                                            disto.Quantity += packConvert.qty;
                                            disto.BaseQuantity += packConvert.baseQty;

                                            var diStoID = ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, disto.Des_StorageObject_ID, disto.Quantity, disto.BaseQuantity, disto.Status, this.BuVO);
                                            var docItemStos = ADO.DataADO.GetInstant().SelectByID<amt_DocumentItemStorageObject>(diStoID, this.BuVO);
                                            resDocItem.DocItemStos = new List<amt_DocumentItemStorageObject>() { docItemStos };
                                        }
                                        else
                                        {
                                            throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Completed the specified amount");
                                        }
                                    }
                                });
                                var resDoc = ADO.DocumentADO.GetInstant().Get(resDocItem.Document_ID, this.BuVO);
                                if (resDoc.MovementType_ID != MovementType.FG_RETURN_WM)
                                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Movement Type of GR Document didn't 'FG_RETURN_WM'");

                                resDoc.DocumentItems = new List<amt_DocumentItem>() { resDocItem };
                                var listdoc = new List<amt_Document>() { resDoc };
                                result.docs = listdoc;
                            }
                        }
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
                        var packsScan = mapstoScanTree.FindLast(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.NEW);

                        resSto = CallScanMapStoNoDoc(reqVO);
                        result.bsto = resSto;
                        if(resSto == null) //ลบ pallet, pack ออกหมด
                        {
                            if (packsScan != null)
                            {
                                var docItems = ADO.DocumentADO.GetInstant()
                                      .ListItem(DocumentTypeID.GOODS_RECEIVED, packsScan.mstID, null, reqVO.warehouseID, null, null, packsScan.unitID, packsScan.baseUnitID, packsScan.orderNo, packsScan.batch, packsScan.lot, null, this.BuVO)
                                      .FindLast(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.NEW);
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

                            if (resStoPack != null && resStoPack.Count() > 0)
                            {
                                var doc = new amt_Document();
                                var resdocumentItems = new amt_DocumentItem();
                                if (reqVO.docItemID != null)
                                {
                                    /* resdocumentItems = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                                     new SQLConditionCriteria[] {
                                         new SQLConditionCriteria("ID",reqVO.docItemID, SQLOperatorType.EQUALS),
                                         //new SQLConditionCriteria("Document_ID",doc.ID.Value, SQLOperatorType.EQUALS),
                                         new SQLConditionCriteria("EventStatus", string.Join(',', EnumUtil.ListValueInt(DocumentEventStatus.WORKING, DocumentEventStatus.NEW)), SQLOperatorType.IN),
                                         new SQLConditionCriteria("Status", string.Join(',', EnumUtil.ListValueInt(EntityStatus.INACTIVE, EntityStatus.ACTIVE)), SQLOperatorType.IN)
                                     }, this.BuVO).FirstOrDefault();*/
                                    resdocumentItems = ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem((long)reqVO.docItemID, this.BuVO);
                                    if (resdocumentItems != null)
                                    {
                                        resdocumentItems.DocItemStos.ForEach(disto =>
                                        {
                                            if (disto.Sou_StorageObject_ID == resStoPack[0].id.Value)
                                            {
                                                disto.Quantity -= reqVO.amount;
                                                disto.BaseQuantity -= reqVO.amount;
                                                ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, null, disto.Quantity, disto.BaseQuantity, disto.Status, this.BuVO);
                                            }
                                        });
                                        var docx = ADO.DocumentADO.GetInstant().Get(resdocumentItems.Document_ID, this.BuVO);

                                        docx.DocumentItems = new List<amt_DocumentItem>() { resdocumentItems };
                                        result.docs = docx;
                                    }
                                    else
                                    {
                                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR Document Item of Scan Code '" + reqVO.scanCode + "' Not Found");
                                    }
                                }
                                else
                                {
                                    doc = ADO.DocumentADO.GetInstant().ListBySTO(resStoPack.Select(x => x.id.Value).ToList(), DocumentTypeID.GOODS_RECEIVED, this.BuVO)
                                        .FindLast(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.NEW && x.MovementType_ID == MovementType.FG_RETURN_WM);
                                    if (doc == null)
                                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR Document of Scan Code '" + reqVO.scanCode + "' Not Found");

                                    resdocumentItems = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                                    new SQLConditionCriteria[] {
                                        new SQLConditionCriteria("Document_ID",doc.ID.Value, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("PackMaster_ID",resStoPack[0].mstID.Value, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("Batch",resStoPack[0].batch, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("Lot",resStoPack[0].lot, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("EventStatus", string.Join(',', EnumUtil.ListValueInt(DocumentEventStatus.WORKING, DocumentEventStatus.NEW)), SQLOperatorType.IN),
                                        new SQLConditionCriteria("Status", string.Join(',', EnumUtil.ListValueInt(EntityStatus.INACTIVE, EntityStatus.ACTIVE)), SQLOperatorType.IN)
                                    }, this.BuVO).FirstOrDefault();
                               
                                
                                    if(resdocumentItems == null)
                                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR Document Item of Scan Code '" + reqVO.scanCode + "' Not Found");

                                    var resDiSto = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                                        new SQLConditionCriteria[] {
                                            new SQLConditionCriteria("DocumentItem_ID",resdocumentItems.ID, SQLOperatorType.EQUALS),
                                            new SQLConditionCriteria("Status", EntityStatus.INACTIVE, SQLOperatorType.EQUALS)
                                        }, this.BuVO);
                                
                                    resDiSto.ForEach(disto =>
                                    {
                                        if (disto.Sou_StorageObject_ID == resStoPack[0].id.Value)
                                        {
                                            disto.Quantity -= reqVO.amount;
                                            disto.BaseQuantity -= reqVO.amount;
                                            ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, null, disto.Quantity, disto.BaseQuantity, disto.Status, this.BuVO);
                                        }
                                    });
                                    resdocumentItems.DocItemStos = resDiSto;
                                    doc.DocumentItems = new List<amt_DocumentItem>() { resdocumentItems };
                                    result.docs = doc;
                                }
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
                                            disto.Status = EntityStatus.REMOVE;
                                            ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, null, disto.Quantity, disto.BaseQuantity, disto.Status, this.BuVO);
                                        });
                                        var docx = ADO.DocumentADO.GetInstant().Get(reqDocItem.Document_ID, this.BuVO);

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
                                    result.docs = null;
                                }
                            }
 
                        }
                    }
                }
            }
            return result;

        }
        
        private List<amt_Document> GetDocument(StorageObjectCriteria resSto, TReq reqVO)
        {
            var mapstoTree = resSto.ToTreeList();
            var packs = mapstoTree.FindLast(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.NEW);
            if (packs == null)
            {
                return null;
            }

            var resDiSto = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                                       new SQLConditionCriteria[] {
                                            new SQLConditionCriteria("Sou_StorageObject_ID",packs.id, SQLOperatorType.EQUALS),
                                            new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS)
                                       }, this.BuVO).FirstOrDefault();
            if(resDiSto == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR Document Item Storage Object of Scan Code '" + reqVO.scanCode + "' Not Found");

            var resDocItem = ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem(resDiSto.DocumentItem_ID, this.BuVO);
            if (resDocItem == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR Document Item of Scan Code '" + reqVO.scanCode + "' Not Found");

            var resDoc = ADO.DocumentADO.GetInstant().Get(resDocItem.Document_ID, this.BuVO);
            if (resDoc.MovementType_ID != MovementType.FG_RETURN_WM)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Movement Type of GR Document didn't 'FG_RETURN_WM'");

            resDoc.DocumentItems = new List<amt_DocumentItem>() { resDocItem };
            var listdoc = new List<amt_Document>() { resDoc };
            return listdoc;
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
                isRoot = reqVO.isRoot,
                mode = reqVO.mode,
                action = reqVO.action,
            };

            return selectPalletSTO.Execute(this.Logger, this.BuVO, createPalletData);
             
        }
        private void InitDataASRS(TReq reqVO)
        {

            this._warehouseASRS = StaticValue.Warehouses.FirstOrDefault(x => x.ID == reqVO.warehouseID);
            if (_warehouseASRS == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Warehouse ID '" + reqVO.warehouseID + "' Not Found");
            this._areaASRS = StaticValue.AreaMasters.FirstOrDefault(x => x.ID == reqVO.areaID && x.Warehouse_ID == _warehouseASRS.ID);
            if (_areaASRS == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Area ID '" + reqVO.areaID + "' Not Found");
            
        }
    }
}
