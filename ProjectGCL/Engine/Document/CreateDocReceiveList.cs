using AMWUtil.Logger;
using AWMSEngine.Engine;
using AMSModel.Constant.EnumConst;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Exception;
using AWMSEngine.Common;
using AMWUtil.Common;
using AMSModel.Criteria.SP.Request;
using AMSModel.Criteria.SP.Response;
using AMSModel.Constant.StringConst;
using AWMSEngine.Engine.V2.Business.Document;
using GCLModel.Criteria;
using AWMSEngine.Engine.V2.Business.Received;
using Newtonsoft.Json;


namespace ProjectGCL.Engine.Document
{
    public class CreateDocReceiveList : BaseEngine<CreateDocReceiveList.TReq, CreateDocReceiveList.TRes>
    {

        public class TReq : AMWRequestCreateGRDocList
        {
        }
        public class TRes
        {
            public List<Record> Record;
        }
        public class Record
        {
            public string api_ref;
            public string doc_wms;
            public string doc_wcs;
            public string check_receive;
            public DateTime Date_time;
        }

        public class LocationList
        {
            public int bank;
            public int level;
            public int qty;
            public int receive = 0;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {

            var resRecord = new List<Record>();

            foreach (var line in reqVO.RECORD)
            {

                amt_Document document = new amt_Document();
                amt_Document documentChild = new amt_Document();
                var qty_s = this.ValidateQty(this.Logger, line, this.BuVO);
                var sku = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_SKUMaster>(
                        new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Code",line.LINE.sku, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                        }, this.BuVO).FirstOrDefault();

                if (sku == null)
                    throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่มี sku นี้ในระบบ");

                var pack = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_PackMaster>(
                        new SQLConditionCriteria[] {
                        new SQLConditionCriteria("SKUMaster_ID",sku.ID.Value, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                        }, this.BuVO).FirstOrDefault();

                if (pack == null)
                    throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่มี pack นี้ในระบบ");

                var warehouse = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_Warehouse>(
                        new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Code",line.LINE.warehouse, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                        }, this.BuVO).FirstOrDefault();

                if (warehouse == null)
                    throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่มี warehouse นี้ในระบบ");

                var customer = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_Customer>(
                    new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Code",line.LINE.customer, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                    }, this.BuVO).FirstOrDefault();

                document = this.CreateDocGR(this.Logger, line, qty_s, warehouse, customer, sku, pack, this.BuVO);
                documentChild = this.CreateDocPA(this.Logger, line, qty_s, warehouse, customer, sku, pack, document, this.BuVO);
                this.GenerateLocation(this.Logger, line, documentChild, this.BuVO);
                resRecord.Add(new Record
                {
                    api_ref = line.LINE.api_ref,
                    doc_wms = line.LINE.doc_wms,
                    doc_wcs = document.Code,
                    Date_time = line.LINE.Date_time,
                    check_receive = line.LINE.Check_recieve

                });

            }

            var res = new TRes()
            {
                Record = resRecord
            };

            return res;
        }

        private decimal ValidateQty(AMWLogger logger, AMWRequestCreateGRDocList.RECORD_LIST line, VOCriteria buVO)
        {
            var totalQtyPallet = line.LINE.qty_per_pallet * line.LINE.List_Pallet.Count();
            var qty_s = new decimal();
            if (line.LINE.qty > totalQtyPallet)
            {
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "Qty เกิน Qty/Pallet รวม");
            }
            else
            {
                qty_s = (decimal)(totalQtyPallet - line.LINE.qty);
                if (qty_s > line.LINE.qty)
                {
                    throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "Qty เศษ น้อยกว่า Qty/Pallet");
                }

            }
            return qty_s;
        }


        private amt_Document CreateDocGR(AMWLogger logger, AMWRequestCreateGRDocList.RECORD_LIST line, decimal qty_s, ams_Warehouse warehouse, ams_Customer customer, ams_SKUMaster sku, ams_PackMaster pack, VOCriteria buVO)
        {
            amt_Document docResultGR = new amt_Document();
            List<CreateGRDocument.TReq.ReceiveItem> docItemsList = new List<CreateGRDocument.TReq.ReceiveItem>();
            var StaticValue = ADO.WMSStaticValue.StaticValueManager.GetInstant();

            var optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue("", GCLOptionVOConst.OPT_QTY_PER_PALLET, line.LINE.qty_per_pallet);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_CHECK_RECIEVE, line.LINE.Check_recieve);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_QTY, line.LINE.qty);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_START_PALLET, line.LINE.start_pallet);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_END_PALLET, line.LINE.end_pallet);

            AuditStatus AdditStatus = EnumUtil.GetValueEnum<AuditStatus>(line.LINE.status);

            var docH = new CreateGRDocument.TReq()
            {
                documentTypeID = DocumentTypeID.GOODS_RECEIVE,
                ref1 = line.LINE.grade,
                ref2 = line.LINE.doc_wms,
                souBranchID = null,
                souAreaMasterID = null,
                desBranchID = null,
                forCustomerCode = customer == null ? null : StaticValue.Customers.First(x => x.Code == customer.Code).Code,
                documentProcessTypeID = DocumentProcessTypeID.FG_TRANSFER_WM,
                lot = line.LINE.lot,
                batch = null,
                documentDate = DateTime.Now,
                actionTime = DateTime.Now,
                eventStatus = DocumentEventStatus.NEW,
                desWarehouseCode = StaticValue.Warehouses.First(x => x.Code == warehouse.Code).Code,
                options = optionsDocItems

            };

            foreach (var pallet in line.LINE.List_Pallet)
            {
                docItemsList.Add(new CreateGRDocument.TReq.ReceiveItem
                {
                    skuCode = sku.Code,
                    packCode = pack.Code,
                    baseCode = pallet,
                    quantity = line.LINE.qty_per_pallet,
                    baseQuantity = line.LINE.qty_per_pallet,
                    unitType = StaticValue.UnitTypes.First(x => x.Code == line.LINE.unit).Code,
                    baseunitType = StaticValue.UnitTypes.First(x => x.Code == line.LINE.unit).Code,
                    batch = null,
                    lot = line.LINE.lot,
                    orderNo = null,
                    ref1 = line.LINE.grade,
                    ref2 = line.LINE.doc_wms,
                    auditStatus = AdditStatus,
                    eventStatus = DocumentEventStatus.NEW,
                    options = optionsDocItems

                });
            }
            docItemsList[line.LINE.List_Pallet.Count() - 1].quantity = qty_s == 0 ? line.LINE.qty_per_pallet : (line.LINE.qty_per_pallet - qty_s);
            docItemsList[line.LINE.List_Pallet.Count() - 1].baseQuantity = qty_s == 0 ? line.LINE.qty_per_pallet : (line.LINE.qty_per_pallet - qty_s);
            docH.receiveItems = docItemsList;
            docResultGR = new CreateGRDocument().Execute(Logger, this.BuVO, docH);

            return docResultGR;

        }

        private amt_Document CreateDocPA(AMWLogger logger, AMWRequestCreateGRDocList.RECORD_LIST line, decimal qty_s, ams_Warehouse warehouse, ams_Customer customer, ams_SKUMaster sku, ams_PackMaster pack, amt_Document DocGR, VOCriteria buVO)
        {
            amt_Document docResultPA = new amt_Document();
            List<CreateGRDocument.TReq.ReceiveItem> docItemsList = new List<CreateGRDocument.TReq.ReceiveItem>();
            var StaticValue = ADO.WMSStaticValue.StaticValueManager.GetInstant();

            var grDocItem = ADO.WMSDB.DocumentADO.GetInstant().ListItem(DocGR.ID.Value, this.BuVO);

            var optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue("", GCLOptionVOConst.OPT_QTY_PER_PALLET, line.LINE.qty_per_pallet);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_QTY, line.LINE.qty);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_CHECK_RECIEVE, line.LINE.Check_recieve);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_START_PALLET, line.LINE.start_pallet);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_END_PALLET, line.LINE.end_pallet);

            AuditStatus AdditStatus = EnumUtil.GetValueEnum<AuditStatus>(line.LINE.status);

            var docH = new CreateGRDocument.TReq()
            {
                documentTypeID = DocumentTypeID.PUTAWAY,
                parentDocumentID = DocGR.ID.Value,
                ref1 = line.LINE.grade,
                ref2 = line.LINE.doc_wms,
                souBranchID = null,
                souAreaMasterID = null,
                desBranchID = null,
                forCustomerCode = customer == null ? null : StaticValue.Customers.First(x => x.Code == customer.Code).Code,
                documentProcessTypeID = DocumentProcessTypeID.FG_TRANSFER_WM,
                lot = line.LINE.lot,
                batch = null,
                documentDate = DateTime.Now,
                actionTime = DateTime.Now,
                eventStatus = DocumentEventStatus.NEW,
                desWarehouseCode = StaticValue.Warehouses.First(x => x.Code == warehouse.Code).Code,
                options = optionsDocItems

            };
            foreach (var pallet in line.LINE.List_Pallet)
            {
                docItemsList.Add(new CreateGRDocument.TReq.ReceiveItem
                {
                    parentDocumentItem_ID = grDocItem[0].ID,
                    skuCode = sku.Code,
                    packCode = pack.Code,
                    baseCode = pallet,
                    quantity = line.LINE.qty_per_pallet,
                    baseQuantity = line.LINE.qty_per_pallet,
                    unitType = StaticValue.UnitTypes.First(x => x.Code == line.LINE.unit).Code,
                    baseunitType = StaticValue.UnitTypes.First(x => x.Code == line.LINE.unit).Code,
                    batch = null,
                    lot = line.LINE.lot,
                    orderNo = null,
                    ref1 = line.LINE.grade,
                    ref2 = line.LINE.doc_wms,
                    auditStatus = AdditStatus,
                    eventStatus = DocumentEventStatus.NEW,
                    options = optionsDocItems

                });
            }
            docItemsList[line.LINE.List_Pallet.Count() - 1].quantity = qty_s == 0 ? line.LINE.qty_per_pallet : (line.LINE.qty_per_pallet - qty_s);
            docItemsList[line.LINE.List_Pallet.Count() - 1].baseQuantity = qty_s == 0 ? line.LINE.qty_per_pallet : (line.LINE.qty_per_pallet - qty_s);
            docH.receiveItems = docItemsList;
            docResultPA = new CreateGRDocument().Execute(Logger, this.BuVO, docH);

            return docResultPA;

        }

        private void GenerateLocation(AMWLogger logger, AMWRequestCreateGRDocList.RECORD_LIST line, amt_Document documentChild, VOCriteria buVO)
        {
            List<LocationList> location_options = new List<LocationList>();
            List<amv_CheckLocationSto> grouploc = new List<amv_CheckLocationSto>();
            List<LocationList> location_optionsxx = new List<LocationList>();
            var mxBank = 52;
            var mxlevel = 3;
            var mxpallet = 41;
            var doc = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
                        new SQLConditionCriteria[] {
                            new SQLConditionCriteria("EventStatus","10,11", SQLOperatorType.IN),
                            new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("DocumentType_ID", DocumentTypeID.PUTAWAY, SQLOperatorType.EQUALS)
                        }, this.BuVO);


            if (doc.Count > 0)
            {

                foreach (var d in doc)
                {
                    var location = AMWUtil.Common.ObjectUtil.QryStrGetValue(d.Options, OptionVOConst.OPT_LOCATION);
                    if (!string.IsNullOrWhiteSpace(location))
                    {
                        //location_options.AddRange(JsonConvert.DeserializeObject<List<LocationList>>(location));
                        var x = JsonConvert.DeserializeObject<LocationList>(location);
                        location_optionsxx.Add(x);
                        location_options.AddRange(location_optionsxx);
                    }
                }

                if (location_options.Count() != 0)
                {
                    grouploc = location_options.GroupBy(x => new { x.bank, x.level }).Select(
                       y => new amv_CheckLocationSto()
                       {
                           Bank = y.Key.bank,
                           Lv = y.Key.level,
                           BaseCode = y.ToList().Sum(z => z.qty),
                           Lot = y.ToList().Count()

                       }).ToList();
                }
            }


            var location_in_sto = ADO.WMSDB.DataADO.GetInstant().SelectBy<amv_CheckLocationSto>(
                        new SQLConditionCriteria[] { }, this.BuVO);

            grouploc.AddRange(location_in_sto);

            grouploc.GroupBy(x => new { x.Bank, x.Lv }).Select(
                y => new amv_CheckLocationSto()
                {
                    Bank = y.Key.Bank,
                    Lv = y.Key.Lv,
                    BaseCode = y.ToList().Sum(z => z.BaseCode),
                    Lot = y.ToList().Count()

                }).ToList();

            var listLo = new List<LocationList>();

            var allDocQty = line.LINE.List_Pallet.Count();

            for (var i = 1; i <= mxBank; i++)
            {
                for (var j = 1; j <= mxlevel; j++)
                {
                    var findEmpty = grouploc.Find(x => x.Bank == i && x.Lv == j);
                    if (findEmpty == null)
                    {
                        listLo.Add(new LocationList() { bank = i, level = j, qty = mxpallet, receive = 0 });
                        allDocQty = mxpallet - allDocQty;

                        if (allDocQty == 0)
                            break;
                    }
                    else
                    {
                        var findEmptyV2 = grouploc.Find(x => x.Bank == i && x.Lv == j && x.BaseCode < mxpallet && x.Lot <= 2);
                        if (findEmptyV2 != null)
                        {
                            listLo.Add(new LocationList() { bank = i, level = j, qty = (mxpallet - (int)findEmptyV2.BaseCode), receive = 0 });
                            allDocQty = mxpallet - allDocQty;

                            if (allDocQty == 0)
                                break;
                        }
                    }

                };
                if (allDocQty == 0)
                    break;
            };
            var _listLo = listLo.FindAll(x => x.receive != x.qty);
            var loc = _listLo.OrderByDescending(x=>x.bank).ToArray().FirstOrDefault();
            var xx = JsonConvert.SerializeObject(loc);
            var opt_loc = AMWUtil.Common.ObjectUtil.QryStrSetValue(documentChild.Options, OptionVOConst.OPT_LOCATION, xx.ToString());
            var listItemChilds = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Document_ID",documentChild.ID.Value, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",2, SQLOperatorType.NOTEQUALS),
                }, this.BuVO);


            var listItemParent = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Document_ID",documentChild.ParentDocument_ID.Value, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",2, SQLOperatorType.NOTEQUALS),
                }, this.BuVO);


            ADO.WMSDB.DataADO.GetInstant().UpdateByID<amt_Document>(documentChild.ParentDocument_ID.Value, buVO,
                new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("Options", opt_loc)
                });

            ADO.WMSDB.DataADO.GetInstant().UpdateByID<amt_Document>(documentChild.ID.Value, buVO,
                 new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("Options", opt_loc)
                 });



        }

    }
}
