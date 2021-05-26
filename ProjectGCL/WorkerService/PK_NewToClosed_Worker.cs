using ADO.WMSDB;
using ADO.WMSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.Logger;
using AWMSEngine.HubService;
using Microsoft.AspNetCore.SignalR;
using ProjectGCL.ADOGCL;
using ProjectGCL.GCLModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.WorkerService
{
    public class PK_NewToClosed_Worker : AWMSEngine.WorkerService.BaseWorkerService
    {
        public PK_NewToClosed_Worker(long workerServiceID, AMWLogger logger, IHubContext<CommonMessageHub> commonHub) : base(workerServiceID, logger, commonHub)
        {
        }

        protected override void ExecuteEngine(Dictionary<string, string> options, VOCriteria buVO)
        {
            this.NewToWorking(buVO);

            this.WorkingToClosed(buVO);
        }

        private void NewToWorking(VOCriteria buVO)
        {
            var docs =
                DataADO.GetInstant().SelectBy<amt_Document>(
                    ListKeyValue<string, object>
                        .New("DocumentType_ID", DocumentTypeID.PICKING)
                        .Add("EventStatus", DocumentEventStatus.NEW)
                        .Add("Status", EntityStatus.ACTIVE), buVO).ToList();
            if (docs.Count == 0) return;


            docs.ForEach(doc =>
            {
                buVO.SqlTransaction_Begin();

                var docis =
                DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                    ListKeyValue<string, object>
                        .New("Document_ID", doc.ID)
                        .Add("EventStatus", DocumentEventStatus.NEW)
                        .Add("Status", EntityStatus.ACTIVE), buVO).ToList();


                List<TRES_SP> select_pallet_alls = new List<TRES_SP>();

                docis.ForEach(doci =>
                {
                    List<TRES_SP> pallets = SP_STO_PROCESS_FOR_SHUTTLE(doci.Code, doci.Lot, doc.Ref1, doc.Ref2, null, null, buVO);
                    pallets.RemoveAll(x => select_pallet_alls.Any(y => y.psto_id == x.psto_id));

                    decimal pick_qty = doci.Quantity.Value;
                    List<TRES_SP> select_pallets = new List<TRES_SP>();
                    for (int i = 0, not_bay = -1;
                    pick_qty > 0 && i<pallets.Count;
                    i++)
                    {

                        if(pallets[i].ref3 == doci.Ref3 && pallets[i].ref4 == doci.Ref4)
                        {
                            if (pallets[0].bay != not_bay)
                            {
                                pallets[i].wms_line = doci.Options.QryStrGetValue("wms_line");
                                pallets[i].loc_from = doci.Options.QryStrGetValue("loc_from");
                                pallets[i].loc_stag = doci.Options.QryStrGetValue("loc_stag");
                                pallets[i].qty_pick = pick_qty > pallets[i].qty ? pallets[i].qty : pick_qty;
                                pallets[i].doci_id = doci.ID.Value;

                                pick_qty -= pallets[i].qty;
                                select_pallets.Add(pallets[i]);
                            }
                        }
                        else
                        {
                            not_bay = pallets[i].bay;
                        }
                    }


                    if (pick_qty > 0)
                        throw new Exception($"สินค้า {doci.Code} lot {doci.Lot} มีจำนวนไม่เพียงพอ หรือมีพาเลทขวางกั้น {pick_qty}KG");

                    select_pallets.ForEach(x =>
                    {
                        ADO.WMSDB.DocumentADO.GetInstant().CreateDocItemSto(
                            doci.ID.Value, x.psto_id, x.qty, doci.UnitType_ID.Value, x.qty, doci.UnitType_ID.Value, buVO);
                        var psto = StorageObjectADO.GetInstant().Get(x.psto_id, StorageObjectType.PACK, false, false, buVO);
                        psto.eventStatus = StorageObjectEventStatus.PACK_PICKING;
                        psto.options = psto.options.QryStrSetValue("qty_pick", x.qty_pick);
                        StorageObjectADO.GetInstant().PutV2(psto, buVO);
                        //StorageObjectADO.GetInstant().UpdateStatus(x.psto_id, null, null, StorageObjectEventStatus.PACK_PICKING, buVO);
                    });

                    select_pallet_alls.AddRange(select_pallets);
                });

                DataADO.GetInstant().UpdateBy<amt_Document>(
                    ListKeyValue<string, object>.New("ID", doc.ID).Add("Status", EntityStatus.ACTIVE),
                    ListKeyValue<string, object>.New("EventStatus", DocumentEventStatus.WORKING)
                        , buVO);

                DataADO.GetInstant().UpdateBy<amt_DocumentItem>(
                    ListKeyValue<string, object>.New("Document_ID", doc.ID).Add("Status", EntityStatus.ACTIVE),
                    ListKeyValue<string, object>.New("EventStatus", DocumentEventStatus.WORKING)
                        , buVO);


                var wh = StaticValueManager.GetInstant().Warehouses.FirstOrDefault(x => x.ID == doc.Des_Warehouse_ID);
                var area = StaticValueManager.GetInstant().AreaMasters.FirstOrDefault(x => x.ID == doc.Des_AreaMaster_ID);

                var _LINE = new List<GCLModel.Criterie.TREQ_Allocated_LPN.TRecord.TLine>();
                select_pallet_alls.ForEach(pl =>
                {
                    //TODO Create DO
                    //ADO.WMSDB.WcsADO.GetInstant().SP_CREATEBUWORK(pl.doci_id.ToString(), doc.Code, pl.ref4, pl.sku, pl.ref1, pl.lot,
                    //    pl.qty, pl.unit, pl.ref3, pl.qty, 0, 0, wh.Code, area.Code, "1", "", buVO);

                    _LINE.Add(new GCLModel.Criterie.TREQ_Allocated_LPN.TRecord.TLine()
                    {
                        API_Date_Time = DateTime.Now,
                        API_REF = doc.Options.QryStrGetValue("api_ref"),
                        WMS_DOC = doc.Options.QryStrGetValue("wms_doc"),
                        WH_ID = doc.Options.QryStrGetValue("wh_id"),
                        CUSTOEMR_CODE = doc.Ref4,
                        WMS_LINE = pl.wms_line,
                        LOCATION_FROM = pl.loc_from,
                        Location_Staging = pl.loc_stag,

                        Pallet_Detail = new List<GCLModel.Criterie.TREQ_Allocated_LPN.TRecord.TLine.TPallet_Detail>()
                        {
                            new GCLModel.Criterie.TREQ_Allocated_LPN.TRecord.TLine.TPallet_Detail()
                            {
                                LOT = pl.lot,
                                PALLET_NO = pl.itemNo,
                                QTY_Pallet = pl.qty,
                                QTY_Pick = pl.qty_pick,
                                UNIT = pl.unit,
                                SKU = pl.sku
                            }
                        }
                    });
                });

                buVO.SqlTransaction_Commit();

                SceAPI.GetInstant().Allocated_LPN(new GCLModel.Criterie.TREQ_Allocated_LPN()
                {
                    RECORD = new GCLModel.Criterie.TREQ_Allocated_LPN.TRecord()
                    {
                        LINE = _LINE
                    }
                }, buVO);
            });

        }

        private void WorkingToClosed(VOCriteria buVO)
        {
            var wcsWq = DataADO.GetInstant().SelectBy<amt_Wcs_WQ_Done>(
                ListKeyValue<string, object>.New("status", EntityStatus.ACTIVE).Add("DocumentType_ID", DocumentTypeID.PICKING),
                buVO)
                .ToList();

            if (wcsWq.Count == 0) return;
            buVO.SqlTransaction_Begin();

            List<StorageObjectCriteria> psto_picks = new List<StorageObjectCriteria>();
            List<long> docIDs = new List<long>();
            List<long> docItemIDs = new List<long>();
            wcsWq.ForEach(wq =>
            {
                var baseMst =
                    DataADO.GetInstant().SelectBy<ams_BaseMaster>(ListKeyValue<string, object>.New("code", wq.BaseCode).Add("status", EntityStatus.ACTIVE), buVO)
                    .FirstOrDefault();
                var bsto = StorageObjectADO.GetInstant().Get(baseMst.ID.Value, StorageObjectType.BASE, false, true, buVO);

                var doci = DataADO.GetInstant().SelectByID<amt_DocumentItem>(wq.WmsRefID, buVO);
                var doc = DataADO.GetInstant().SelectByID<amt_Document>(doci.Document_ID, buVO);

                docIDs.Add(doc.ID.Value);
                docItemIDs.Add(doci.ID.Value);


                DataADO.GetInstant().UpdateBy<amt_DocumentItemStorageObject>(
                    ListKeyValue<string, object>.New("DocumentItem_ID", doci.ID.Value).Add("StorageObject_ID", bsto.mapstos.First().id.Value),
                    ListKeyValue<string, object>.New("Status", EntityStatus.DONE).Add("Des_StorageObject_ID", bsto.mapstos.First().id.Value), buVO);
                bsto.areaID = doc.Des_AreaMaster_ID;
                bsto.parentType = null;
                bsto.parentType = null;
                bsto.eventStatus = StorageObjectEventStatus.BASE_DONE;
                var psto = bsto.mapstos.First();
                psto.eventStatus = StorageObjectEventStatus.PACK_PICKED;
                StorageObjectADO.GetInstant().PutV2(bsto, buVO);
                StorageObjectADO.GetInstant().PutV2(psto, buVO);
                //StorageObjectADO.GetInstant().UpdateStatusToChild(bsto.id.Value,null, EntityStatus.ACTIVE, StorageObjectEventStatus.PACK_PICKED, buVO);


                if (doc.Options.QryStrGetValue("_is_from_ams") == "SCE")
                {
                    SceAPI.GetInstant().Picking_Confirm(new GCLModel.Criterie.TREQ_Picking_Confirm()
                    {
                        RECORD = new GCLModel.Criterie.TREQ_Picking_Confirm.TRecord()
                        {
                            LINE = new List<GCLModel.Criterie.TREQ_Picking_Confirm.TRecord.TLine>()
                            {
                                new GCLModel.Criterie.TREQ_Picking_Confirm.TRecord.TLine()
                                {
                                    API_REF = doc.Ref1,
                                    ACTIVITY_TYPE = doc.Options.QryStrGetValue("active_type"),
                                    API_Date_Time = DateTime.Now,
                                    CUSTOEMR_CODE = doc.Ref4,
                                    LOCATION_FROM = doci.Options.QryStrGetValue("loc_from"),
                                    Location_Staging = doci.Options.QryStrGetValue("loc_stag"),
                                    WH_ID = doc.Options.QryStrGetValue("wh_id"),
                                    WMS_DOC = doc.Ref2,
                                    WMS_LINE = doc.Options.QryStrGetValue("wms_line"),
                                    Pallet_Detail = new List<GCLModel.Criterie.TREQ_Picking_Confirm.TRecord.TLine.TPallet_Detail>()
                                    {
                                        new GCLModel.Criterie.TREQ_Picking_Confirm.TRecord.TLine.TPallet_Detail()
                                        {
                                            LOT = psto.lot,
                                            PALLET_NO = psto.itemNo,
                                            QTY_Pallet = psto.qty,
                                            QTY_Pick = psto.options.QryStrGetValue("qty_pick").Get2<decimal>(),
                                            SKU = psto.code,
                                            UNIT = psto.unitCode
                                        }
                                    }
                                }
                            }
                        }
                    }, buVO);
                }

            });

            //ตรวจสอบเพื่อปิด DocItem
            docItemIDs = docItemIDs.Distinct().ToList();
            docItemIDs.ForEach(doci_id =>
            {
                var disto_count =
                    ADO.WMSDB.DataADO.GetInstant().CountBy<amt_DocumentItemStorageObject>(
                    new SQLConditionCriteria[]
                    {
                    new SQLConditionCriteria("DocumentItem_ID",doci_id, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("status",EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS),
                    new SQLConditionCriteria("status",EntityStatus.DONE, SQLOperatorType.NOTEQUALS),
                    }, buVO);

                //disto ทั้งหมดขอ DocItem นี้รับเข้าหมดแล้ว / DocItem Worked
                if (disto_count == 0)
                {
                    DataADO.GetInstant().UpdateBy<amt_DocumentItem>(
                      ListKeyValue<string, object>.New("ID", doci_id),
                      ListKeyValue<string, object>.New("Status", EntityStatus.DONE).Add("EventStatus", DocumentEventStatus.CLOSED), buVO);
                }
            });

            //ตรวจสอบเพื่อปิด Doc
            docIDs = docIDs.Distinct().ToList();
            docIDs.ForEach(doc_id =>
            {
                var doci_count =
                    ADO.WMSDB.DataADO.GetInstant().CountBy<amt_DocumentItem>(
                    new SQLConditionCriteria[]
                    {
                    new SQLConditionCriteria("Document_ID",doc_id, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("status",EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS),
                    new SQLConditionCriteria("status",EntityStatus.DONE, SQLOperatorType.NOTEQUALS),
                    }, buVO);

                //disto ทั้งหมดขอ DocItem นี้รับเข้าหมดแล้ว / DocItem Worked
                if (doci_count == 0)
                {
                    DataADO.GetInstant().UpdateBy<amt_Document>(
                      ListKeyValue<string, object>.New("ID", doc_id),
                      ListKeyValue<string, object>.New("Status", EntityStatus.DONE).Add("EventStatus", DocumentEventStatus.CLOSED), buVO);
                }
            });
            buVO.SqlTransaction_Commit();

        }


        private class TRES_SP
        {
            public long psto_id;
            public int bank;
            public int bay;
            public int lv;
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

            public long doci_id;
            public decimal qty_pick;
            public string wms_line;
            public string loc_from;
            public string loc_stag;
        }
        private List<TRES_SP> SP_STO_PROCESS_FOR_SHUTTLE(string sku,string lot,string ref1,string ref2,string ref3,string ref4,VOCriteria buVO)
        {
            Dapper.DynamicParameters datas = new Dapper.DynamicParameters();
            datas.Add("@sku", sku);
            datas.Add("@lot", lot);
            datas.Add("@ref1", ref1);
            datas.Add("@ref2", ref2);
            datas.Add("@ref3", ref3);
            datas.Add("@ref4", ref4);
            return DataADO.GetInstant().QuerySP<TRES_SP>("SP_STO_PROCESS_FOR_SHUTTLE", datas, buVO);
        }
    }
}
