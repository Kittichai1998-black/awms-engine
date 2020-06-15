using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Common;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business.Received;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using Microsoft.Extensions.Options;
using Microsoft.VisualBasic.CompilerServices;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ProjectAERP.Engine.Document
{
    public class CreateDocByLN : BaseEngine<CreateDocByLN.TReq, CreateDocByLN.TRes>
    {

        public class TReq : ERPWHInbound
        {
        }
        public class TRes : AMWWHInbound
        {

        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {

            var docRes = new TRes();
            var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
            List<CreateGRDocument.TReq.ReceiveItem> docItemsList = new List<CreateGRDocument.TReq.ReceiveItem>();
            CreateGRDocument.TReq docH = new CreateGRDocument.TReq();
            List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();
            amt_Document docResult = new amt_Document();
            amt_Document docGR = new amt_Document();
            docH = this.mapCreateDocHeader(this.Logger, reqVO, this.BuVO);

            foreach (var wh_h in reqVO.wh_order_h)
            {
                string ref3Doc = reqVO.wh_seqord.ToString() + "-" + reqVO.wh_origin.ToString() + "-" + reqVO.wh_order + "-" + reqVO.wh_set.ToString()
                    + "-" + reqVO.cust + "-" + reqVO.proj;

                var chkWH = wh_h.wh_order_d.TrueForAll(x => x.warehouse_t == wh_h.wh_order_d.First().warehouse_t);
                if (chkWH == false)
                    throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "warehouse ปลายทางต้องเหมือนกันทุก Item");

                foreach (var wh_d in wh_h.wh_order_d)
                {
                    string ref3 = reqVO.wh_seqord.ToString() + "-" + reqVO.wh_order + "-" + reqVO.wh_origin.ToString() + "-" + reqVO.wh_set.ToString()
                        + "-" + wh_h.wh_Sequence.ToString() + "-" + wh_h.wh_seq_order.ToString() + "-" + wh_h.wh_orderLine.ToString()
                        + "-" + wh_d.Advice + wh_d.Advice_line.ToString();
                    docGR = this.getDocCheckDisto(this.Logger, reqVO.wh_order, wh_d, ref3, ref3Doc, this.BuVO);

                    if (wh_d.update_r != 2 && wh_d.update_r != 1)
                        throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "Status " + wh_d.update_r + " ไม่ถูกต้อง");

                    var Sku = this.GetSKU(this.Logger, wh_d, this.BuVO);
                    var pack = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_PackMaster>(
                         new SQLConditionCriteria[] {
                            new SQLConditionCriteria("SKUMaster_ID",Sku.ID, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("UnitType_ID",Sku.UnitType_ID, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                         }, this.BuVO).FirstOrDefault();




                    var optionsItems = this.mapOptionsItems(this.Logger, wh_h, wh_d, this.BuVO);
                    if (wh_d.update_r == 1)
                    {
                        if (docGR == null)
                        {
                            //Create                          
                            docItemsList.Add(new CreateGRDocument.TReq.ReceiveItem
                            {
                                skuCode = Sku.Code,
                                quantity = (decimal)wh_d.Advised_qty,
                                unitType = StaticValue.UnitTypes.FirstOrDefault(x => x.ID == Sku.UnitType_ID).Code,
                                batch = null,
                                lot = wh_d.Lot,
                                orderNo = null,
                                refID = wh_d.Serial,
                                ref1 = reqVO.wh_order,
                                ref2 = reqVO.proj,
                                ref3 = ref3,
                                eventStatus = DocumentEventStatus.NEW,
                                options = optionsItems

                            });

                        }
                        else
                        {
                            //Insert Docitem
                            AWMSEngine.ADO.DocumentADO.GetInstant().PutItem(new amt_DocumentItem
                            {
                                Document_ID = docGR.ID.Value,
                                Lot = wh_d.Lot,
                                Options = optionsItems,
                                Code = Sku.Code,
                                Quantity = (decimal)wh_d.Advised_qty,
                                BaseQuantity = (decimal)wh_d.Advised_qty,
                                UnitType_ID = Sku.UnitType_ID,
                                BaseUnitType_ID = Sku.UnitType_ID,
                                RefID = wh_d.Serial,
                                Ref2 = reqVO.proj,
                                Ref1 = reqVO.wh_order,
                                Ref3 = ref3,
                                SKUMaster_ID = Sku.ID,
                                PackMaster_ID = pack.ID,
                                EventStatus = DocumentEventStatus.NEW,
                                Status = EntityStatus.ACTIVE

                            }, this.BuVO);
                        }

                    }
                    else if (wh_d.update_r == 2)
                    {
                        //Update
                        if (docGR != null)
                        {
                            var docN = this.updateDocItem(this.Logger, reqVO.proj, Sku, optionsItems, pack, reqVO.wh_order, wh_d, ref3, this.BuVO);
                        }
                        else
                        {
                            throw new AMWException(this.Logger, AMWExceptionCode.V2002, "ไม่พบเอกสารสำหรับการ update");
                        }

                    }
                    else
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.V2002, "update_r status " + wh_d.update_r + " ไม่ถูกต้อง");
                    }

                }
            }

            if (docItemsList.Count != 0)
            {
                //Create

                docH.receiveItems = docItemsList;
                docResult = new CreateGRDocument().Execute(Logger, this.BuVO, docH);
            }
            docRes = this.MapRespone(this.Logger, reqVO, (docResult.Code == null ? docGR.Code : docResult.Code), this.BuVO);

            return docRes;
        }
        private string mapOptionsItems(AMWLogger logger, ERPWHInbound.header wh_h, ERPWHInbound.items wh_d, VOCriteria buVO)
        {
            var optionsItemNew = AMWUtil.Common.ObjectUtil.QryStrSetValue("", OptionVOConst.OPT_ADVICE, wh_d.Advice);
            optionsItemNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsItemNew, OptionVOConst.OPT_ADVICE_LINE, wh_d.Advice_line);
            optionsItemNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsItemNew, OptionVOConst.OPT_LOCATION, wh_d.Location);
            optionsItemNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsItemNew, OptionVOConst.OPT_RECEIPT, wh_d.Receipt);
            optionsItemNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsItemNew, OptionVOConst.OPT_RECEIPT_LINE, wh_d.Receipt_line);
            optionsItemNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsItemNew, OptionVOConst.OPT_WH_SEQ_ORDER, wh_h.wh_seq_order);
            optionsItemNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsItemNew, OptionVOConst.OPT_WH_ORDERLINE, wh_h.wh_orderLine);
            optionsItemNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsItemNew, OptionVOConst.OPT_WH_SEQUENCE, wh_h.wh_Sequence);
            optionsItemNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsItemNew, OptionVOConst.OPT_PROJ_LINE, wh_d.proj_line);
            optionsItemNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsItemNew, OptionVOConst.OPT_WAREHOUSE_F, wh_d.warehouse_f);
            optionsItemNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsItemNew, OptionVOConst.OPT_WAREHOUSE_T, wh_d.warehouse_t);

            return optionsItemNew;
        }

        private CreateGRDocument.TReq mapCreateDocHeader(AMWLogger logger, TReq data_h, VOCriteria buVO)
        {
            ams_Customer cust = new ams_Customer();
            if (!string.IsNullOrWhiteSpace(data_h.cust))
            {
                cust = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_Customer>(
                  new SQLConditionCriteria[] {
                            new SQLConditionCriteria("Code",data_h.cust, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                  }, this.BuVO).FirstOrDefault();

                if (cust == null)
                {
                    var custID = AWMSEngine.ADO.DataADO.GetInstant().Insert<ams_Customer>(this.BuVO, new ams_Customer()
                    {
                        Code = data_h.cust,
                        Name = data_h.cust,
                        Status = EntityStatus.ACTIVE
                    });
                    StaticValueManager.GetInstant().LoadCustomer(this.BuVO);
                    cust = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_Customer>(custID, this.BuVO);
                }

            }
            var optionsNew = AMWUtil.Common.ObjectUtil.QryStrSetValue("", OptionVOConst.OPT_WH_SEQORD, data_h.wh_seqord);
            optionsNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsNew, OptionVOConst.OPT_WH_SET, data_h.wh_set);
            optionsNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsNew, OptionVOConst.OPT_ORINGIN, data_h.wh_origin);
            optionsNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsNew, OptionVOConst.OPT_COMPANY, data_h.company);


            string ref3 = data_h.wh_seqord.ToString() + "-" + data_h.wh_origin.ToString() + "-" + data_h.wh_order + "-" + data_h.wh_set.ToString()
                + "-" + data_h.cust + "-" +data_h.proj;
            var docH = new CreateGRDocument.TReq()
            {
                refID = data_h.amw_refId,
                ref1 = data_h.wh_order,
                ref2 = data_h.proj,
                ref3 = ref3,
                souBranchID = null,
                souAreaMasterID = null,
                desBranchID = null,
                forCustomerCode = cust.Code,
                movementTypeID = DocumentProcessTypeID.STO_TRANSFER_WM,
                lot = null,
                batch = null,
                documentDate = DateTime.Now,
                actionTime = DateTime.Now,
                eventStatus = DocumentEventStatus.NEW,
                desWarehouseCode = "5005",
                souWarehouseCode = "5005",
                options = optionsNew

            };


            return docH;
        }
        private amt_Document getDocCheckDisto(AMWLogger logger, string wh_order, ERPWHInbound.items wh_d,string ref3, string ref3Doc, VOCriteria buVO)
        {

            List<amt_StorageObject> ItemsStos = new List<amt_StorageObject>();
            List<amt_StorageObject> ItemsSto = new List<amt_StorageObject>();
            var docGRitem = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amv_DocumentItem>(
                   new SQLConditionCriteria[] {
                                new SQLConditionCriteria("Code",wh_d.item, SQLOperatorType.EQUALS),
                                new SQLConditionCriteria("Ref3",ref3, SQLOperatorType.EQUALS),
                                new SQLConditionCriteria("refID",wh_d.Serial, SQLOperatorType.EQUALS),
                                new SQLConditionCriteria("EventStatus",DocumentEventStatus.NEW,SQLOperatorType.EQUALS),
                                new SQLConditionCriteria("Status",EntityStatus.ACTIVE,SQLOperatorType.EQUALS),
                                new SQLConditionCriteria("ref1",wh_order,SQLOperatorType.EQUALS),
                                new SQLConditionCriteria("DocumentType_ID",DocumentTypeID.GOODS_RECEIVED,SQLOperatorType.EQUALS),
                   }, this.BuVO).FirstOrDefault();

            var docGR = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_Document>(
                new SQLConditionCriteria[] {
                    new SQLConditionCriteria("ref3",ref3Doc, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status",EntityStatus.ACTIVE,SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("EventStatus",DocumentEventStatus.NEW,SQLOperatorType.EQUALS),
                }, this.BuVO).FirstOrDefault();

            if(wh_d.update_r == 2)
            {
                if (docGR != null && docGRitem != null)
                {
                    var grDocItem = AWMSEngine.ADO.DocumentADO.GetInstant().ListItem(docGR.ID.Value, this.BuVO);
                    grDocItem.ForEach(item =>
                    {
                        ItemsStos = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(
                           new SQLConditionCriteria[] {
                        new SQLConditionCriteria("EventStatus",StorageObjectEventStatus.NEW,SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Options","%_docitem_id="+item.ID+"%", SQLOperatorType.LIKE),
                           }, this.BuVO);

                        if (item.ID == docGRitem.ID && ItemsStos.Count != 0)
                            throw new AMWException(this.Logger, AMWExceptionCode.V2002, "สินค้านี้ถูก Mapping เข้าพาเลทแล้ว");


                    });



                }
            }


            return docGR;
        }
        private ams_SKUMaster GetSKU(AMWLogger logger, ERPWHInbound.items wh_d, VOCriteria buVO)
        {
            var sku = new ams_SKUMaster();
            // Insert SKU 

            sku = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_SKUMaster>(
                new SQLConditionCriteria[] {
                                        new SQLConditionCriteria("Code",wh_d.item, SQLOperatorType.EQUALS),
                                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                }, this.BuVO).FirstOrDefault();

            if (sku == null)
            {
                var skuType = wh_d.item_group == null ? null : StaticValue.SKUMasterTypes.First(x => x.Code == wh_d.item_group).ID;
                if (skuType == null)
                    throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่พบประเภทของสินค้า " + wh_d.item_group + " ในระบบ");

                var dataUnit = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_UnitType>(
                    new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Code",wh_d.inventory_unit, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                    }, this.BuVO).FirstOrDefault();

                var unit = dataUnit == null ? null : StaticValue.UnitTypes.First(x => x.Code == wh_d.inventory_unit).ID;
                if (unit == null)
                {
                    var unitID = AWMSEngine.ADO.DataADO.GetInstant().Insert<ams_UnitType>(this.BuVO, new ams_UnitType()
                    {
                        Code = wh_d.inventory_unit,
                        Name = wh_d.inventory_unit,
                        ObjectType = StorageObjectType.PACK,
                        Status = EntityStatus.ACTIVE

                    });
                    unit = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_UnitType>(unitID, this.BuVO).ID;
                    StaticValueManager.GetInstant().LoadUnitType(this.BuVO);
                }

                var skuID = AWMSEngine.ADO.DataADO.GetInstant().Insert<ams_SKUMaster>(this.BuVO, new ams_SKUMaster()
                {
                    Code = wh_d.item,
                    Name = wh_d.item,
                    WeightKG = 1,
                    UnitType_ID = unit,
                    SKUMasterType_ID = skuType.Value,
                    Status = EntityStatus.ACTIVE

                });


                sku = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_SKUMaster>(skuID, this.BuVO);
                AWMSEngine.ADO.DataADO.GetInstant().Insert<ams_PackMaster>(this.BuVO, new ams_PackMaster()
                {
                    SKUMaster_ID = skuID.Value,
                    ObjectSize_ID = StaticValue.ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.PACK).ID.Value,
                    Code = sku.Code,
                    Name = sku.Name,
                    WeightKG = 1,
                    UnitType_ID = sku.UnitType_ID.Value,
                    Status = EntityStatus.ACTIVE
                });

                StaticValueManager.GetInstant().LoadPackUnitConvert(this.BuVO);
            }
            return sku;
        }
        private amt_Document updateDocItem(AMWLogger logger, string proj, ams_SKUMaster sku, string optionsItems, ams_PackMaster pack, string wh_order, ERPWHInbound.items wh_d,string ref3, VOCriteria buVO)
        {
            //Update
            var docUpdate = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                               new SQLConditionCriteria[] {
                                new SQLConditionCriteria("Code",wh_d.item, SQLOperatorType.EQUALS),
                                new SQLConditionCriteria("refID",wh_d.Serial, SQLOperatorType.EQUALS),
                                new SQLConditionCriteria("Ref3",ref3, SQLOperatorType.EQUALS),
                                new SQLConditionCriteria("EventStatus",DocumentEventStatus.NEW,SQLOperatorType.EQUALS),
                                new SQLConditionCriteria("Status",EntityStatus.ACTIVE,SQLOperatorType.EQUALS),
                                new SQLConditionCriteria("ref1",wh_order,SQLOperatorType.EQUALS),
                               }, this.BuVO).FirstOrDefault();

            if (docUpdate == null)
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่มี Doc Items ที่สัมพันธ์กับข้อมูล");



            //Remove
            AWMSEngine.ADO.DocumentADO.GetInstant().UpdateItemEventStatus(docUpdate.ID.Value, DocumentEventStatus.REMOVED, this.BuVO);


            AWMSEngine.ADO.DocumentADO.GetInstant().PutItem(new amt_DocumentItem
            {
                Document_ID = docUpdate.Document_ID,
                Lot = wh_d.Lot,
                Options = optionsItems,
                Code = sku.Code,
                Quantity = (decimal)wh_d.Advised_qty,
                BaseQuantity = (decimal)wh_d.Advised_qty,
                UnitType_ID = sku.UnitType_ID,
                BaseUnitType_ID = sku.UnitType_ID,
                RefID = wh_d.Serial,
                Ref2 = proj,
                Ref1 = wh_order,
                Ref3 = ref3,
                SKUMaster_ID = sku.ID,
                PackMaster_ID = pack.ID,
                EventStatus = (decimal)wh_d.Advised_qty == 0 ? DocumentEventStatus.REMOVED : DocumentEventStatus.NEW,
                Status = (decimal)wh_d.Advised_qty == 0 ? EntityStatus.REMOVE : EntityStatus.ACTIVE

            }, this.BuVO);

            var docUpdateN = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_Document>(docUpdate.Document_ID, this.BuVO);

            var docUpdateItemN = AWMSEngine.ADO.DocumentADO.GetInstant().ListItem(docUpdateN.ID.Value, this.BuVO);

            //var x1 = docUpdateItemN.TrueForAll(x => x.EventStatus == DocumentEventStatus.REMOVED);
            if (docUpdateItemN.TrueForAll(x => x.EventStatus == DocumentEventStatus.REMOVED))
            {

                AWMSEngine.ADO.DocumentADO.GetInstant().UpdateEventStatus(docUpdateN.ID.Value, DocumentEventStatus.REMOVED, this.BuVO);
            }

            return docUpdateN;
        }
        private TRes MapRespone(AMWLogger logger, TReq reqVO, string docCode, VOCriteria buVO)
        {
            var wh_order_h_dats = new List<TRes.header>();

            foreach (var wh_h in reqVO.wh_order_h)
            {
                var wh_order_d_dats = new List<TRes.items>();
                foreach (var wh_d in wh_h.wh_order_d)
                {
                    wh_order_d_dats.Add(new TRes.items()
                    {
                        Advice = wh_d.Advice,
                        Advice_line = wh_d.Advice_line,
                        item = wh_d.item,
                        proj_line = wh_d.proj_line,
                        status = "Success",
                        message = "Success"
                    });

                }
                wh_order_h_dats.Add(new TRes.header()
                {
                    wh_orderLine = wh_h.wh_orderLine,
                    wh_Sequence = wh_h.wh_Sequence,
                    wh_seq_order = wh_h.wh_seq_order,
                    wh_order_d = wh_order_d_dats

                });

            };


            var res = new TRes()
            {
                amw_refId = docCode,
                wh_seqord = reqVO.wh_seqord,
                company = reqVO.company,
                wh_origin = reqVO.wh_origin,
                wh_set = reqVO.wh_set,
                wh_order = reqVO.wh_order,
                status = "Success",
                message = "Success",
                wh_order_h = wh_order_h_dats

            };

            return res;

        }
    }
}
