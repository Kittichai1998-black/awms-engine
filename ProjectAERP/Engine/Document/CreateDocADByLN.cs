using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Common;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business.Auditor;
using AWMSEngine.Engine.V2.Business.Issued;
using AWMSEngine.Engine.V2.Business.Received;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ProjectAERP.Engine.Document
{
    public class CreateDocADByLN : BaseEngine<CreateDocADByLN.TReq, CreateDocADByLN.TRes>
    {

        public class TReq : ERPWHCounting
        {
        }
        public class TRes : AMWWHCounting
        {

        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var res = new TRes();
            var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
            List<CreateADDocument.TReq.TItem> docItemsList = new List<CreateADDocument.TReq.TItem>();
            CreateADDocument.TReq doc = new CreateADDocument.TReq();
            List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();

            doc = new CreateADDocument.TReq()
            {
                refID = null,
                ref1 = reqVO.count_order,
                ref2 = null,
                souBranchID = null,
                souAreaMasterID = null,
                desBranchID = null,
                documentProcessTypeID = DocumentProcessTypeID.FG_PHYSICAL_COUNT_WM,
                lot = null,
                batch = null,
                documentDate = DateTime.Now,
                actionTime = DateTime.Now,
                eventStatus = DocumentEventStatus.NEW,
                souWarehouseID = StaticValue.Warehouses.First(x => x.Code == "5005").ID,
                desWarehouseID = StaticValue.Warehouses.First(x => x.Code == "5005").ID

            };
            //Set Options
            var optionsNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(doc.options, OptionVOConst.OPT_COUNT_NUM, reqVO.count_num);
                optionsNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsNew, OptionVOConst.OPT_COMPANY, reqVO.company);

            doc.options = optionsNew;

            foreach (var count_h in reqVO.count_order_h)
            {

                    var sku = new ams_SKUMaster();
                    // Insert SKU 
                    sku = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_SKUMaster>(
                        new SQLConditionCriteria[] {
                            new SQLConditionCriteria("Code",count_h.Item, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                        }, this.BuVO).FirstOrDefault();

                    if (sku == null)
                        throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่พบสินค้า " + count_h.Item + " ในระบบ");

                var optionsItemNew = AMWUtil.Common.ObjectUtil.QryStrSetValue("", OptionVOConst.OPT_WH_LINE, count_h.wh_line);
                optionsItemNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsItemNew, OptionVOConst.OPT_SEQ_SERIAL, count_h.Seq_Serial);
                optionsItemNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsItemNew, OptionVOConst.OPT_LOC, count_h.Loc);
                optionsItemNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsItemNew, OptionVOConst.OPT_STOCK_INV, count_h.stock_inv);
                optionsItemNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsItemNew, OptionVOConst.OPT_INV_COUNTED, count_h.inv_counted);


                docItemsList.Add(new CreateADDocument.TReq.TItem
                    {
                        skuCode = sku.Code,
                        unitType = StaticValue.UnitTypes.FirstOrDefault(x => x.ID == sku.UnitType_ID).Code,
                        batch = null,
                        lot = count_h.Lot,
                        orderNo = null,
                        refID = count_h.serial,
                        ref1 = count_h.proj,
                        eventStatus = DocumentEventStatus.NEW,
                        options = optionsItemNew


                });
        
            }


            doc.docItems = docItemsList;
            var docGR = new CreateADDocument().Execute(Logger, this.BuVO, doc);

            var docRes = this.MapRespone(this.Logger, reqVO, docGR, this.BuVO);

            return docRes;

        }
        private TRes MapRespone(AMWLogger logger, TReq reqVO, amt_Document Doc, VOCriteria buVO)
        {
            var count_order_h = new List<TRes.header>();

            foreach (var count_h in reqVO.count_order_h)
            {

                count_order_h.Add(new TRes.header()
                {
                    wh_line = count_h.wh_line,
                    Item = count_h.Item,
                    Loc = count_h.Loc,
                    Lot = count_h.Lot,
                    Seq_Serial = count_h.Seq_Serial,
                    serial = count_h.serial,
                    proj = count_h.proj,
                    message = "Success",
                    status = "Success"

                });

            };


            var res = new TRes()
            {
                amw_refId = Doc.Code,
                count_num = reqVO.count_num,
                count_order = reqVO.count_order,
                warehouse = reqVO.warehouse,
                company = reqVO.company,
                count_order_h = count_order_h,
                status = "Success",
                message = "Success",
            };

            return res;

        }
    }
}
