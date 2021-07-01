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
    public class SCE01_CreateReceivePlan_Engine : AWMSEngine.Engine.BaseEngine<TREQ_Recieve_Plan,TRES__return>
    {
        protected override TRES__return ExecuteEngine(TREQ_Recieve_Plan reqVO)
        {
            reqVO.RECORD.LINE.ForEach(x =>
            {
                exec(x);
            });

            return new TRES__return();
        }

        private TRES__return exec(TREQ_Recieve_Plan.TRecord.TLine req)
        {

            req.API_REF = string.IsNullOrEmpty(req.API_REF) ? ObjectUtil.GenUniqID() : req.API_REF;

            var des_wh = StaticValueManager.GetInstant().Warehouses.FirstOrDefault(x => x.Name == req.TO_WH_ID);
            var freeLocs = AreaADO.GetInstant().ListFreeBayLvNotBook(
                des_wh.ID.Value, 
                req.BookZone,
                req.Pallet_Detail.First().SKU,
                req.Pallet_Detail.First().LOT,
                req.Pallet_Detail.First().GRADE_Barcode,
                req.Pallet_Detail.First().UD_CODE,
                req.CUSTOMER_CODE,
                this.BuVO);

            List<SPGetFreeBayLvNotBook> bookLocs = new List<SPGetFreeBayLvNotBook>();
            int countPallet = req.BookCount > 0 ? req.BookCount : req.Pallet_Detail.Count;
            req.BookCount = countPallet;
            if (freeLocs.Sum(x => x.free_slot) < countPallet)
                throw new Exception($"พื้นที่จัดเก็บเหลือ '{freeLocs.Sum(x => x.free_slot)}' ไม่เพียงพอจัดเก็บพาเลท '{countPallet}'");
            while (countPallet > 0)
            {
                SPGetFreeBayLvNotBook loc = null;
                loc =
                    freeLocs.Where(x => x.free_slot >= countPallet)
                        .OrderBy(x => x.free_slot - countPallet)
                        .FirstOrDefault()//จำนวนพื้นที่เหลือ มากกว่า หรือ เท่ากับ พาเลทที่จะจัดเก็บ
                        ??
                    freeLocs.Where(x => x.free_slot < countPallet)
                        .OrderByDescending(x => x.free_slot)
                        .FirstOrDefault();//จำนวนพื้นที่เก็บได้เต็มพื้นที่

                freeLocs.Remove(loc);
                bookLocs.Add(loc);
                countPallet -= loc.free_slot;
            }

            bool isItemNew = false;
            amt_Document doc = New_Document(req, bookLocs);
            List<amt_DocumentItem> docis = new List<amt_DocumentItem>();
            req.Pallet_Detail.ForEach(req_pl =>
            {
                if (req_pl.PALLET_STATUS.ToUpper() == "N")
                {
                    isItemNew = true;
                    docis.Add(New_DocumnetItem(doc, req, req_pl));
                }
                else if (req_pl.PALLET_STATUS.ToUpper() == "U")
                    Update_DocumnetItem(doc, req, req_pl);
                else if (req_pl.PALLET_STATUS.ToUpper() == "C")
                    Cancel_DocumnetItem(doc, req, req_pl);
            });

            if (isItemNew)
            {
                var old_book = doc.Options.QryStrGetValue("_book_bay_lv").Split(",").ToList();
                var new_book = bookLocs.Select(x => x.bay_lv).ToList();
                new_book.RemoveAll(x => old_book.Any(y => y == x));

                if(new_book.Count > 0)
                {
                    new_book.AddRange(old_book);
                    doc.Options = doc.Options.QryStrSetValue("_book_bay_lv",string.Join(",", new_book.ToArray()));
                    DataADO.GetInstant().UpdateBy<amt_Document>(doc, BuVO);
                }
            }


            this.CallWCS_SP_CREATEBUWORK(doc, docis, "N");

            return new TRES__return()
            {
                API_REF = req.API_REF,
                Date_time = DateTime.Now,
            };

        }

        private amt_Document New_Document(TREQ_Recieve_Plan.TRecord.TLine req, List<SPGetFreeBayLvNotBook> bookLocs)
        {
            var doc = DataADO.GetInstant().SelectBy<amt_Document>(
                ListKeyValue<string, object>.New("Ref2", req.WMS_DOC).Add("Status", EntityStatus.ACTIVE),
                this.BuVO).FirstOrDefault();
            if (doc != null)
                if (doc.EventStatus != DocumentEventStatus.NEW) throw new Exception($"WMS_DOC '{doc.Ref2}' อยู่ระหว่างรับเข้า ไม่สามารถแก้ไขได้");
                else return doc;

            var des_wh = StaticValueManager.GetInstant().Warehouses.FirstOrDefault(x => x.Name == req.TO_WH_ID);
            if (des_wh == null) throw new Exception("TO_WH_ID ไม่ถูกต้อง");

            //var sou_area = StaticValueManager.GetInstant().AreaMasters.First(x => x.Code == "STCK");

            //var route_loc = AreaADO.GetInstant().ListDestinationArea(IOType.INBOUND, sou_area.ID.Value, des_wh.ID.Value, this.BuVO)
            //    .OrderByDescending(x => x.DefaultFlag).FirstOrDefault();
            //if (route_loc == null) throw new Exception("ไม่พบ Route Area ปลายทาง");
            //if (route_loc.Des_AreaLocationMaster_ID == null) throw new Exception("ไม่พบ Route Area ปลายทาง ไม่ได้ตั้งค่า Location");

            doc = new amt_Document()
            {
                Code = "PA" + ADO.WMSDB.DataADO.GetInstant().NextNum("PA_DOC", false, BuVO).ToString("000000000"),
                DocumentType_ID = DocumentTypeID.PUTAWAY,
                DocumentProcessType_ID = DocumentProcessTypeID.FG_TRANSFER_WM,
                ActionTime = req.API_DATE_TIME,
                DocumentDate = DateTime.Now,

                Sou_Warehouse_ID = null,
                Sou_AreaMaster_ID = null,
                Sou_AreaLocationMaster_ID = null,

                Des_Warehouse_ID = des_wh.ID,
                Des_AreaMaster_ID = null,
                Des_AreaLocationMaster_ID = null,

                Ref1 = req.API_REF,
                Ref2 = req.WMS_DOC,
                Options = "_is_from_ams=" + (req.IsFromAMS ? "AMS" : "SCE") + "&_total_pallet="+req.BookCount + "&_book_bay_lv=" + string.Join(',', bookLocs.Select(x => x.bay_lv).ToArray())
                 + "&_book_locations=" + string.Join(',', bookLocs.Select(x => x.name).ToArray()),

                EventStatus = DocumentEventStatus.NEW,
                Status = EntityStatus.ACTIVE


            };
            doc.ID = ADO.WMSDB.DataADO.GetInstant().Insert<amt_Document>(doc, this.BuVO);

            return doc;
        }

        private amt_DocumentItem New_DocumnetItem(amt_Document doc, TREQ_Recieve_Plan.TRecord.TLine req, TREQ_Recieve_Plan.TRecord.TLine.TPallet_Detail req_pl)
        {
            var sku = ADO.WMSDB.MasterADO.GetInstant().GetSKUMasterByCode(req_pl.SKU, this.BuVO);
            var unit = StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(x => x.Code == req_pl.UNIT);
            var pack = ADO.WMSDB.MasterADO.GetInstant().GetPackMasterBySKU(sku.ID.Value, req_pl.UNIT, this.BuVO);
            var wh = this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == doc.Des_Warehouse_ID);
            var area = this.StaticValue.AreaMasters.FirstOrDefault(x =>
                        x.Name == (string.IsNullOrEmpty(req_pl.TO_LOCATION) ? wh.Code.Last() + "STO" : req_pl.TO_LOCATION) && x.Warehouse_ID == doc.Des_Warehouse_ID);
            
            var doci = new amt_DocumentItem()
            {
                Document_ID = doc.ID.Value,
                ItemNo = req_pl.PALLET_NO,
                Code = req_pl.SKU,
                SKUMaster_ID = sku.ID,
                PackMaster_ID = pack.ID,
                Lot = req_pl.LOT_Barcode,
                BaseQuantity = req_pl.QTY_Pallet,
                BaseUnitType_ID = unit.ID,
                Quantity = req_pl.QTY_Pallet,
                UnitType_ID = unit.ID,
                ProductionDate = req_pl.MFG,
                ExpireDate = req_pl.EXP,
                //LocationCode = doc.Options.QryStrGetValue("_book_bay_lv"),
                Ref1 = req_pl.GRADE_Barcode,
                Ref2 = req_pl.NO_Barcode,
                Ref3 = req_pl.UD_CODE,
                Ref4 = req.CUSTOMER_CODE,
                Options = $"_is_from_ams={(req.IsFromAMS ? "AMS" : "SCE")}&sap_lot={req_pl.LOT}&to_area={area.Code}&to_location={req_pl.TO_LOCATION}&api_ref={req.API_REF}&wms_doc={req.WMS_DOC}&to_wh_id={req.TO_WH_ID}",
                AuditStatus = AuditStatus.PASSED,
                EventStatus = DocumentEventStatus.NEW,
                Status = EntityStatus.ACTIVE
            };

            doci.ID = DataADO.GetInstant().Insert<amt_DocumentItem>(doci, this.BuVO);

            return doci;
        }
       
        private amt_DocumentItem Update_DocumnetItem(amt_Document doc, TREQ_Recieve_Plan.TRecord.TLine req, TREQ_Recieve_Plan.TRecord.TLine.TPallet_Detail req_pl)
        {
            var _doci = DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                ListKeyValue<string, object>.New("Document_ID", doc.ID).Add("ItemNo", req_pl.PALLET_NO).Add("Status", EntityStatus.ACTIVE),
                this.BuVO).FirstOrDefault();
            if (_doci == null) throw new Exception($"ไม่พบพาเลท '{_doci.ItemNo}' ที่ต้องการแก้ไข");

            var sku = ADO.WMSDB.MasterADO.GetInstant().GetSKUMasterByCode(req_pl.SKU, this.BuVO);
            var unit = StaticValueManager.GetInstant().UnitTypes.FirstOrDefault(x => x.Code == req_pl.UNIT);
            var pack = ADO.WMSDB.MasterADO.GetInstant().GetPackMasterBySKU(sku.ID.Value, req_pl.UNIT, this.BuVO);
            var wh = this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == doc.Des_Warehouse_ID);
            var area = this.StaticValue.AreaMasters.FirstOrDefault(x =>
                        x.Name == (string.IsNullOrEmpty(req_pl.TO_LOCATION) ? wh.Code.Last() + "STO" : req_pl.TO_LOCATION) && x.Warehouse_ID == doc.Des_Warehouse_ID);
            var doci = new amt_DocumentItem()
            {
                ID = _doci.ID.Value,
                Document_ID = doc.ID.Value,
                ItemNo = req_pl.PALLET_NO,
                Code = req_pl.SKU,
                SKUMaster_ID = sku.ID,
                PackMaster_ID = pack.ID,
                Lot = req_pl.LOT_Barcode,
                BaseQuantity = req_pl.QTY_Pallet,
                BaseUnitType_ID = unit.ID,
                Quantity = req_pl.QTY_Pallet,
                UnitType_ID = unit.ID,
                ProductionDate = req_pl.MFG,
                ExpireDate = req_pl.EXP,
                //LocationCode = doc.Options.QryStrGetValue("_book_bay_lv"),
                Ref1 = req_pl.GRADE_Barcode,
                Ref2 = req_pl.NO_Barcode,
                Ref3 = req_pl.UD_CODE,
                Ref4 = req.CUSTOMER_CODE,
                Options = $"_is_from_ams={(req.IsFromAMS ? "AMS" : "SCE")}&sap_lot={req_pl.LOT}&to_area={area.Code}&to_location={req_pl.TO_LOCATION}&api_ref={req.API_REF}&wms_doc={req.WMS_DOC}&to_wh_id={req.TO_WH_ID}",
                AuditStatus = AuditStatus.PASSED,
                EventStatus = _doci.EventStatus,
                Status = _doci.Status
            };

            DataADO.GetInstant().UpdateBy<amt_DocumentItem>(doci, this.BuVO);
            return doci;
        }
       
        private amt_DocumentItem Cancel_DocumnetItem(amt_Document doc, TREQ_Recieve_Plan.TRecord.TLine req, TREQ_Recieve_Plan.TRecord.TLine.TPallet_Detail req_pl)
        {
            var _doci = DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                ListKeyValue<string, object>.New("Document_ID", doc.ID).Add("ItemNo", req_pl.PALLET_NO).Add("Status", EntityStatus.ACTIVE),
                this.BuVO).FirstOrDefault();
            if (_doci == null) throw new Exception($"ไม่พบพาเลท '{_doci.ItemNo}' ที่ต้องการแก้ไข");
            _doci.EventStatus = DocumentEventStatus.REJECTED;
            _doci.Status = EntityStatus.REMOVE;
            DataADO.GetInstant().UpdateBy<amt_DocumentItem>(_doci, this.BuVO);

            return _doci;
        }

        private void CallWCS_SP_CREATEBUWORK(amt_Document doc, List<amt_DocumentItem> docis, string Pallet_Status)
        {
            var unit = StaticValueManager.GetInstant().UnitTypes.First(x => x.ID == docis.First().UnitType_ID);
            var des_wh = StaticValueManager.GetInstant().Warehouses.First(x => x.ID == doc.Des_Warehouse_ID);
            //var des_area = DataADO.GetInstant().SelectByID<ams_AreaMaster>(doc.Des_AreaMaster_ID, this.BuVO);
            var bay_level_keep = doc.Options.QryStrGetValue("_book_bay_lv").Replace(',', ':') + ":";

            if (Pallet_Status.In("N"))
            {
                docis.ForEach(doci =>
                {
                    WcsADO.GetInstant().SP_CREATEBUWORK(doci.ID.Value,doc.Code, doc.Code, doci.Ref3, doci.Code, doci.Ref1, doci.Lot,
                        doci.Quantity.Value, unit.Code, doci.Ref3.ToString(), doci.Quantity.Value,
                        doci.Ref2.Get2<int>(), doci.Ref2.Get2<int>(),
                        des_wh.Code, doci.Options.QryStrGetValue("to_area"), des_wh.Code.Last()+".1", "",bay_level_keep, this.BuVO);
                });
            }
        }

    }
}
