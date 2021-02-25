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

        protected override TRes ExecuteEngine(TReq reqVO)
        {

            var resRecord = new List<Record>();

            foreach (var line in reqVO.RECORD)
            {
                amt_Document document = new amt_Document();
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


                document = this.CreateDocGR(this.Logger, line, qty_s, warehouse, sku, pack, this.BuVO);
                this.CreateDocPA(this.Logger, line, qty_s, warehouse, sku, pack, document, this.BuVO);

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


        private amt_Document CreateDocGR(AMWLogger logger, AMWRequestCreateGRDocList.RECORD_LIST line, decimal qty_s, ams_Warehouse warehouse, ams_SKUMaster sku, ams_PackMaster pack, VOCriteria buVO)
        {
            amt_Document docResultGR = new amt_Document();
            List<CreateGRDocument.TReq.ReceiveItem> docItemsList = new List<CreateGRDocument.TReq.ReceiveItem>();
            var StaticValue = ADO.WMSStaticValue.StaticValueManager.GetInstant();

            var optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue("", GCLOptionVOConst.OPT_QTY_PER_PALLET, line.LINE.qty_per_pallet);
                optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_CHECK_RECIEVE, line.LINE.Check_recieve);
                optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_QTY, line.LINE.qty);

            AuditStatus AdditStatus = EnumUtil.GetValueEnum<AuditStatus>(line.LINE.status);

            var docH = new CreateGRDocument.TReq()
            {
                documentTypeID = DocumentTypeID.GOODS_RECEIVE,
                ref1 = line.LINE.grade,
                ref2 = line.LINE.doc_wms,
                souBranchID = null,
                souAreaMasterID = null,
                desBranchID = null,
                //forCustomerCode = StaticValue.Customers.First(x => x.Code == customer.Code).Code,
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

        private amt_Document CreateDocPA(AMWLogger logger, AMWRequestCreateGRDocList.RECORD_LIST line, decimal qty_s, ams_Warehouse warehouse, ams_SKUMaster sku, ams_PackMaster pack, amt_Document DocGR, VOCriteria buVO)
        {
            amt_Document docResultPA = new amt_Document();
            List<CreateGRDocument.TReq.ReceiveItem> docItemsList = new List<CreateGRDocument.TReq.ReceiveItem>();
            var StaticValue = ADO.WMSStaticValue.StaticValueManager.GetInstant();

            var grDocItem = ADO.WMSDB.DocumentADO.GetInstant().ListItem(DocGR.ID.Value, this.BuVO);

            var optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue("", GCLOptionVOConst.OPT_QTY_PER_PALLET, line.LINE.qty_per_pallet);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_QTY, line.LINE.qty);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_CHECK_RECIEVE, line.LINE.Check_recieve);

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
                // forCustomerCode = StaticValue.Customers.First(x => x.Code == customer.Code).Code,
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
    }
}
