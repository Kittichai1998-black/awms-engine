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
            this.NewToWorking_SendSceAllocate_SendWcsQueue(buVO);

            this.WorkingToWorked_WcsQueue(buVO);

            this.WorkedToClosed_SendSCE(buVO);
        }

        private void NewToWorking_SendSceAllocate_SendWcsQueue(VOCriteria buVO)
        {
            var docs =
                DataADO.GetInstant().SelectBy<amt_Document>(
                    ListKeyValue<string, object>
                        .New("DocumentType_ID", DocumentTypeID.PICKING)
                        .Add("EventStatus", DocumentEventStatus.NEW)
                        .Add("Status", EntityStatus.ACTIVE), new VOCriteria()).ToList();
            if (docs.Count == 0) return;


            docs.ForEach(doc =>
            {
                try
                {
                    buVO.SqlTransaction_Begin();

                    var docis =
                    DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                        ListKeyValue<string, object>
                            .New("Document_ID", doc.ID)
                            .Add("EventStatus", DocumentEventStatus.NEW)
                            .Add("Status", EntityStatus.ACTIVE), buVO).ToList();


                    List<TRES_SP> select_pallet_alls = new List<TRES_SP>();
                    //group document item
                    docis.ForEach(doci =>
                    {
                        List<TRES_SP> pallets = SP_STO_PROCESS_FOR_SHUTTLE(doci.Code, doci.Lot, doci.Ref1, doci.Ref2, doci.Ref3, doci.Ref4, buVO);
                        pallets.RemoveAll(x => select_pallet_alls.Any(y => y.psto_id == x.psto_id));

                        decimal pick_qty = doci.Quantity.Value;
                        List<TRES_SP> select_pallets = new List<TRES_SP>();
                        for (int i = 0, not_bay = -1;
                        pick_qty > 0 && i < pallets.Count;
                        i++)
                        {

                            if (pallets[i].ref3 == doci.Ref3 && (pallets[i].ref4 == doci.Ref4 || string.IsNullOrEmpty(doci.Ref4)))
                            {
                                if (pallets[0].bay != not_bay)
                                {
                                    pallets[i]._wms_line = doci.Options.QryStrGetValue("wms_line");
                                    pallets[i]._loc_from = doci.Options.QryStrGetValue("loc_from");
                                    pallets[i]._loc_stage = doci.Options.QryStrGetValue("loc_stag");
                                    pallets[i]._qty_pick = pick_qty > pallets[i].qty ? pallets[i].qty : pick_qty;
                                    pallets[i]._doci_id = doci.ID.Value;
                                    pallets[i]._priority = doci.Options.QryStrGetValue("priority").Get2<int>();
                                    long _seq_group = 0;
                                    if (doci.Options.QryStrContainsKey("pick_group") && doci.Options.QryStrGetValue("pick_group") != "")
                                    {
                                        string str_pick_group = doci.Options.QryStrGetValue("pick_group").Trim();
                                        long.TryParse(str_pick_group, out _seq_group);
                                    }
                                    if (_seq_group != 0)
                                        _seq_group = (doci.ID.Value * 10000) + (_seq_group % 10000);
                                    else
                                        _seq_group = doci.ID.Value * 10000;
                                    pallets[i]._seq_group = _seq_group;

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

                        select_pallets.ForEach(select_pl =>
                        {
                            //CREATE DISTO
                            {
                                amt_DocumentItemStorageObject disto = new amt_DocumentItemStorageObject()
                                {
                                    DocumentItem_ID = doci.ID.Value,
                                    DocumentType_ID = doc.DocumentType_ID,
                                    Sou_StorageObject_ID = select_pl.psto_id,
                                    Des_StorageObject_ID = select_pl.psto_id,
                                    IsLastSeq = true,
                                    BaseQuantity = select_pl.qty,
                                    BaseUnitType_ID = select_pl.unit_id,
                                    Quantity = select_pl.qty,
                                    UnitType_ID = select_pl.unit_id,
                                    Status = EntityStatus.INACTIVE
                                };
                                DataADO.GetInstant().Insert<amt_DocumentItemStorageObject>(disto, buVO);
                            }

                            var psto = StorageObjectADO.GetInstant().Get(select_pl.psto_id, StorageObjectType.PACK, false, false, buVO);
                            psto.eventStatus = StorageObjectEventStatus.PACK_PICKING;
                            psto.options = psto.options.QryStrSetValue("qty_pick", select_pl._qty_pick);
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

                    //SEND WCS PICKING
                    {
                        select_pallet_alls.ForEach(pl =>
                        {
                            //TODO
                            ADO.WMSDB.WcsADO.GetInstant().SP_CREATE_DO_QUEUE(
                                doc.Code, doc.Code, pl._doci_id, pl._seq_group, pl._priority,
                                pl.ref4, pl.psto_code, pl.ref1, pl.ref2, pl.qty, pl.unit, pl.ref3, pl.bsto_code, wh.Code,
                                area.Code, "", buVO);
                        });
                    }

                    //SEND SCE ALLOCATE
                    if (doc.Options.QryStrGetValue("_is_from_ams") == "SCE")
                    {
                        var _LINE = new List<GCLModel.Criterie.TREQ_Allocated_LPN.TRecord.TLine>();
                        select_pallet_alls.ForEach(pl =>
                        {

                            _LINE.Add(new GCLModel.Criterie.TREQ_Allocated_LPN.TRecord.TLine()
                            {
                                API_Date_Time = DateTime.Now,
                                API_REF = doc.Options.QryStrGetValue("api_ref"),
                                WMS_DOC = doc.Options.QryStrGetValue("wms_doc"),
                                WH_ID = doc.Options.QryStrGetValue("wh_id"),
                                CUSTOEMR_CODE = doc.Ref4,
                                WMS_LINE = pl._wms_line,
                                LOCATION_FROM = pl._loc_from,
                                Location_Staging = pl._loc_stage,

                                Pallet_Detail = new List<GCLModel.Criterie.TREQ_Allocated_LPN.TRecord.TLine.TPallet_Detail>()
                                {
                                    new GCLModel.Criterie.TREQ_Allocated_LPN.TRecord.TLine.TPallet_Detail()
                                    {
                                        LOT = pl.lot,
                                        PALLET_NO = pl.itemNo,
                                        QTY_Pallet = pl.qty,
                                        QTY_Pick = pl._qty_pick,
                                        UNIT = pl.unit,
                                        SKU = pl.sku
                                    }
                                }
                            });
                        });


                        SceAPI.GetInstant().Allocated_LPN(new GCLModel.Criterie.TREQ_Allocated_LPN()
                        {
                            RECORD = new GCLModel.Criterie.TREQ_Allocated_LPN.TRecord()
                            {
                                LINE = _LINE
                            }
                        }, buVO);
                    }
                   

                    buVO.SqlTransaction_Commit();

                }
                catch(Exception ex)
                {
                    buVO.SqlTransaction_Rollback();
                    this.Logger.LogError(ex.Message);
                    this.Logger.LogError(ex.StackTrace);


                    DataADO.GetInstant().UpdateBy<amt_Document>(
                        ListKeyValue<string, object>.New("ID", doc.ID).Add("Status", EntityStatus.ACTIVE),
                        ListKeyValue<string, object>
                        .New("EventStatus", DocumentEventStatus.REJECTED).Add("Status", EntityStatus.DONE)
                        .Add("Options", doc.Options += "&_error=" + ex.Message)
                            , buVO);

                    DataADO.GetInstant().UpdateBy<amt_DocumentItem>(
                        ListKeyValue<string, object>.New("Document_ID", doc.ID).Add("Status", EntityStatus.ACTIVE),
                        ListKeyValue<string, object>.New("EventStatus", DocumentEventStatus.REJECTED).Add("Status", EntityStatus.DONE)
                            , buVO);
                }
                

            });

        }

        private void WorkingToWorked_WcsQueue(VOCriteria buVO)
        {
            var wcsWq = DataADO.GetInstant().SelectBy<amt_Wcs_WQ>(
                ListKeyValue<string, object>.New("status", EntityStatus.ACTIVE).Add("IOType", IOType.OUTBOUND),
                buVO)
                .ToList();

            if (wcsWq.Count == 0) return;

            List<StorageObjectCriteria> psto_picks = new List<StorageObjectCriteria>();
            wcsWq.ForEach(wq =>
            {
                try
                {
                    buVO.SqlTransaction_Begin();

                    var doci = DataADO.GetInstant().SelectByID<amt_DocumentItem>(wq.WmsRefID, buVO);
                    var doc = DataADO.GetInstant().SelectByID<amt_Document>(doci.Document_ID, buVO);
                    var bsto = StorageObjectADO.GetInstant().Get(wq.BaseCode, doc.Sou_Warehouse_ID, null, false, true, buVO);
                    if (bsto == null)
                        throw new Exception($"ไม่พบเลขพาเลท '{wq.BaseCode}' ในระบบ");
                    var psto = bsto.mapstos.First();

                    //PICKED BASE //PICKED PACK
                    {
                        bsto.areaID = doc.Des_AreaMaster_ID;
                        bsto.parentID = null;
                        bsto.parentType = null;
                        bsto.eventStatus = wq.ActionStatus == EntityStatus.DONE ? StorageObjectEventStatus.BASE_DONE : StorageObjectEventStatus.BASE_ACTIVE;
                        StorageObjectADO.GetInstant().PutV2(bsto, buVO);

                        psto.areaID = doc.Des_AreaMaster_ID;
                        psto.eventStatus = wq.ActionStatus == EntityStatus.DONE ? StorageObjectEventStatus.PACK_PICKED : StorageObjectEventStatus.PACK_PICKING;
                        StorageObjectADO.GetInstant().PutV2(psto, buVO);
                    }

                    //DONE DISTO
                    {
                        DataADO.GetInstant().UpdateBy<amt_DocumentItemStorageObject>(
                            ListKeyValue<string, object>
                                .New("DocumentItem_ID", doci.ID.Value)
                                .Add("Sou_StorageObject_ID", psto.id.Value),
                            ListKeyValue<string, object>
                                .New("Status", wq.ActionStatus)
                                .Add("Des_StorageObject_ID", psto.id.Value), buVO);
                    }

                    //DONE WorkQueue
                    {
                        wq.Status = EntityStatus.DONE;
                        wq.ActionResult = "Success";
                        DataADO.GetInstant().UpdateBy<amt_Wcs_WQ>(wq, buVO);
                    }

                    //SEND SCE PICKING_CONFIRM
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

                    buVO.SqlTransaction_Commit();
                }
                catch(Exception ex)
                {
                    buVO.SqlTransaction_Rollback();

                    //REMOVE WorkQueue
                    {
                        wq.Status = EntityStatus.REMOVE;
                        wq.ActionResult = ex.Message;
                        DataADO.GetInstant().UpdateBy<amt_Wcs_WQ>(wq, buVO);
                    }
                }
            });


            wcsWq.GroupBy(x=>x.WmsRefID).Select(x=>x.Key).ToList().ForEach(doci_id =>
            {
                int disto_count =
                DataADO.GetInstant().CountBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("DocumentItem_id",doci_id, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status",EntityStatus.ACTIVE, SQLOperatorType.EQUALS)
                }, buVO);

                if (disto_count == 0)
                {
                    DataADO.GetInstant().UpdateBy<amt_DocumentItem>(
                        ListKeyValue<string, object>.New("ID", doci_id),
                        ListKeyValue<string, object>.New("eventstatus", DocumentEventStatus.WORKED),
                        buVO);
                }
            });
        }

        private void WorkedToClosed_SendSCE(VOCriteria buVO)
        {
            var docis =
                ADO.WMSDB.DataADO.GetInstant().SelectBy<amv_DocumentItem>(
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("DocumentType_ID",DocumentTypeID.PICKING, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("status",EntityStatus.ACTIVE, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("eventStatus",DocumentEventStatus.WORKED, SQLOperatorType.EQUALS)
                }, buVO);
            if (docis.Count == 0) return;

            docis.ForEach(doci =>
            {

                try
                {
                    buVO.SqlTransaction_Begin();

                    DataADO.GetInstant().UpdateBy<amt_DocumentItem>(
                        ListKeyValue<string, object>.New("ID", doci.ID),
                        ListKeyValue<string, object>.New("eventstatus", DocumentEventStatus.CLOSED).Add("status", EntityStatus.DONE),
                        buVO);

                    buVO.SqlTransaction_Commit();
                }
                catch (Exception ex)
                {
                    buVO.SqlTransaction_Rollback();
                    buVO.FinalLogDocMessage.Add(new FinalDatabaseLogCriteria.DocumentOptionMessage()
                    {
                        docID = doci.Document_ID.Value,
                        msgError = ex.Message,
                    });
                    this.Logger.LogError($"DocumentItem_ID = {doci.ID} / {ex.Message}");
                }

            });

            //ตรวจสอบเพื่อปิด Doc
            docis.GroupBy(x=>x.Document_ID).Select(x=>x.Key.Value).ToList().ForEach(doc_id =>
            {
                int doc_count =
                DataADO.GetInstant().CountBy<amt_DocumentItem>(new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("document_id",doc_id, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("eventstatus",DocumentEventStatus.REMOVED, SQLOperatorType.NOTEQUALS),
                    new SQLConditionCriteria("eventstatus",DocumentEventStatus.CLOSED, SQLOperatorType.NOTEQUALS),
                }, buVO);

                if (doc_count == 0)
                {
                    DataADO.GetInstant().UpdateBy<amt_Document>(
                        ListKeyValue<string, object>.New("ID", doc_id),
                        ListKeyValue<string, object>.New("eventstatus", DocumentEventStatus.CLOSED).Add("status", EntityStatus.DONE),
                        buVO);
                }
            });



        }


        private class TRES_SP
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

            public long _doci_id;
            public decimal _qty_pick;
            public string _wms_line;
            public string _loc_from;
            public string _loc_stage;
            public int _priority;
            public long _seq_group;
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
