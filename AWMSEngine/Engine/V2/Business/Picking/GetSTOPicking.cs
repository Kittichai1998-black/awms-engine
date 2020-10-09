using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO.StaticValue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Picking
{
    public class GetSTOPicking : BaseEngine<GetSTOPicking.TReq, GetSTOPicking.TRes>
    {
        public class TReq
        {
            public long? bstoID;
            public string bstoCode;
        }
        public class TRes
        {
            public List<long> docIDs;
            public string bstoCode;
            public long bstoID;
            public List<STOItems> stoItems;
            public class STOItems
            {
                public long? bstoID;
                public long pstoID;
                public string pstoCode;
                public string pstoName;
                public AuditStatus auditStatus;
                public string lot;
                public string cartonNo;
                public string orderNo;
                public string batch;
                public string itemNo;
                public string ref1;
                public string ref2; 
                public string ref3;
                public string ref4;
                public long? pk_docID;
                public string pk_docCode;
                public long? pk_docItemID;
                public long? distoID;
                public DocumentProcessTypeID processTypeID;
                public string processTypeName;
                public decimal? pickQty;
                public string unitCode;
                public decimal? pickBaseQty;
                public string baseUnitCode;
                public string destination;
                public string remark;
 
            }
        }

        public class SumDiSTO
        {
            public long? sou_sto_id;
            public decimal? sumBaseQty;
            public decimal? sumQty;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();
            
            
            var getSto = new StorageObjectCriteria();
            
            if (reqVO.bstoCode == null)
            {
                if(reqVO.bstoID != null)
                {
                    getSto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(reqVO.bstoID.Value, StorageObjectType.BASE, false, true, this.BuVO);
                }
                else
                {
                    throw new AMWException(Logger, AMWExceptionCode.V1001, "กรุณาระบุรหัสพาเลทที่ต้องการเบิก");
                }
            }
            else
            {
                getSto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(reqVO.bstoCode, null, null, false, true, this.BuVO);
            }
            if (getSto == null)
                return null;

            var area = this.StaticValue.AreaMasters.FirstOrDefault(y => y.ID == getSto.areaID.Value);
            if(area.AreaMasterType_ID != AreaMasterTypeID.STA_PICK)
                throw new AMWException(Logger, AMWExceptionCode.V2002, "ไม่สามารถหยิบจ่ายสินค้า เนื่องจากพาเลทนี้ไม่ได้อยู่บนคลังพื้น");

            var packsList = getSto.ToTreeList().Where(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.PICKING).ToList();
            if (packsList !=null && packsList.Count > 0)
            {
                var docItems = ADO.WMSDB.DocumentADO.GetInstant().ListItemBySTO(packsList.Select(x => x.id.Value).ToList(), DocumentTypeID.PICKING, BuVO);
                
                if (docItems == null || docItems.Count() == 0)
                    throw new AMWException(Logger, AMWExceptionCode.V1001, "ไม่พบรายการเอกสารเบิก");
                docItems = docItems.Where(y => y.EventStatus == DocumentEventStatus.WORKING).ToList();
                docItems.ForEach(x =>
                {
                    var distos = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[] {
                            new SQLConditionCriteria("DocumentItem_ID", x.ID,SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("Status", EntityStatus.INACTIVE,SQLOperatorType.EQUALS)
                        }, this.BuVO);
                    x.DocItemStos = distos;

                });

                res.stoItems = new List<TRes.STOItems>();
                docItems.ForEach(docItem =>
                {
                    if (docItem.BaseQuantity == null)
                    {
                        packsList.ForEach(pack =>
                        {
                            var distos = docItem.DocItemStos.FindAll(x => x.Sou_StorageObject_ID == pack.id);
                            if (distos.Count() > 0)
                            {
                                distos.ForEach(disto =>
                                {

                                    disto.BaseQuantity = pack.baseQty;
                                    disto.Quantity = pack.qty;
                                    //stoItem.pickItems.Add(mappingPickPack(disto, pack));
                                    res.stoItems.Add(mappingPickPack(disto, pack));

                                });

                            }
                        });

                    }
                    else
                    {
                        packsList.ForEach(pack =>
                        {
                            var distos = docItem.DocItemStos.FindAll(x => x.Sou_StorageObject_ID == pack.id);
                            if (distos.Count() > 0)
                            {
                                 
                                distos.ForEach(disto =>
                                {

                                    var checkSumDiso = CheckSumQty(docItems).Find(v => v.sou_sto_id == disto.Sou_StorageObject_ID);
                                    decimal? remainBaseQty = docItem.BaseQuantity - checkSumDiso.sumBaseQty;
                                    if (disto.BaseQuantity == null)
                                    {
                                        //ไม่ได้ระบุจำนวนที่ต้องการเบิก 
                                        var tmpQTY = pack.baseQty - remainBaseQty; // สินค้าที่มีอยุ่  - จำนวนเหลือจากdocitemที่ต้องการเบิก = 
                                        if (tmpQTY > 0)
                                        {
                                            //ของเหลือ 
                                            disto.BaseQuantity = remainBaseQty;
                                            var qtyConvert = StaticValue.ConvertToNewUnitBySKU(pack.skuID.Value, remainBaseQty.Value, pack.baseUnitID,pack.unitID);
                                            disto.Quantity = qtyConvert.newQty;

                                            pack.baseQty = remainBaseQty.Value;
                                            pack.qty = qtyConvert.newQty;
                                        }
                                        else
                                        {
                                            //เบิกเต็ม
                                            disto.BaseQuantity = pack.baseQty;
                                            disto.Quantity = pack.qty;
                                        }

                                            res.stoItems.Add(mappingPickPack(disto, pack));
                                    }
                                    else
                                    {
                                        if (disto.BaseQuantity >= pack.baseQty)
                                        {
                                            //จำนวนที่ต้องการเบิก มากกว่าเท่ากับ จำนวนที่สินค้ามี ให้เบิกเต็ม
                                            res.stoItems.Add(mappingPickPack(disto, pack));
                                        }
                                        else
                                        {
                                            //จำนวนที่ต้องการเบิก น้อยกว่า จำนวนสินค้าที่สามารถเบิกได้ ให้เอาส่วนเหลือเก็บ
                                            pack.baseQty = disto.BaseQuantity.Value;
                                            pack.qty = disto.Quantity.Value;
                                            res.stoItems.Add(mappingPickPack(disto, pack));
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            
                List<SumDiSTO> CheckSumQty(List<amt_DocumentItem> docItems)
                {
                    var distoList = new List<amt_DocumentItemStorageObject>();
                    docItems.ForEach(x => { distoList.AddRange(x.DocItemStos); });
                    List<SumDiSTO> sumDisto = distoList.GroupBy(x => x.Sou_StorageObject_ID)
                     .Select(x => new SumDiSTO()
                     {
                         sou_sto_id = x.Key,
                         //Items = x.ToList(),
                         sumBaseQty = x.Sum(y => y.BaseQuantity),
                         sumQty = x.Sum(y => y.Quantity)
                     }).ToList();
                    return sumDisto;
                }
                TRes.STOItems mappingPickPack(amt_DocumentItemStorageObject disto, StorageObjectCriteria pack)
                {
                    var docitem = docItems.Find(i => i.ID == disto.DocumentItem_ID);
                
                    var doc = ADO.WMSDB.DocumentADO.GetInstant().Get(docitem.Document_ID, BuVO);
                    var processType = ADO.WMSDB.DataADO.GetInstant().SelectBy<amv_DocumentProcessTypeMap>(new SQLConditionCriteria[] {
                                    new SQLConditionCriteria("DocumentType_ID", DocumentTypeID.GOODS_ISSUE,SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("DocumentProcessType_ID", doc.DocumentProcessType_ID,SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("Status", EntityStatus.ACTIVE,SQLOperatorType.EQUALS)
                                }, this.BuVO).FirstOrDefault();
                    if(processType == null)
                        throw new AMWException(Logger, AMWExceptionCode.V1001, "ไม่พบข้อมูล Document Process Type Map");

                    var processTypeName = String.IsNullOrEmpty(processType.ReProcessType_Name) ? processType.Name : processType.ReProcessType_Name;

                    string des_warehouse = "", des_customer = "", des_suplier = "";
                    if (doc.Des_Warehouse_ID != null)
                        des_warehouse = this.StaticValue.Warehouses.FirstOrDefault(y => y.ID == doc.Des_Warehouse_ID).Name;
                    if (doc.Des_Customer_ID != null)
                        des_customer = this.StaticValue.Customers.FirstOrDefault(y => y.ID == doc.Des_Customer_ID).Name;
                    if (doc.Des_Supplier_ID != null)
                        des_suplier = this.StaticValue.Suppliers.FirstOrDefault(y => y.ID == doc.Des_Supplier_ID).Name;

                    var pickItem = new TRes.STOItems()
                    {
                        pstoID = pack.id.Value,
                        pstoCode = pack.code,
                        pstoName =  pack.name,
                        batch = pack.batch,
                        lot = pack.lot,
                        orderNo = pack.orderNo,
                        cartonNo = pack.cartonNo,
                        itemNo = pack.itemNo,
                        ref1 = pack.ref1,
                        ref2 = pack.ref2,
                        ref3 = pack.ref3,
                        ref4 = pack.ref4,
                        auditStatus = pack.AuditStatus,
                        bstoID = pack.parentID,
                        pk_docID = doc.ID,
                        pk_docCode = doc.Code,
                        pk_docItemID = disto.DocumentItem_ID.Value,
                        processTypeID = doc.DocumentProcessType_ID,
                        processTypeName = processTypeName,
                        distoID = disto.ID.Value,
                        pickQty = pack.qty,
                        pickBaseQty = pack.baseQty,
                        unitCode = pack.unitCode,
                        baseUnitCode = pack.baseUnitCode,
                        destination = des_warehouse != "" ? des_warehouse : des_customer != "" ? des_customer : des_suplier == "" ? des_suplier : null,
                        remark = doc.Remark,
                    };
                    return pickItem;
                }
                res.bstoCode = getSto.code;
                res.bstoID = getSto.id.Value;
            }
            else
            {
                res = null;
            }
            

            return res;
        }
    }
}
