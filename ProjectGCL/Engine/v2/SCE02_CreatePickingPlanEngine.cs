using ADO.WMSDB;
using ADO.WMSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria.SP.Response;
using AMSModel.Entity;
using AMWUtil.Common;
using ProjectGCL.GCLModel.Criterie;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.Engine.v2
{
    public class SCE02_CreatePickingPlanEngine : AWMSEngine.Engine.BaseEngine<TREQ_Picking_Plan,TRES__return>
    {
        protected override TRES__return ExecuteEngine(TREQ_Picking_Plan reqVO)
        {
            reqVO.RECORD.LINE.ForEach(x =>
            {
                exec(x);
            });

            return new TRES__return();
        }
        private TRES__return exec(TREQ_Picking_Plan.TRecord.TLine req)
        {
            if (req.DOC_STATUS == "U")
                throw new Exception("คิวงานถูกจองแล้ว ไม่สามารถแก้ไขได้");
            if (req.DOC_STATUS == "C")
                throw new Exception("คิวงานถูกจองแล้ว สามารถยกเลิกคิวงานที่ระบบ WCS เท่านั้น");

            List<amt_DocumentItem> docis = new List<amt_DocumentItem>();
            req.API_REF = string.IsNullOrEmpty(req.API_REF) ? ObjectUtil.GenUniqID() : req.API_REF;
            foreach (var pick in req.PICK_DETAIL.GroupBy(x =>
                  new{
                      FROM_WH_ID = x.FROM_WH_ID,
                      TO_Location_Staging = x.TO_Location_Staging.Split(',')[0],
                  }))
            {
                var des_wh = StaticValueManager.GetInstant().Warehouses.FirstOrDefault(x => x.Name == pick.Key.FROM_WH_ID);
                var des_area = StaticValue.AreaMasters.FirstOrDefault(x => x.Name == pick.Key.TO_Location_Staging);

                amt_Document doc = New_Document(req, des_wh, des_area);
                pick.ToList().ForEach(req_pl =>
                {
                    docis.Add(New_DocumnetItem(doc, req, req_pl));
                });
            }


            return new TRES__return()
            {
                API_REF = req.API_REF,
                Date_time = DateTime.Now,
            };

        }

        private amt_Document New_Document(TREQ_Picking_Plan.TRecord.TLine req, ams_Warehouse wh, ams_AreaMaster area)
        {
            var doc = DataADO.GetInstant().SelectBy<amt_Document>(
                ListKeyValue<string, object>.New("Ref2", req.WMS_DOC).Add("Status", EntityStatus.ACTIVE),
                this.BuVO).FirstOrDefault();
            if (doc != null)
                if (doc.EventStatus != DocumentEventStatus.NEW) throw new Exception($"WMS_DOC '{doc.Ref2}' อยู่ระหว่างรับเข้า ไม่สามารถแก้ไขได้");
                else return doc;

            doc = new amt_Document()
            {
                DocumentType_ID = DocumentTypeID.PICKING,
                DocumentProcessType_ID = DocumentProcessTypeID.FG_TRANSFER_WM,
                ActionTime = req.API_DATE_TIME,
                DocumentDate = DateTime.Now,

                Sou_Warehouse_ID = wh.ID,
                Sou_AreaMaster_ID = null,
                Sou_AreaLocationMaster_ID = null,

                Des_Warehouse_ID = wh.ID,
                Des_AreaMaster_ID = area.ID,
                Des_AreaLocationMaster_ID = null,

                Ref1 = req.API_REF,
                Ref2 = req.WMS_DOC,
                Ref4 = req.CUSTOMER_CODE,
                Options = $"_is_from_ams={(req.IsFromAMS ? "AMS" : "SCE")}&active_type={req.ACTIVIT_YTYPE}&wh_id={wh.Name}",

                EventStatus = DocumentEventStatus.NEW,
                Status = EntityStatus.ACTIVE

            };
            doc.ID = ADO.WMSDB.DataADO.GetInstant().Insert<amt_Document>(doc, this.BuVO);

            return doc;
        }

        private amt_DocumentItem New_DocumnetItem(amt_Document doc, TREQ_Picking_Plan.TRecord.TLine req, TREQ_Picking_Plan.TRecord.TLine.TPICK_DETAIL req_pl)
        {
            var sku = ADO.WMSDB.MasterADO.GetInstant().GetSKUMasterByCode(req_pl.SKU, this.BuVO);
            var unit = StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(x => x.Code == req_pl.UNIT);
            var pack = ADO.WMSDB.MasterADO.GetInstant().GetPackMasterBySKU(sku.ID.Value, req_pl.UNIT, this.BuVO);
            var doci = new amt_DocumentItem()
            {
                Document_ID = doc.ID.Value,
                ItemNo = null,
                Code = req_pl.SKU,
                SKUMaster_ID = sku.ID,
                PackMaster_ID = pack.ID,
                Lot = req_pl.LOT,
                BaseQuantity = req_pl.QTY,
                BaseUnitType_ID = unit.ID,
                Quantity = req_pl.QTY,
                UnitType_ID = unit.ID,
                ProductionDate = null,
                ExpireDate = null,
                //LocationCode = doc.Options.QryStrGetValue("_book_bay_lv"),
                Ref1 = null,
                Ref2 = null,
                Ref3 = req_pl.UD_CODE,
                Ref4 = req.CUSTOMER_CODE,
                Options = $"_is_from_ams={(req.IsFromAMS ? "AMS" : "SCE")}&pick_group={req.PICK_GROUP}&priority={req_pl.PRIORITY}"+
                $"&api_ref={req.API_REF}&wms_doc={req.WMS_DOC}&wms_line={req_pl.WMS_LINE}" +
                $"&loc_from={req_pl.FROM_LOCATION}&loc_stag={req_pl.TO_Location_Staging}",
                AuditStatus = AuditStatus.PASSED,
                EventStatus = DocumentEventStatus.NEW,
                Status = EntityStatus.ACTIVE
            };

            doci.ID = DataADO.GetInstant().Insert<amt_DocumentItem>(doci, this.BuVO);

            return doci;
        }

    }
}
