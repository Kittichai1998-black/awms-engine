using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Common;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.V2.Validation;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectSTA.Engine.V2.Business.Picking
{
    public class ScanPickingReturn : AWMSEngine.Engine.BaseEngine<ScanPickingReturn.TReq, ScanPickingReturn.TRes>
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
            public string rootOptions;
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
                        result.docs = null;
                    }
                    else
                    {  
                        if (reqVO.docItemID == null)
                        {
                            //2 case  
                            var resDiSto = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                                      new SQLConditionCriteria[] {
                                            new SQLConditionCriteria("Sou_StorageObject_ID",packs.id, SQLOperatorType.EQUALS),
                                            new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS)
                                      }, this.BuVO).FirstOrDefault();
                            if (resDiSto == null)
                            {
                                //เพิ่มเข้าไปใหม่
                                //add new Pack ลงใน new pallet ก่อนหน้านี้ โดยยังไม่มี docItemID ให้อ้างอิง
                                //ต้องเซ็คหา docItem ที่มี pack master id ตรงกัน 
                                //orderno ส่งเปน null ละเช็ค ว่ามี doc ตัวไหน มีค่า orderno ตรงกัน  packs.orderNo

                                var docItems = AWMSEngine.ADO.DocumentADO.GetInstant()
                                         .ListItem(DocumentTypeID.GOODS_RECEIVED, packs.mstID, null, null, null, null, packs.unitID, packs.baseUnitID, null, null, null, null, this.BuVO)
                                         .FindAll(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.NEW);
                                if (docItems == null || docItems.Count() == 0)
                                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR Document Item of Scan Code '" + reqVO.scanCode + "' Not Found");
                                var grDocs = docItems.GroupBy(x => new { DocID = x.Document_ID, DocPackID = x.PackMaster_ID })
                                    .Select(x => x.Key.DocID);
                                var tempDoc = new amt_Document();
                                List<amt_DocumentItem> tempDocItems = new List<amt_DocumentItem>();

                                foreach (var docid in grDocs)
                                {
                                    var resDoc = AWMSEngine.ADO.DocumentADO.GetInstant().Get(docid, this.BuVO);
                                    if (resDoc.MovementType_ID != MovementType.FG_PICK_RETURN_WM)
                                    {
                                        continue;
                                    }
                                    else
                                    {
                                        tempDoc = resDoc;
                                         
                                        if (docItems.Any(x => x.Document_ID == docid && x.OrderNo == packs.orderNo))
                                        {//ถ้ามี docitem ที่ pack และ orderno ตรงกัน
                                          //var docMacth = docItems.Find(x => x.Document_ID == docid && x.OrderNo == packs.orderNo);

                                           // tempDocItems.Add(AWMSEngine.ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem(docMacth.ID.Value, this.BuVO));

                                             docItems.Where(x => x.Document_ID == docid && x.OrderNo == packs.orderNo).ToList().ForEach(x =>
                                            {
                                                tempDocItems.Add(AWMSEngine.ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem(x.ID.Value, this.BuVO));
                                            }); 
                                        }
                                        else
                                        { //ถ้ามันมีdocitem ที่ packMasterID ตรงกัน เเต่ ค่า orderno ไม่ตรง = null
                                            var docMacth = docItems.Find(x => x.Document_ID == docid && x.OrderNo == null);
                                            AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_DocumentItem>(docMacth.ID.Value, this.BuVO,
                                                new KeyValuePair<string, object>[] {
                                                    new KeyValuePair<string, object>("OrderNo", packs.orderNo)
                                                });
                                            tempDocItems.Add(AWMSEngine.ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem(docMacth.ID.Value, this.BuVO));

                                        }

                                        break;
                                    }
                                } 
                                if(tempDoc == null)
                                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR Document of Scan Code '" + reqVO.scanCode + "' Not Found");
                                if (tempDocItems == null)
                                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR Document Item of Scan Code '" + reqVO.scanCode + "' Not Found");

                                var sumqtyDocItems = tempDocItems.Sum(x => x.Quantity); // ของที่คืน จากdocitem  = 50
                                if (sumqtyDocItems < packs.qty) // ตอนสเเกนรับเข้า เข็ค ว่า ของเกินจากจำนวนเอกสารที่ระบุยัง  50 < 1 false เพิ่มของต่อได้
                                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Completed the specified amount.");
                               
                                var di = tempDocItems.SelectMany(r => r.DocItemStos)
                                    .GroupBy(r => r.DocumentItem_ID)
                                    .Select(grp => new
                                    {
                                        ditID = grp.Key,
                                        Sum = grp.Sum(t => t.Quantity)
                                    });
                                var sumall = di.Sum(x => x.Sum);
                                if (sumqtyDocItems == sumall || (sumqtyDocItems - sumall) < packs.qty)
                                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Completed the specified amount.");
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

                                            if (tempCurDocItem.Count() > 0)
                                            {
                                                tempDoc.DocumentItems = CheckInsertDiSTO(tempCurDocItem, packs, reqVO);
                                            }
                                            else
                                            {
                                                if (dix.Quantity >= packs.qty)
                                                {
                                                    tempDoc.DocumentItems = InsertDiSTO(packs, dix.ID.Value, reqVO);
                                                }
                                                else
                                                {
                                                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Completed the specified amount.");
                                                }
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
                                                    var qty = disto.Quantity += reqVO.amount;
                                                    var packConvert = StaticValue.ConvertToBaseUnitByPack(packs.mstID.Value, qty.Value, packs.unitID);
                                                    
                                                    disto.Quantity = packConvert.qty;
                                                    disto.BaseQuantity = packConvert.baseQty;

                                                    AWMSEngine.ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, disto.Des_StorageObject_ID, disto.Quantity, disto.BaseQuantity, disto.Status, this.BuVO);
                                                   
                                            }else
                                                {
                                                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Completed the specified amount.");
                                                }
                                         }else
                                            {
                                                continue;
                                            }

                                    }

                                        if (haveSto)
                                        {
                                            var newDocItems = AWMSEngine.ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem(dix.ID.Value, this.BuVO);
                                            tempDoc.DocumentItems = new List<amt_DocumentItem>() { newDocItems };
                                            break;
                                        }
                                        else
                                        {
                                            if (numLoc == countDocitem)
                                            {
                                                if (tempCurDocItem.Count() > 0)
                                                {
                                                    tempDoc.DocumentItems = CheckInsertDiSTO(tempCurDocItem, packs, reqVO);
                                                }
                                                else
                                                {
                                                    if ((dix.Quantity - sumt) >= packs.qty)
                                                    {
                                                        tempDoc.DocumentItems = InsertDiSTO(packs, dix.ID.Value, reqVO);
                                                    }
                                                    else
                                                    {
                                                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Completed the specified amount.");
                                                    }
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
                               
                                result.docs = ListDocument(resDiSto.DocumentItem_ID.Value, reqVO);
                                
                            }
                        }
                        else
                        {
                            //add Pack แล้ว map เข้า DiSto ตัวเดิม อิงจาก reqVO.docItemID
                            var resDocItem = AWMSEngine.ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem(reqVO.docItemID.Value, this.BuVO);
                            if (resDocItem == null)
                                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR Document Item of Scan Code '" + reqVO.scanCode + "' Not Found");

                            if (resDocItem.DocItemStos == null || resDocItem.DocItemStos.Count() == 0)
                            {
                                
                                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR DocItemStos of Scan Code '" + reqVO.scanCode + "' Not Found");

                            }
                            else
                            {
                                var sumqtyDiSto = resDocItem.DocItemStos.Sum(x => x.Quantity);
                                if (sumqtyDiSto >= resDocItem.Quantity)
                                {
                                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Completed the specified amount.");
                                }
                                resDocItem.DocItemStos.ForEach(disto =>
                                {

                                    if (disto.Sou_StorageObject_ID == packs.id && disto.Status == EntityStatus.INACTIVE)
                                    {
                                        var addqty = sumqtyDiSto + reqVO.amount;
                                        if (addqty <= resDocItem.Quantity)
                                        {
                                            var qty = disto.Quantity += reqVO.amount;
                                            var packConvert = StaticValue.ConvertToBaseUnitByPack(packs.mstID.Value, qty.Value, packs.unitID);

                                            disto.Quantity = packConvert.qty;
                                            disto.BaseQuantity = packConvert.baseQty;

                                            var diStoID = AWMSEngine.ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, disto.Des_StorageObject_ID, disto.Quantity, disto.BaseQuantity, disto.Status, this.BuVO);
                                        
                                        }
                                        else
                                        {
                                            throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Completed the specified amount.");
                                        }
                                    }
                                });
                                var resDoc = AWMSEngine.ADO.DocumentADO.GetInstant().Get(resDocItem.Document_ID, this.BuVO);
                                if (resDoc.MovementType_ID != MovementType.FG_PICK_RETURN_WM)
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

                        var mapstoScan = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(reqVO.rootID.Value, StorageObjectType.BASE, reqVO.isRoot, true, this.BuVO);
                        var mapstoScanTree = mapstoScan.ToTreeList();
                        var packsScan = mapstoScanTree.FindLast(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.NEW);

                        resSto = CallScanMapStoNoDoc(reqVO);
                        result.bsto = resSto;
                        if(resSto == null) //ลบ pallet, pack ออกหมด
                        {
                            if (packsScan != null)
                            {
                                var resDiSto1 = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                                      new SQLConditionCriteria[] {
                                            new SQLConditionCriteria("Sou_StorageObject_ID",packsScan.id.Value, SQLOperatorType.EQUALS),
                                            new SQLConditionCriteria("Status", EntityStatus.INACTIVE, SQLOperatorType.EQUALS)
                                      }, this.BuVO).FirstOrDefault();
                                if (resDiSto1 == null)
                                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR Document Item Storage Object '" + packsScan.code + "' Not Found");
                                 
                                resDiSto1.Quantity = 0;
                                resDiSto1.BaseQuantity = 0;
                                resDiSto1.Status = EntityStatus.REMOVE;
                                AWMSEngine.ADO.DocumentADO.GetInstant().UpdateMappingSTO(resDiSto1.ID.Value, null, resDiSto1.Quantity, resDiSto1.BaseQuantity, resDiSto1.Status, this.BuVO);
                                
                                result.docs = ListDocument(resDiSto1.DocumentItem_ID.Value, reqVO);
                            }
                            else
                            {
                                result.docs = null;
                            }
                            
                        }
                        else
                        {
                            var resStoTree = resSto.ToTreeList();
                            var resStoPack = resStoTree.FindLast(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.NEW);

                            if (resStoPack != null)
                            {
                                var doc = new amt_Document();
                                var resdocumentItems = new amt_DocumentItem();
                                if (reqVO.docItemID != null)
                                { 
                                    resdocumentItems = AWMSEngine.ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem((long)reqVO.docItemID, this.BuVO);
                                    if (resdocumentItems != null)
                                    {
                                        resdocumentItems.DocItemStos.ForEach(disto =>
                                        {
                                            if (disto.Sou_StorageObject_ID == resStoPack.id.Value && disto.Status == EntityStatus.INACTIVE)
                                            {
                                                var qty = disto.Quantity -= reqVO.amount;
                                                var packConvert = StaticValue.ConvertToBaseUnitByPack(resStoPack.mstID.Value, qty.Value, resStoPack.unitID);
                                                disto.Quantity = packConvert.qty;
                                                disto.BaseQuantity = packConvert.baseQty;
                                                AWMSEngine.ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, null, disto.Quantity, disto.BaseQuantity, disto.Status, this.BuVO);
                                            }
                                        });
                                        var docx = AWMSEngine.ADO.DocumentADO.GetInstant().Get(resdocumentItems.Document_ID, this.BuVO);

                                        docx.DocumentItems = new List<amt_DocumentItem>() { resdocumentItems }; 
                                        result.docs = new List<amt_Document>() { docx }; 
                                    }
                                    else
                                    {
                                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR Document Item of Scan Code '" + reqVO.scanCode + "' Not Found");
                                    }
                                }
                                else
                                {
                                    var resDiSto1 = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                                      new SQLConditionCriteria[] {
                                            new SQLConditionCriteria("Sou_StorageObject_ID",resStoPack.id.Value, SQLOperatorType.EQUALS),
                                            new SQLConditionCriteria("Status", EntityStatus.INACTIVE, SQLOperatorType.EQUALS)
                                      }, this.BuVO).FirstOrDefault();
                                    if (resDiSto1 == null)
                                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR Document Item Storage Object '" + resStoPack.code + "' Not Found");
                                    var qty = resDiSto1.Quantity -= reqVO.amount;
                                    var packConvert = StaticValue.ConvertToBaseUnitByPack(resStoPack.mstID.Value, qty.Value, resStoPack.unitID);
                                    ////
                                    resDiSto1.Quantity = packConvert.qty;
                                    resDiSto1.BaseQuantity = packConvert.baseQty;
                                    AWMSEngine.ADO.DocumentADO.GetInstant().UpdateMappingSTO(resDiSto1.ID.Value, null, resDiSto1.Quantity, resDiSto1.BaseQuantity, resDiSto1.Status, this.BuVO);

                                    result.docs = ListDocument(resDiSto1.DocumentItem_ID.Value, reqVO);
                                }
                            }
                            else
                            {

                                if (reqVO.docItemID != null)
                                {
                                    //ลบ  pallet จนถึง sku ที่มีใน pallet
                                    var reqDocItem = AWMSEngine.ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem((long)reqVO.docItemID, this.BuVO);
                                    if(reqDocItem != null)
                                    {
                                        reqDocItem.DocItemStos.ForEach(disto =>
                                        {
                                            if (disto.Sou_StorageObject_ID == packsScan.id.Value && disto.Status == EntityStatus.INACTIVE)
                                            {
                                                disto.Quantity = 0;
                                                disto.BaseQuantity = 0;
                                                disto.Status = EntityStatus.REMOVE;
                                                AWMSEngine.ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, null, disto.Quantity, disto.BaseQuantity, disto.Status, this.BuVO);
                                            }
                                        });
                                        var docx = AWMSEngine.ADO.DocumentADO.GetInstant().Get(reqDocItem.Document_ID, this.BuVO);

                                        docx.DocumentItems = new List<amt_DocumentItem>() { reqDocItem };
                                        result.docs = new List<amt_Document>() { docx };
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

            var resDiSto = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                                       new SQLConditionCriteria[] {
                                            new SQLConditionCriteria("Sou_StorageObject_ID",packs.id, SQLOperatorType.EQUALS),
                                            new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS)
                                       }, this.BuVO).FirstOrDefault();
            if(resDiSto == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR Document Item Storage Object of Scan Code '" + reqVO.scanCode + "' Not Found");

            var resDocItem = AWMSEngine.ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem(resDiSto.DocumentItem_ID.Value, this.BuVO);
            if (resDocItem == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR Document Item of Scan Code '" + reqVO.scanCode + "' Not Found");

            var resDoc = AWMSEngine.ADO.DocumentADO.GetInstant().Get(resDocItem.Document_ID, this.BuVO);
            if (resDoc.MovementType_ID != MovementType.FG_PICK_RETURN_WM)
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
                rootOptions = reqVO.rootOptions
            };

            var res = selectPalletSTO.Execute(this.Logger, this.BuVO, createPalletData);
            if (reqVO.action == VirtualMapSTOActionType.ADD)
                new ValidateObjectSizeOverLimit().Execute(this.Logger, this.BuVO, res);

            return res; 
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

        private List<amt_DocumentItem> InsertDiSTO(StorageObjectCriteria packs,long diID, TReq reqVO)
        {
            var addDocItemStos = AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(ConverterModel.ToDocumentItemStorageObject(packs, packs.baseQty, packs.unitID, diID), this.BuVO);
            var newDocItems = AWMSEngine.ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem(addDocItemStos.DocumentItem_ID.Value, this.BuVO);
            return new List<amt_DocumentItem>() { newDocItems };
        }

        private List<amt_DocumentItem> CheckInsertDiSTO(List<amt_DocumentItem> dis, StorageObjectCriteria packs, TReq reqVO)
        {
            var haveSto2 = false;
            var res = new List<amt_DocumentItem>();
            foreach (var tempdix in dis)
            {
                var sumtem = tempdix.DocItemStos.Sum(x => x.Quantity);
                if ((tempdix.Quantity - sumtem) >= packs.qty)
                {
                    haveSto2 = true;
                    res = InsertDiSTO(packs, tempdix.ID.Value, reqVO);
                    break; 
                }
            }
            if (haveSto2 == false)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Completed the specified amount.");
            }
            return res;
            
        }

        private List<amt_Document> ListDocument(long diID, TReq reqVO)
        {
            var resDocItem = AWMSEngine.ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem(diID, this.BuVO);
            if (resDocItem == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "GR Document Item of Scan Code '" + reqVO.scanCode + "' Not Found");

            var resDoc = AWMSEngine.ADO.DocumentADO.GetInstant().Get(resDocItem.Document_ID, this.BuVO);
            if (resDoc.MovementType_ID != MovementType.FG_PICK_RETURN_WM)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Movement Type of GR Document didn't 'FG_RETURN_WM'");

            resDoc.DocumentItems = new List<amt_DocumentItem>() { resDocItem };
            return new List<amt_Document>() { resDoc };
        }
    }
}
