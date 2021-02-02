using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Exception;
using AWMSEngine.Common;
using AMWUtil.Common;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Constant.StringConst;
using AWMSEngine.Engine.V2.Business.Document;
using GCLModel.Criteria;
using AWMSEngine.Engine.V2.Business.Received;

namespace ProjectGCL.Engine.Document
{
    public class CreateDocReceive : BaseEngine<CreateDocReceive.TReq, CreateDocReceive.TRes>
    {

        public class TReq : AMWRequestCreateGRDoc
        {
        }
        public class TRes
        {
            public string api_ref;
            public string doc_wms;
            public string doc_wcs;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            amt_Document document = new amt_Document();
            this.Chacknull(this.Logger, reqVO, this.BuVO);

            var customer = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_Customer>(
                    new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Code",reqVO.customer, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                    }, this.BuVO).FirstOrDefault();

            if (customer == null)
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่มี customer นี้ในระบบ");

            var sku = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_SKUMaster>(
                    new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Code",reqVO.sku, SQLOperatorType.EQUALS),
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
                        new SQLConditionCriteria("Code",reqVO.warehouse, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                    }, this.BuVO).FirstOrDefault();

            if (warehouse == null)
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่มี warehouse นี้ในระบบ");

            var documentGRCheck = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
                    new SQLConditionCriteria[] {
                        new SQLConditionCriteria("ref2",reqVO.doc_wms, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("DocumentType_ID",DocumentTypeID.GOODS_RECEIVE,SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",2,SQLOperatorType.NOTEQUALS)
                    }, this.BuVO).FirstOrDefault();

            var documentPACheck = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
                    new SQLConditionCriteria[] {
                                    new SQLConditionCriteria("ref2",reqVO.doc_wms, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("DocumentType_ID",DocumentTypeID.PUTAWAY,SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("Status",2,SQLOperatorType.NOTEQUALS)
                    }, this.BuVO).FirstOrDefault();

            if (documentGRCheck != null)
            {
                if (documentGRCheck.EventStatus == DocumentEventStatus.NEW)
                {
                    ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(documentGRCheck.ID.Value, DocumentEventStatus.NEW, EntityStatus.ACTIVE, DocumentEventStatus.REJECTED, this.BuVO);
                    if (documentPACheck != null)
                    {
                        ADO.WMSDB.DocumentADO.GetInstant().UpdateStatusToChild(documentPACheck.ID.Value, DocumentEventStatus.NEW, EntityStatus.ACTIVE, DocumentEventStatus.REJECTED, this.BuVO);
                    }
                    document = this.CreateDocGR(this.Logger, reqVO, warehouse, customer, sku,pack, this.BuVO);
                    this.CreateDocPA(this.Logger, reqVO, warehouse, customer, sku,pack, document, this.BuVO);
                }
                else if (documentGRCheck.EventStatus == DocumentEventStatus.WORKING)
                {
                    throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่สามารถสร้างเอกสารได้เพราะมีเอกสารที่กำลังทำงานอยู่");
                }

            }
            else
            {
                document = this.CreateDocGR(this.Logger, reqVO, warehouse, customer, sku, pack, this.BuVO);
                this.CreateDocPA(this.Logger, reqVO, warehouse, customer, sku, pack, document, this.BuVO);
            }

            var res = new TRes()
            {
                api_ref = reqVO.api_ref,
                doc_wms = reqVO.doc_wms,
                doc_wcs = document.Code

            };
            return res;
        }


        private amt_Document CreateDocGR(AMWLogger logger, TReq reqVO, ams_Warehouse warehouse, ams_Customer customer, ams_SKUMaster sku,ams_PackMaster pack, VOCriteria buVO)
        {
            amt_Document docResultGR = new amt_Document();
            List<CreateGRDocument.TReq.ReceiveItem> docItemsList = new List<CreateGRDocument.TReq.ReceiveItem>();
            var StaticValue = ADO.WMSStaticValue.StaticValueManager.GetInstant();

            var optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue("", GCLOptionVOConst.OPT_DISCHARGE, reqVO.discharge);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_START_PALLET, reqVO.start_pallet);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_END_PALLET, reqVO.end_pallet);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_QTY_PER_PALLET, reqVO.qty_per_pallet);

            AuditStatus AdditStatus = EnumUtil.GetValueEnum<AuditStatus>(reqVO.status);

            var docH = new CreateGRDocument.TReq()
            {
                documentTypeID = DocumentTypeID.GOODS_RECEIVE,
                ref1 = reqVO.grade,
                ref2 = reqVO.doc_wms,
                souBranchID = null,
                souAreaMasterID = null,
                desBranchID = null,
                forCustomerCode = StaticValue.Customers.First(x => x.Code == customer.Code).Code,
                documentProcessTypeID = DocumentProcessTypeID.FG_TRANSFER_WM,
                lot = reqVO.lot,
                batch = null,
                documentDate = DateTime.Now,
                actionTime = DateTime.Now,
                eventStatus = DocumentEventStatus.NEW,
                desWarehouseCode = StaticValue.Warehouses.First(x => x.Code == warehouse.Code).Code,
                options = optionsDocItems

            };

            docItemsList.Add(new CreateGRDocument.TReq.ReceiveItem
            {
                skuCode = sku.Code,
                packCode = pack.Code,
                quantity = reqVO.qty,
                baseQuantity = reqVO.qty,
                unitType = StaticValue.UnitTypes.First(x => x.Code == reqVO.unit).Code,
                baseunitType = StaticValue.UnitTypes.First(x => x.Code == reqVO.unit).Code,
                batch = null,
                lot = reqVO.lot,
                orderNo = null,
                ref1 = reqVO.grade,
                ref2 = reqVO.doc_wms,
                auditStatus = AdditStatus,
                eventStatus = DocumentEventStatus.NEW,
                options = optionsDocItems

            });

            docH.receiveItems = docItemsList;
            docResultGR = new CreateGRDocument().Execute(Logger, this.BuVO, docH);

            return docResultGR;

        }

        private amt_Document CreateDocPA(AMWLogger logger, TReq reqVO, ams_Warehouse warehouse, ams_Customer customer, ams_SKUMaster sku,ams_PackMaster pack, amt_Document DocGR, VOCriteria buVO)
        {
            amt_Document docResultPA = new amt_Document();
            List<CreateGRDocument.TReq.ReceiveItem> docItemsList = new List<CreateGRDocument.TReq.ReceiveItem>();
            var StaticValue = ADO.WMSStaticValue.StaticValueManager.GetInstant();

            var optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue("", GCLOptionVOConst.OPT_DISCHARGE, reqVO.discharge);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_START_PALLET, reqVO.start_pallet);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_END_PALLET, reqVO.end_pallet);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_QTY_PER_PALLET, reqVO.qty_per_pallet);

            AuditStatus AdditStatus = EnumUtil.GetValueEnum<AuditStatus>(reqVO.status);

            var docH = new CreateGRDocument.TReq()
            {
                documentTypeID = DocumentTypeID.PUTAWAY,
                parentDocumentID = DocGR.ID.Value,
                ref1 = reqVO.grade,
                ref2 = reqVO.doc_wms,
                souBranchID = null,
                souAreaMasterID = null,
                desBranchID = null,
                forCustomerCode = StaticValue.Customers.First(x => x.Code == customer.Code).Code,
                documentProcessTypeID = DocumentProcessTypeID.FG_TRANSFER_WM,
                lot = reqVO.lot,
                batch = null,
                documentDate = DateTime.Now,
                actionTime = DateTime.Now,
                eventStatus = DocumentEventStatus.NEW,
                desWarehouseCode = StaticValue.Warehouses.First(x => x.Code == warehouse.Code).Code,
                options = optionsDocItems

            };

            docItemsList.Add(new CreateGRDocument.TReq.ReceiveItem
            {

                skuCode = sku.Code,
                packCode = pack.Code,
                quantity = reqVO.qty,
                baseQuantity = reqVO.qty,
                unitType = StaticValue.UnitTypes.First(x => x.Code == reqVO.unit).Code,
                baseunitType = StaticValue.UnitTypes.First(x => x.Code == reqVO.unit).Code,
                batch = null,
                lot = reqVO.lot,
                orderNo = null,
                ref1 = reqVO.grade,
                ref2 = reqVO.doc_wms,
                auditStatus = AdditStatus,
                eventStatus = DocumentEventStatus.NEW,
                options = optionsDocItems

            });

            docH.receiveItems = docItemsList;
            docResultPA = new CreateGRDocument().Execute(Logger, this.BuVO, docH);

            return docResultPA;

        }
        private void Chacknull(AMWLogger logger, TReq reqVO, VOCriteria buVO)
        {

            if (String.IsNullOrWhiteSpace(reqVO.customer))
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "customer เป็นค่าว่าง");

            if (String.IsNullOrWhiteSpace(reqVO.api_ref))
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "api_ref เป็นค่าว่าง");

            if (String.IsNullOrWhiteSpace(reqVO.doc_wms))
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "doc_wms เป็นค่าว่าง");

            if (String.IsNullOrWhiteSpace(reqVO.grade))
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "grade เป็นค่าว่าง");

            if (String.IsNullOrWhiteSpace(reqVO.sku))
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "sku เป็นค่าว่าง");

            if (String.IsNullOrWhiteSpace(reqVO.unit))
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "unit เป็นค่าว่าง");
        }
    }
}
