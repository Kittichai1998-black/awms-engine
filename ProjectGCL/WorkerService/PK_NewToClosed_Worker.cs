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

                    var docis = DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                        ListKeyValue<string, object>
                            .New("Document_ID", doc.ID)
                            .Add("EventStatus", DocumentEventStatus.NEW)
                            .Add("Status", EntityStatus.ACTIVE), buVO).ToList();

                    var distos = DocumentADO.GetInstant().ListDISTOByDoc(doc.ID.Value, buVO);
                    var pstos = DataADO.GetInstant().SelectBy<amt_StorageObject>(
                        new SQLConditionCriteria[] { 
                            new SQLConditionCriteria("ID",distos.Select(x=>x.Sou_StorageObject_ID).ToArray().JoinString(), SQLOperatorType.IN)
                        }, buVO).ToList();


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


                    //SEND SCE ALLOCATE
                    if (doc.Options.QryStrGetValue("_is_from_ams") == "SCE")
                    {
                        var _LINE = new List<GCLModel.Criterie.TREQ_Allocated_LPN.TRecord.TLine>();
                        distos.ForEach(disto =>
                        {
                            var doci = docis.FirstOrDefault(x => x.Document_ID == disto.DocumentItem_ID);
                            var psto = pstos.FirstOrDefault(x => x.ID == disto.Sou_StorageObject_ID);
                            var unit = StaticValueManager.GetInstant().UnitTypes.First(x => x.ID == psto.UnitType_ID);
                            if (doci != null)
                            {
                                _LINE.Add(new GCLModel.Criterie.TREQ_Allocated_LPN.TRecord.TLine()
                                {
                                    API_Date_Time = DateTime.Now,
                                    API_REF = doc.Options.QryStrGetValue("api_ref"),
                                    WMS_DOC = doc.Options.QryStrGetValue("wms_doc"),
                                    WH_ID = doc.Options.QryStrGetValue("wh_id"),
                                    CUSTOEMR_CODE = psto.Ref4,
                                    WMS_LINE = doci.Options.QryStrGetValue("wms_line"),
                                    LOCATION_FROM = doci.Options.QryStrGetValue("loc_from"),
                                    Location_Staging = doci.Options.QryStrGetValue("loc_stage"),

                                    Pallet_Detail = new List<GCLModel.Criterie.TREQ_Allocated_LPN.TRecord.TLine.TPallet_Detail>()
                                    {
                                        new GCLModel.Criterie.TREQ_Allocated_LPN.TRecord.TLine.TPallet_Detail()
                                        {
                                            LOT = doci.Lot,
                                            PALLET_NO = psto.ItemNo,
                                            QTY_Pallet = psto.Quantity,
                                            QTY_Pick = disto.Quantity.Value,
                                            UNIT = unit.Code,
                                            SKU = psto.Code
                                        }
                                    }
                                });
                            }
                            
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
                    var cur_loc = DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>("Code",wq.LocCode, buVO)
                                .Where(x=>x.Status == EntityStatus.ACTIVE && StaticValueManager.GetInstant().AreaMasters.FindAll(y=>y.Warehouse_ID==doc.Des_Warehouse_ID).Any(y=>y.ID==x.AreaMaster_ID))
                                .FirstOrDefault();
                    if(cur_loc == null)
                        throw new Exception($"Location '{wq.LocCode}' ไม่ถูกต้อง");

                    var bsto = StorageObjectADO.GetInstant().Get(wq.BaseCode, doc.Sou_Warehouse_ID, null, false, true, buVO);
                    if (bsto == null)
                        throw new Exception($"ไม่พบเลขพาเลท '{wq.BaseCode}' ในระบบ");
                    var psto = bsto.mapstos.First();
                    var distos = ADO.WMSDB.DistoADO.GetInstant().List_byDesSto(psto.id.Value, buVO);

                    //PICKED BASE //PICKED PACK
                    {
                        bsto.areaID = cur_loc.AreaMaster_ID;
                        bsto.parentID = cur_loc.ID.Value;
                        bsto.parentType = StorageObjectType.LOCATION;
                        bsto.options = psto.options.QryStrSetValue("pk_loc", wq.LocCode);
                        bsto.eventStatus = wq.ActionStatus == EntityStatus.DONE ? StorageObjectEventStatus.BASE_DONE : StorageObjectEventStatus.BASE_ACTIVE;
                        StorageObjectADO.GetInstant().PutV2(bsto, buVO);

                        psto.areaID = doc.Des_AreaMaster_ID;
                        psto.options = psto.options.QryStrSetValue("pk_loc", wq.LocCode);
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
                        wq.ActionResult = "[SUCCESS] label=" + psto.itemNo;
                        DataADO.GetInstant().UpdateBy<amt_Wcs_WQ>(wq, buVO);
                    }

                    //SEND SCE PICKING_CONFIRM
                    if (doc.Options.QryStrGetValue("_is_from_ams") == "SCE" && wq.ActionStatus == EntityStatus.DONE)
                    {
                        distos.ForEach(disto =>
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
                                                    QTY_Pick = disto.Quantity.Value,//psto.options.QryStrGetValue("qty_pick").Get2<decimal>(),
                                                    SKU = psto.code,
                                                    UNIT = psto.unitCode
                                                }
                                            }
                                        }
                                    }
                                }
                            }, buVO);
                        });
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
                    new SQLConditionCriteria("Status",EntityStatus.DONE, SQLOperatorType.NOTEQUALS),
                    new SQLConditionCriteria("Status",EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS)
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
                    //new SQLConditionCriteria("status",EntityStatus.ACTIVE, SQLOperatorType.EQUALS),
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
                        ListKeyValue<string, object>.New("eventstatus", DocumentEventStatus.CLOSING).Add("status", EntityStatus.ACTIVE),
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
                    new SQLConditionCriteria("eventstatus",DocumentEventStatus.CLOSING, SQLOperatorType.NOTEQUALS),
                    new SQLConditionCriteria("eventstatus",DocumentEventStatus.CLOSED, SQLOperatorType.NOTEQUALS),
                }, buVO);

                if (doc_count == 0)
                {
                    DataADO.GetInstant().UpdateBy<amt_Document>(
                        ListKeyValue<string, object>.New("ID", doc_id),
                        ListKeyValue<string, object>.New("eventstatus", DocumentEventStatus.CLOSING).Add("status", EntityStatus.ACTIVE),
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
