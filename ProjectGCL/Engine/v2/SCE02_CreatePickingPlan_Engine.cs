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
    public class SCE02_CreatePickingPlan_Engine : AWMSEngine.Engine.BaseEngine<TREQ_Picking_Plan, TRES__return>
    {
        protected override TRES__return ExecuteEngine(TREQ_Picking_Plan reqVO)
        {
            //CREATE DOCUMENT Picking List
            List<amt_DocumentItem> docis = new List<amt_DocumentItem>();
            List<amt_Document> docs = new List<amt_Document>();
            reqVO.RECORD.LINE.ForEach(x =>
            {
                ExecDocument(x, docs, docis);
            });


            List<TDocItemGroup> doc_gps = docis
                .GroupBy(x => new {
                    doc_id = x.Document_ID,
                    lot = x.Lot,
                    sku = x.Code,
                    grade = x.Ref1,
                    ud_code = x.Ref3,
                    customer = x.Ref4,
                    wh_code = this.StaticValue.Warehouses.First(wh => wh.ID == docs.First(doc => doc.ID == x.Document_ID).Sou_Warehouse_ID).Code,
                    des_area_code = this.StaticValue.AreaMasters.First(ar => ar.ID == docs.First(doc => doc.ID == x.Document_ID).Des_AreaMaster_ID).Code
                })
                .Select(x => {
                    var res = new TDocItemGroup()
                    {
                        sku = x.Key.sku,
                        lot = x.Key.lot,
                        grade = x.Key.grade,
                        customer = x.Key.customer,
                        ud_code = x.Key.ud_code,
                        wh_code = x.Key.wh_code,
                        seq_group = x.Min(y => y.ID.Value),
                        des_area_code = x.Key.des_area_code,
                        priority = x.First().Options.QryStrGetValue("priority").Get2<int>(),
                        _sum_qty_pick = x.Sum(y => y.Quantity.Value),
                        doci_infos = x.Select(y => new TDocItemGroup.TDocItemInfo()
                        {
                            id = y.ID.Value,
                            _pick_qty = y.Quantity.Value,
                            loc_from = y.Options.QryStrGetValue("loc_from"),
                            wms_line = y.Options.QryStrGetValue("wms_line"),
                            wms_doc = docs.First(doc => doc.ID == y.Document_ID).Code
                        }).ToList()
                    };
                    return res;
                }).ToList();

            var pick_pallet_all = this.ProcessPickingList_andCreateWcsQueue(doc_gps);

            pick_pallet_all.ForEach(pallet =>
            {
                //WCS Post
                string doc_code = pallet._docis.First().doc_code;
                long doci_id = pallet._docis.First().doci_id;
                string remark = pallet._docis.Count == 1 ? "" : "MIX=" + pallet._docis.Select(x => x.doc_code).JoinString();

                ADO.WMSDB.WcsADO.GetInstant().SP_CREATE_DO_QUEUE(
                    doc_code, doc_code, doci_id, pallet._seq_group, pallet._priority,
                    pallet.ref4, pallet.psto_code, pallet.ref1, pallet.ref2, pallet.qty, pallet.unit, pallet.ref3, pallet.bsto_code,
                    pallet.wh_code, pallet._des_area_code, remark, this.BuVO);

                //CREATE DISTO
                pallet._docis.ForEach(doci =>
                {

                    //Clear Pick FullPallet
                    if (pallet.qty - pallet._qty_pick > 0)
                    {
                        doci.qty_pick += (pallet.qty - pallet._qty_pick);
                        pallet._qty_pick = pallet.qty;
                    }

                    //Update DISTO
                    amt_DocumentItemStorageObject disto = new amt_DocumentItemStorageObject()
                    {
                        DocumentItem_ID = doci.doci_id,
                        DocumentType_ID = DocumentTypeID.PICKING,
                        Sou_StorageObject_ID = pallet.psto_id,
                        Des_StorageObject_ID = pallet.psto_id,
                        IsLastSeq = true,
                        BaseQuantity = doci.qty_pick,
                        BaseUnitType_ID = pallet.unit_id,
                        Quantity = doci.qty_pick,
                        UnitType_ID = pallet.unit_id,
                        Status = EntityStatus.INACTIVE
                    };
                    DataADO.GetInstant().Insert<amt_DocumentItemStorageObject>(disto, this.BuVO);


                    var psto = StorageObjectADO.GetInstant().Get(pallet.psto_id, StorageObjectType.PACK, false, false, this.BuVO);
                    psto.eventStatus = StorageObjectEventStatus.PACK_PICKING;
                    //psto.options = psto.options.QryStrSetValue("qty_pick", doci.qty_pick);
                    StorageObjectADO.GetInstant().PutV2(psto, this.BuVO);
                    //StorageObjectADO.GetInstant().UpdateStatus(x.psto_id, null, null, StorageObjectEventStatus.PACK_PICKING, buVO);
                });
            });
            return new TRES__return();
        }
        private void ExecDocument(TREQ_Picking_Plan.TRecord.TLine req, List<amt_Document> out_docs, List<amt_DocumentItem> out_docis)
        {
            if (req.DOC_STATUS == "U")
                throw new Exception("คิวงานถูกจองแล้ว ไม่สามารถแก้ไขได้");
            if (req.DOC_STATUS == "C")
                throw new Exception("คิวงานถูกจองแล้ว สามารถยกเลิกคิวงานที่ระบบ WCS เท่านั้น");

            List<amt_DocumentItem> docis = new List<amt_DocumentItem>();
            req.API_REF = string.IsNullOrEmpty(req.API_REF) ? ObjectUtil.GenUniqID() : req.API_REF;
            foreach (var pick in req.PICK_DETAIL.GroupBy(x =>
                  new {
                      FROM_WH_ID = x.FROM_WH_ID,
                      TO_Location_Staging = x.TO_Location_Staging.Split(',')[0],
                  }))
            {
                var des_wh = StaticValueManager.GetInstant().Warehouses.FirstOrDefault(x => x.Name == pick.Key.FROM_WH_ID);
                var des_area = StaticValue.AreaMasters.FirstOrDefault(x => x.Name == pick.Key.TO_Location_Staging);

                amt_Document doc = New_Document(req, des_wh, des_area);
                out_docs.Add(doc);
                pick.ToList().ForEach(req_pl =>
                {
                    out_docis.Add(New_DocumnetItem(doc, req, req_pl));
                });
            }

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
                Code = "PK" + ADO.WMSDB.DataADO.GetInstant().NextNum("PK_DOC", false, BuVO).ToString("000000000"),
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
                Options = $"_is_from_ams={(req.IsFromAMS ? "AMS" : "SCE")}&pick_group={req.PICK_GROUP}&priority={req_pl.PRIORITY}" +
                $"&api_ref={req.API_REF}&wms_doc={req.WMS_DOC}&wms_line={req_pl.WMS_LINE}" +
                $"&loc_from={req_pl.FROM_LOCATION}&loc_stage={req_pl.TO_Location_Staging}",
                AuditStatus = AuditStatus.PASSED,
                EventStatus = DocumentEventStatus.NEW,
                Status = EntityStatus.ACTIVE
            };

            doci.ID = DataADO.GetInstant().Insert<amt_DocumentItem>(doci, this.BuVO);

            return doci;
        }

        private List<TPalletPicking> ProcessPickingList_andCreateWcsQueue(List<TDocItemGroup> doci_groups, bool is_select_full_only = true, List<TPalletPicking> parent_pick_pallet_all = null)
        {
            List<TDocItemGroup> doci_partial_groups = new List<TDocItemGroup>();
            List<TPalletPicking> pick_pallet_all = parent_pick_pallet_all ?? new List<TPalletPicking>();

            //group document item
            doci_groups.ForEach(doci_gp =>
            {
                //เลือกพาเลทที่ตรงตามเงื่อนไข ทั้งพาเลทเก่า(เคย process มาแล้ว) และใหม่
                List<TPalletPicking> process_pallets = SP_STO_PROCESS_FOR_SHUTTLE(doci_gp.wh_code, doci_gp.sku, doci_gp.lot, doci_gp.grade, null, doci_gp.ud_code, doci_gp.customer);
                var old_process_pallets = pick_pallet_all.Where(x => process_pallets.Any(y => y.psto_id == x.psto_id)).ToList();
                //process_pallets.RemoveAll(x => old_process_pallets.Any(y => y.psto_id == x.psto_id));
                //process_pallets.AddRange(old_process_pallets);
                old_process_pallets.ForEach(x =>
                {
                    int i = process_pallets.FindIndex(y => y.psto_id == x.psto_id);
                    if (i >= 0)
                        process_pallets[i] = x;
                });
                process_pallets.RemoveAll(x => x.qty - x._qty_pick <= 0);

                //คำนวนพาเลทที่ต้องใช้
                for (int i = 0, not_bay = -1;
                    doci_gp._sum_qty_pick > 0 && i < process_pallets.Count;
                    i++)
                {
                    if (process_pallets[i].bay != not_bay &&
                        (string.IsNullOrEmpty(doci_gp.ud_code) || process_pallets[i].ref3 == doci_gp.ud_code) &&    //UD 
                        (string.IsNullOrEmpty(doci_gp.customer) || process_pallets[i].ref4 == doci_gp.customer))      //CUSTOMER
                    {
                        var pick_pallet = process_pallets[i];
                        if ((is_select_full_only && pick_pallet._qty_pick == 0 && pick_pallet.qty <= doci_gp._sum_qty_pick) || //หยิบเต็มพาเลทเท่านั้น
                            (!is_select_full_only && (pick_pallet.qty - pick_pallet._qty_pick) > 0)) //หยิบพาเลทเศษด้วย
                        {
                            if (pick_pallet._docis == null)
                            {
                                pick_pallet._des_area_code = doci_gp.des_area_code;
                                pick_pallet._priority = doci_gp.priority;
                                pick_pallet._seq_group = doci_gp.seq_group;
                                pick_pallet._docis = new List<TPalletPicking.TDocItem>();
                            }

                            decimal _pallet_qty_pick = doci_gp._sum_qty_pick > (pick_pallet.qty - pick_pallet._qty_pick) ?
                                                                                        (pick_pallet.qty - pick_pallet._qty_pick) : //จำนวนคงเหลือในพาเลท หยิบทั้งหมด
                                                                                        doci_gp._sum_qty_pick; //หยิบตามจำนวนที่ประมวลผลได้
                            pick_pallet._qty_pick += _pallet_qty_pick;
                            //คำนวนว่าแต่ละ documnet item หยิบสินค้าไปเท่าไหร
                            foreach (var doci_info in doci_gp.doci_infos)
                            {
                                if (_pallet_qty_pick <= 0) break;
                                decimal _doci_qty_pick = doci_info._pick_qty >= _pallet_qty_pick ? _pallet_qty_pick : doci_info._pick_qty;
                                doci_info._pick_qty -= _doci_qty_pick;
                                doci_gp._sum_qty_pick -= _doci_qty_pick;
                                pick_pallet._docis.Add(new TPalletPicking.TDocItem()
                                {
                                    doci_id = doci_info.id,
                                    loc_from = doci_info.loc_from,
                                    wms_line = doci_info.wms_line,
                                    doc_code = doci_info.wms_doc,
                                    qty_pick = _doci_qty_pick
                                });
                                _pallet_qty_pick -= _doci_qty_pick;
                            }



                            //doci_gp._sum_qty_pick -= pick_pallet.qty;
                            if (!pick_pallet_all.Any(x => x == pick_pallet))
                                pick_pallet_all.Add(pick_pallet);//เลือกพาเลทได้ 1 พาเลท
                        }
                        else
                        {
                            break;
                        }
                    }
                    else
                    {
                        not_bay = process_pallets[i].bay;
                    }
                }



            });

            //ยังเบิกของไม่ครับตามรายการ
            if (doci_groups.Any(x => x._sum_qty_pick > 0))
            {
                //หยิบสินค้าได้ไม่ครบ และค้นหาในพาเลทเศษแล้ว
                if (!is_select_full_only)
                {
                    var ex_list = doci_groups.Where(x => x._sum_qty_pick > 0).Select(doci_gp => $"สินค้า {doci_gp.sku} lot {doci_gp.lot} มีจำนวนไม่เพียงพอ หรือมีพาเลทขวางกั้น {doci_gp._sum_qty_pick}KG").ToArray();
                    throw new Exception(string.Join(',', ex_list));
                }

                //หยิบสินค้าได้ไม่ครบ และยังไม่ได้ค้นหาในพาเลทเศษ ต้องการ process เพิ่มสำหรับพาเลทเศษ
                if (is_select_full_only)
                {
                    var doci_groups_partial =
                        doci_groups.OrderBy(x => x.seq_group)
                        .Where(x => x._sum_qty_pick > 0)
                        .GroupBy(x => new { sku = x.sku, grade = x.grade, lot = x.lot, ud_code = x.ud_code, customer = x.customer })
                        .Select(x =>
                        {
                            var res_doci_infos = new List<TDocItemGroup.TDocItemInfo>();
                            x.Select(doci_gp => doci_gp.doci_infos.Where(doci_info => doci_info._pick_qty > 0))
                            .ToList()
                            .ForEach(doci_infos =>
                            {
                                doci_infos.ToList().ForEach(doci_info =>
                                {
                                    res_doci_infos.Add(doci_info);
                                });
                            });


                            var res =
                            new TDocItemGroup()
                            {
                                sku = x.Key.sku,
                                grade = x.Key.grade,
                                lot = x.Key.lot,
                                ud_code = x.Key.ud_code,
                                customer = x.Key.customer,
                                des_area_code = x.First().des_area_code,
                                seq_group = x.First().seq_group,
                                priority = x.First().priority,
                                doci_infos = res_doci_infos,
                                _sum_qty_pick = res_doci_infos.Sum(y => y._pick_qty),
                            };
                            return res;
                        })
                        .ToList();
                    this.ProcessPickingList_andCreateWcsQueue(doci_groups_partial, false, pick_pallet_all);
                }
            }
            return pick_pallet_all;
        }


        private class TDocItemGroup
        {
            public List<TDocItemInfo> doci_infos;
            public class TDocItemInfo
            {
                public long id;
                public decimal _pick_qty;
                public string wms_line;
                public string wms_doc;
                public string loc_from;
            }
            public decimal _sum_qty_pick;
            public string wh_code;
            public string sku;
            public string lot;
            public string grade;
            public string ud_code;
            public string customer;

            public string des_area_code;
            public int priority;
            public long seq_group;
        }

        private class TPalletPicking
        {
            public long psto_id;
            public string psto_code;
            public int bank;
            public int bay;
            public int lv;
            public string wh_code;
            public string bsto_code;
            public string sku;
            public string lot;
            public string ref1;
            public string ref2;
            public string ref3;
            public string ref4;
            public string itemNo;
            public string options;
            public decimal qty;
            public string unit;
            public long unit_id;

            public List<TDocItem> _docis;
            public class TDocItem
            {
                public long doci_id;
                public decimal qty_pick;
                public string wms_line;
                public string doc_code;
                public string loc_from;
            }
            public string _des_area_code;
            public int _priority;
            public long _seq_group;
            public decimal _qty_pick;
        }

        private List<TPalletPicking> SP_STO_PROCESS_FOR_SHUTTLE(string wh_code, string sku, string lot, string ref1, string ref2, string ref3, string ref4)
        {
            Dapper.DynamicParameters datas = new Dapper.DynamicParameters();
            datas.Add("@wh_code", wh_code);
            datas.Add("@sku", sku);
            datas.Add("@lot", lot);
            datas.Add("@ref1", ref1);
            datas.Add("@ref2", ref2);
            datas.Add("@ref3", ref3);
            datas.Add("@ref4", ref4);
            return DataADO.GetInstant().QuerySP<TPalletPicking>("SP_STO_PROCESS_FOR_SHUTTLE", datas, this.BuVO);
        }
    }
}
