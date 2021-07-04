using ADO.WMSDB;
using ADO.WMSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.Logger;
using AWMSEngine.HubService;
using Microsoft.AspNetCore.SignalR;
using ProjectGCL.GCLModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.WorkerService
{
    public class PA_WorkingToClosed_Worker : AWMSEngine.WorkerService.BaseWorkerService
    {
        public PA_WorkingToClosed_Worker(long workerServiceID, AMWLogger logger, IHubContext<CommonMessageHub> commonHub) : base(workerServiceID, logger, commonHub)
        {
        }

        protected override void ExecuteEngine(Dictionary<string, string> options, VOCriteria buVO)
        {
            this.WorkingToWorked_WcsWQ(buVO);

            this.WorkedToClosed_SendSCE(buVO);
        }

        private void WorkingToWorked_WcsWQ(VOCriteria buVO)
        {
            var wcsWq = DataADO.GetInstant().SelectBy<amt_Wcs_WQ>(
                new SQLConditionCriteria[]{
                    new SQLConditionCriteria("Status",EntityStatus.ACTIVE, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("IOType","1,3", SQLOperatorType.IN),
                },
                new VOCriteria())
                .ToList();

            if (wcsWq.Count == 0) return;

            wcsWq.ForEach(wq =>
            {
                try
                {
                    buVO.SqlTransaction_Begin();

                    var baseMst = DataADO.GetInstant().
                                        SelectBy<ams_BaseMaster>(
                                            ListKeyValue<string, object>.New("code", wq.BaseCode).Add("status", EntityStatus.ACTIVE),
                                            buVO)
                                        .FirstOrDefault();

                    var doci = DataADO.GetInstant().SelectByID<amt_DocumentItem>(wq.WmsRefID.Get2<long>(), buVO);
                    var doc = DataADO.GetInstant().SelectByID<amt_Document>(doci.Document_ID, buVO);

                    if(doc.EventStatus == DocumentEventStatus.NEW)
                    {
                        DataADO.GetInstant().UpdateBy<amt_Document>(
                            ListKeyValue<string, object>.New("ID", doc.ID),
                            ListKeyValue<string, object>.New("eventstatus", DocumentEventStatus.WORKING).Add("status", EntityStatus.ACTIVE),
                            buVO);
                    }

                    //CREATE BASE Master
                    {
                        if (baseMst == null)
                        {
                            DataADO.GetInstant().Insert<ams_BaseMaster>(new ams_BaseMaster()
                            {
                                BaseMasterType_ID = 1,
                                Code = wq.BaseCode,
                                Name = "Pallet",
                                UnitType_ID = 2,
                                WeightKG = 0,
                                ObjectSize_ID = 2,
                                Status = EntityStatus.ACTIVE,
                            }, buVO);
                        }
                    }

                    StorageObjectCriteria bsto = StorageObjectADO.GetInstant().Get(wq.BaseCode, doc.Des_Warehouse_ID, null, false, true, buVO);
                    StorageObjectCriteria psto = null;
                    //สร้าง Storage Object
                    if (bsto == null)
                    {
                        var area_list = StaticValueManager.GetInstant().AreaMasters.FindAll(x => x.Warehouse_ID == doc.Des_Warehouse_ID);
                        var loc_list = DataADO.GetInstant()
                                            .SelectBy<ams_AreaLocationMaster>("Code", wq.LocCode, buVO)
                                            .FindAll(x => x.Status == EntityStatus.ACTIVE);
                        var loc = loc_list.FirstOrDefault(x => x.Code == wq.LocCode && area_list.Any(y => y.ID == x.AreaMaster_ID));
                        if (loc == null)
                            loc = loc_list.First();
                        //CREATE MAPPING PALLET BSTO,PSTO
                        {
                            AWMSEngine.Engine.V2.Business.ScanMapStoNoDoc exec = new AWMSEngine.Engine.V2.Business.ScanMapStoNoDoc();
                            bsto = exec.Execute(this.Logger, buVO,
                                new AWMSEngine.Engine.V2.Business.ScanMapStoNoDoc.TReq()
                                {
                                    action = VirtualMapSTOActionType.ADD,
                                    amount = 1,
                                    areaID = loc.AreaMaster_ID,
                                    batch = null,
                                    isRoot = false,
                                    locationCode = loc.Code,
                                    lot = doci.Lot,
                                    mode = VirtualMapSTOModeType.REGISTER,
                                    options = doci.Options.QryStrSetValue("pa_loc", wq.LocCode),
                                    orderNo = null,
                                    productDate = doci.ProductionDate,
                                    rootID = null,
                                    rootOptions = null,
                                    rootType = null,
                                    scanCode = wq.BaseCode,
                                    unitCode = null,
                                    warehouseID = doc.Des_Warehouse_ID.Value,
                                    validateSKUTypeCodes = null
                                });
                            psto = exec.Execute(this.Logger, buVO,
                                new AWMSEngine.Engine.V2.Business.ScanMapStoNoDoc.TReq()
                                {
                                    action = VirtualMapSTOActionType.ADD,
                                    amount = doci.Quantity.Value,
                                    areaID = loc.AreaMaster_ID,
                                    batch = null,
                                    isRoot = false,
                                    locationCode = null,
                                    lot = doci.Lot,
                                    mode = VirtualMapSTOModeType.REGISTER,
                                    options = doci.Options.QryStrSetValue("pa_loc", wq.LocCode),
                                    orderNo = null,
                                    productDate = doci.ProductionDate,
                                    rootID = bsto.id,
                                    rootOptions = null,
                                    rootType = StorageObjectType.BASE,
                                    scanCode = doci.Code,
                                    unitCode = StaticValueManager.GetInstant().UnitTypes.First(x => x.ID == doci.UnitType_ID).Code,
                                    warehouseID = doc.Des_Warehouse_ID.Value,
                                    validateSKUTypeCodes = null
                                }).mapstos.First();

                            psto.itemNo = doci.ItemNo;
                            psto.ref1 = doci.Ref1;
                            psto.ref2 = doci.Ref2;
                            psto.ref3 = doci.Ref3;
                            psto.ref4 = doci.Ref4;
                            psto.eventStatus = wq.ActionStatus == EntityStatus.DONE ? StorageObjectEventStatus.PACK_RECEIVED : StorageObjectEventStatus.PACK_RECEIVING;

                            StorageObjectADO.GetInstant().PutV2(psto, buVO);
                        }

                        //CREATE DISTO
                        {
                            amt_DocumentItemStorageObject disto = new amt_DocumentItemStorageObject()
                            {
                                DocumentItem_ID = doci.ID.Value,
                                DocumentType_ID = doc.DocumentType_ID,
                                Sou_StorageObject_ID = psto.id.Value,
                                Des_StorageObject_ID = psto.id.Value,
                                IsLastSeq = true,
                                BaseQuantity = psto.baseQty,
                                BaseUnitType_ID = psto.baseUnitID,
                                Quantity = psto.qty,
                                UnitType_ID = psto.unitID,
                                Status = wq.ActionStatus
                            };
                            DataADO.GetInstant().Insert<amt_DocumentItemStorageObject>(disto, buVO);
                        }
                    }
                    //อัพเดท Storage Object
                    else
                    {
                        psto = bsto.mapstos.First();
                        //if (psto.eventStatus != StorageObjectEventStatus.PACK_RECEIVED)
                        {
                            //PSTO Update Status
                            var area_list = StaticValueManager.GetInstant().AreaMasters.FindAll(x => x.Warehouse_ID == doc.Des_Warehouse_ID);
                            var loc = DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>("Code", wq.LocCode, buVO)
                            .FirstOrDefault(x => x.Status == EntityStatus.ACTIVE && area_list.Any(y => y.ID == x.AreaMaster_ID));

                            bsto.areaID = loc.AreaMaster_ID;
                            bsto.parentType = StorageObjectType.LOCATION;
                            bsto.parentID = loc.ID;
                            bsto.options = bsto.options.QryStrSetValue("pa_loc", wq.LocCode);
                            StorageObjectADO.GetInstant().PutV2(bsto, buVO);

                            psto.eventStatus = wq.ActionStatus == EntityStatus.DONE ? StorageObjectEventStatus.PACK_RECEIVED : StorageObjectEventStatus.PACK_RECEIVING;
                            psto.options = psto.options.QryStrSetValue("pa_loc", wq.LocCode);
                            StorageObjectADO.GetInstant().PutV2(psto, buVO);

                            //UPDATE DISTO
                            DataADO.GetInstant().UpdateBy<amt_DocumentItemStorageObject>(
                                ListKeyValue<string, object>.New("DocumentItem_ID", doci.ID).Add("Sou_StorageObject_ID", psto.id),
                                ListKeyValue<string, object>.New("Status", wq.ActionStatus),
                                buVO);
                        }

                    }

                    //WORKED DOCUMENT ITEM
                    {
                        if (wq.ActionStatus == EntityStatus.DONE)
                            DocumentADO.GetInstant().UpdateItemEventStatus(doci.ID.Value, DocumentEventStatus.WORKED, buVO);
                    }
                    //DONE WORKQUEUE
                    {
                        wq.Status = EntityStatus.DONE;
                        wq.ActionResult = "[SUCCESS] label=" + psto.itemNo;
                        DataADO.GetInstant().UpdateBy<amt_Wcs_WQ>(wq, buVO);
                    }

                    buVO.SqlTransaction_Commit();
                }
                catch(Exception ex)
                {
                    buVO.SqlTransaction_Rollback();

                    //DONE WORKQUEUE
                    {
                        wq.Status = EntityStatus.REMOVE;
                        wq.ActionResult = "[ERROR] "+ex.Message;
                        DataADO.GetInstant().UpdateBy<amt_Wcs_WQ>(wq, buVO);
                    }
                }
                
            
            });

        }

        private void WorkedToClosed_SendSCE(VOCriteria buVO)
        {

            var docis = 
                ADO.WMSDB.DataADO.GetInstant().SelectBy<amv_DocumentItem>(
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("DocumentType_ID",DocumentTypeID.PUTAWAY, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("status",EntityStatus.ACTIVE, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("eventStatus",DocumentEventStatus.WORKED, SQLOperatorType.EQUALS)
                }, buVO);
            if (docis.Count == 0) return;


            docis.ForEach(doci =>
            {
                try
                {
                    buVO.SqlTransaction_Begin();

                    //send SCE
                    if (doci.Options.QryStrGetValue("_is_from_ams") == "SCE")
                    {
                        var _req_sce = new GCLModel.Criterie.TREQ_Receive_Confirm()
                        {
                            RECORD = new GCLModel.Criterie.TREQ_Receive_Confirm.TRecord()
                            {
                                LINE = new List<GCLModel.Criterie.TREQ_Receive_Confirm.TRecord.TLine>()
                        {
                            new GCLModel.Criterie.TREQ_Receive_Confirm.TRecord.TLine()
                            {
                                API_DATE_TIME = DateTime.Now,
                                API_REF = doci.Options.QryStrGetValue("api_ref"),
                                WMS_DOC = doci.Options.QryStrGetValue("wms_doc"),
                                TO_WH_ID = doci.Options.QryStrGetValue("to_wh_id"),
                                CUSTOMER_CODE = doci.Ref4,
                                Pallet_Detail = new List<GCLModel.Criterie.TREQ_Receive_Confirm.TRecord.TLine.TPallet_Detail>()
                                {
                                    new GCLModel.Criterie.TREQ_Receive_Confirm.TRecord.TLine.TPallet_Detail()
                                    {
                                        LOT = doci.Lot,
                                        PALLET_NO = doci.ItemNo,
                                        QTY_Pallet = doci.BaseQuantity.Value,
                                        UNIT = StaticValueManager.GetInstant().UnitTypes.First(u => u.ID == doci.UnitType_ID).Code,
                                        SKU = doci.Code,
                                        TO_LOCATION = doci.Options.QryStrGetValue("to_location"),
                                    }
                                }
                            }
                        }
                            }
                        };

                        //Send Receive Confirm
                        ADOGCL.SceAPI.GetInstant().Receive_Confirm(_req_sce, buVO);
                    }

                    //closed document item
                    DataADO.GetInstant().UpdateBy<amt_DocumentItem>(
                        ListKeyValue<string, object>.New("ID", doci.ID),
                        ListKeyValue<string, object>.New("eventstatus", DocumentEventStatus.CLOSED).Add("status", EntityStatus.DONE),
                        buVO);

                    buVO.SqlTransaction_Commit();
                }
                catch(Exception ex)
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


            //Closed Document
            docis.GroupBy(x => x.Document_ID).ToList().ForEach(doc_id =>
            {
                int doc_count =
                DataADO.GetInstant().CountBy<amt_DocumentItem>(new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("document_id",doc_id.Key.Value, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("status",EntityStatus.ACTIVE, SQLOperatorType.EQUALS)
                }, buVO);

                if (doc_count == 0)
                {
                    DataADO.GetInstant().UpdateBy<amt_Document>(
                        ListKeyValue<string, object>.New("ID", doc_id.Key.Value),
                        ListKeyValue<string, object>.New("eventstatus", DocumentEventStatus.CLOSED).Add("status", EntityStatus.DONE),
                        buVO);
                }
            });

        }

    }
}
