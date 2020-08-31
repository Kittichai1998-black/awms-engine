﻿using AMWUtil.Common;
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
                public long pstoID;
                public string pstoCode;
                public string lot;
                public string cartonNo;
                public string orderNo;
                public string batch;
                public string itemNo;
                public string ref1;
                public string ref2; 
                public string ref3;
                public string ref4;
                public List<PickItems> pickItems;

                public class PickItems
                {
                    public string pk_docCode;
                    public long? pk_docItemID;
                    public DocumentProcessTypeID processTypeID;
                    public string processTypeName;
                    public long? distoID;
                    public decimal? pickQty;
                    public string unitCode;
                    public decimal? pickBaseQty;
                    public string baseUnitCode;
                    public string destination; 
                    public string remark;
                }
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
            
            if(reqVO.bstoCode == null)
                throw new AMWException(Logger, AMWExceptionCode.V1001, "กรุณาระบุรหัสพาเลทที่ต้องการเบิก");
            //var getDisto = ADO.DocumentADO.GetInstant().Lis
            var getSto = ADO.StorageObjectADO.GetInstant().Get(reqVO.bstoCode, null, null, false, true, this.BuVO);
            
            var packsList = getSto.ToTreeList().Where(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.PICKING).ToList();
            if (packsList !=null && packsList.Count > 0)
            {
                var docItems = ADO.DocumentADO.GetInstant().ListItemBySTO(packsList.Select(x => x.id.Value).ToList(), DocumentTypeID.PUTAWAY, BuVO);
                docItems.ForEach(x =>
                {
                    var distos = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[] {
                            new SQLConditionCriteria("DocumentItem_ID", x.ID,SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("Status", EntityStatus.REMOVE,SQLOperatorType.NOTEQUALS)
                        }, this.BuVO);
                    x.DocItemStos = distos;

                });


                docItems.ForEach(docItem =>
                {
                    if (docItem.BaseQuantity == null)
                    {
                        packsList.ForEach(pack =>
                        {
                            var distos = docItem.DocItemStos.FindAll(x => x.Sou_StorageObject_ID == pack.id);
                            if (distos.Count() > 0)
                            {
                                var stoItem = new TRes.STOItems()
                                {
                                    pstoID = pack.id.Value,
                                    pstoCode = pack.code,
                                    batch = pack.batch,
                                    lot = pack.lot,
                                    orderNo = pack.orderNo,
                                    cartonNo = pack.cartonNo,
                                    itemNo = pack.itemNo,
                                    ref1 = pack.ref1,
                                    ref2 = pack.ref2,
                                    ref3 = pack.ref3,
                                    ref4 = pack.ref4,
                                };

                                distos.ForEach(disto =>
                                {

                                    disto.BaseQuantity = pack.baseQty;
                                    disto.Quantity = pack.qty;
                                    stoItem.pickItems.Add(mappingPickPack(disto, pack));

                                });

                                res.stoItems.Add(stoItem);
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
                                var stoItem = new TRes.STOItems()
                                {
                                    pstoID = pack.id.Value,
                                    pstoCode = pack.code,
                                    batch = pack.batch,
                                    lot = pack.lot,
                                    orderNo = pack.orderNo,
                                    cartonNo = pack.cartonNo,
                                    itemNo = pack.itemNo,
                                    ref1 = pack.ref1,
                                    ref2 = pack.ref2,
                                    ref3 = pack.ref3,
                                    ref4 = pack.ref4,
                                };
                                distos.ForEach(disto =>
                                {

                                    var checkSumDiso = CheckSumQty(docItems).Find(v => v.sou_sto_id == disto.Sou_StorageObject_ID);
                                    decimal? remainBaseQty = docItem.BaseQuantity - checkSumDiso.sumBaseQty;
                                    if (disto.BaseQuantity == null)
                                    {
                                        //ไม่ได้ระบุจำนวนที่ต้องการเบิก 
                                        var pickQTY = remainBaseQty - pack.baseQty; //จำนวนที่ต้องการเบิก - สินค้าที่มีอยุ่ 
                                        if (pickQTY > 0)
                                        {
                                            //ของเหลือ 
                                            disto.BaseQuantity = remainBaseQty;
                                            var qtyConvert = StaticValue.ConvertToBaseUnitBySKU(pack.skuID.Value, remainBaseQty.Value, pack.baseUnitID);
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

                                        stoItem.pickItems.Add(mappingPickPack(disto, pack));
                                    }
                                    else
                                    {
                                        if (disto.BaseQuantity >= pack.baseQty)
                                        {
                                            //จำนวนที่ต้องการเบิก มากกว่าเท่ากับ จำนวนที่สินค้ามี ให้เบิกเต็ม
                                            stoItem.pickItems.Add(mappingPickPack(disto, pack));
                                        }
                                        else
                                        {
                                            //จำนวนที่ต้องการเบิก น้อยกว่า จำนวนสินค้าที่สามารถเบิกได้ ให้เอาส่วนเหลือเก็บ
                                            pack.baseQty = disto.BaseQuantity.Value;
                                            pack.qty = disto.Quantity.Value;
                                            stoItem.pickItems.Add(mappingPickPack(disto, pack));
                                        }
                                    }
                                });
                                res.stoItems.Add(stoItem);
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
                TRes.STOItems.PickItems mappingPickPack(amt_DocumentItemStorageObject disto, StorageObjectCriteria pack)
                {
                    var docitem = docItems.Find(i => i.ID == disto.DocumentItem_ID);
                
                    var doc = ADO.DocumentADO.GetInstant().Get(docitem.Document_ID, BuVO);
                    var processType = ADO.DataADO.GetInstant().SelectBy<amv_DocumentProcessMap>(new SQLConditionCriteria[] {
                                    new SQLConditionCriteria("DocumentType_ID", doc.DocumentType_ID,SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("DocumentProcessType_ID", doc.DocumentProcessType_ID,SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("Status", EntityStatus.ACTIVE,SQLOperatorType.EQUALS)
                                }, this.BuVO).FirstOrDefault();
                    var processTypeName = String.IsNullOrEmpty(processType.ReProcessType_Name) ? processType.Name : processType.ReProcessType_Name;

                    string des_warehouse = "", des_customer = "", des_suplier = "";
                    if (doc.Des_Warehouse_ID != null)
                        des_warehouse = this.StaticValue.Warehouses.FirstOrDefault(y => y.ID == doc.Des_Warehouse_ID).Name;
                    if (doc.Des_Customer_ID != null)
                        des_customer = this.StaticValue.Customers.FirstOrDefault(y => y.ID == doc.Des_Customer_ID).Name;
                    if (doc.Des_Supplier_ID != null)
                        des_suplier = this.StaticValue.Suppliers.FirstOrDefault(y => y.ID == doc.Des_Supplier_ID).Name;

                    var pickItem = new TRes.STOItems.PickItems()
                    {
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