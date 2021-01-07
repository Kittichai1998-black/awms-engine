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

        public class TReq : AMWRequestCreateDoc
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
            var StaticValue = ADO.WMSStaticValue.StaticValueManager.GetInstant();

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
                        new SQLConditionCriteria("SKUMaster_ID",sku.ID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("UnitType_ID",sku.UnitType_ID, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                    }, this.BuVO).FirstOrDefault();

            if (pack == null)
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่มี pack นี้ในระบบ");

            var warehouse = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_SKUMaster>(
                    new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Code",reqVO.warehouse, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                    }, this.BuVO).FirstOrDefault();

            if (warehouse == null)
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่มี warehouse นี้ในระบบ");

            var document = this.CreateDoc(this.Logger, reqVO, sku,pack, this.BuVO);

            var res = new TRes()
            {
                api_ref = reqVO.api_ref,
                doc_wms = reqVO.doc_wms,
                doc_wcs = document.Code

            };
            return null;
        }
        private amt_Document CreateDoc(AMWLogger logger, TReq reqVO, ams_SKUMaster sku, ams_PackMaster pack, VOCriteria buVO)
        {
            amt_Document docResult = new amt_Document();
            List<CreateGRDocument.TReq.ReceiveItem> docItemsList = new List<CreateGRDocument.TReq.ReceiveItem>();

            var optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue("", GCLOptionVOConst.OPT_DISCHARGE, reqVO.discharge);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_START_PALLET, reqVO.start_pallet);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_END_PALLET, reqVO.end_pallet);
            optionsDocItems = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsDocItems, GCLOptionVOConst.OPT_QTY_PER_PALLET, reqVO.qty_per_pallet);

            AuditStatus AdStatus = EnumUtil.GetValueEnum<AuditStatus>(reqVO.status);

            var docH = new CreateGRDocument.TReq()
            {
                refID = reqVO.doc_wms,
                ref1 = reqVO.grade,
                souBranchID = null,
                souAreaMasterID = null,
                desBranchID = null,
                forCustomerCode = reqVO.customer,
                documentProcessTypeID = DocumentProcessTypeID.FG_TRANSFER_CUS,
                lot = reqVO.lot,
                batch = null,
                documentDate = DateTime.Now,
                actionTime = DateTime.Now,
                eventStatus = DocumentEventStatus.NEW,
                desWarehouseCode = reqVO.warehouse,
                souWarehouseCode = "5005",
                options = optionsDocItems

            };

            docItemsList.Add(new CreateGRDocument.TReq.ReceiveItem
            {
                skuCode = sku.Code,
                quantity = reqVO.qty,
                unitType = reqVO.unit,
                batch = null,
                lot = reqVO.lot,
                orderNo = null,
                refID = reqVO.doc_wms,
                ref1 = reqVO.grade,
                auditStatus = AdStatus,
                eventStatus = DocumentEventStatus.NEW,
                options = optionsDocItems

            });

            docH.receiveItems = docItemsList;
            docResult = new CreateGRDocument().Execute(Logger, this.BuVO, docH);

            return docResult;

        }
    }
}
