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
            this.WorkingToWorked(buVO);

            this.WorkedToClosed(buVO);
        }

        private void WorkingToWorked(VOCriteria buVO)
        {
            var wcsWq = DataADO.GetInstant().SelectBy<amt_Wcs_WQ_Done>(
                ListKeyValue<string, object>.New("status", EntityStatus.ACTIVE).Add("DocumentType_ID", DocumentTypeID.PUTAWAY),
                buVO)
                .ToList();

            wcsWq.ForEach(wq =>
            {
                var baseMst =
                    DataADO.GetInstant().SelectBy<ams_BaseMaster>(ListKeyValue<string, object>.New("code", wq.BaseCode).Add("status", EntityStatus.ACTIVE), buVO)
                    .FirstOrDefault();
                if(baseMst == null)
                {
                    DataADO.GetInstant().Insert<ams_BaseMaster>(new ams_BaseMaster()
                    {
                        BaseMasterType_ID = 1,
                        Code = wq.BaseCode,
                        Name = "Pallet",
                        UnitType_ID = 2,
                        WeightKG = 0,
                        ObjectSize_ID = 2
                    }, buVO);
                }

                //var wh = StaticValueManager.GetInstant().Warehouses.First(x => x.ID == wq.Warehouse_ID);
                //var areas = StaticValueManager.GetInstant().AreaMasters.FindAll(x => x.Warehouse_ID == wq.Warehouse_ID);

                //var loc = 
                //    DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(ListKeyValue<string, object>.New("code", wq.LocCode).Add("status", EntityStatus.ACTIVE), buVO)
                //    .First(x=>areas.Any(y=>y.ID==x.AreaMaster_ID));
                //var area = areas.First(x => x.ID == loc.AreaMaster_ID);

                var doci = DataADO.GetInstant().SelectByID<amt_DocumentItem>(wq.TrxRef.Get2<long>(), buVO);
                var doc = DataADO.GetInstant().SelectByID<amt_Document>(doci.Document_ID, buVO);

                AWMSEngine.Engine.V2.Business.ScanMapStoNoDoc exec = new AWMSEngine.Engine.V2.Business.ScanMapStoNoDoc();
                var bsto = exec.Execute(this.Logger, buVO,
                    new AWMSEngine.Engine.V2.Business.ScanMapStoNoDoc.TReq()
                    {
                        action = VirtualMapSTOActionType.ADD,
                        amount = 1,
                        areaID = doc.Des_AreaMaster_ID,
                        batch = null,
                        isRoot = false,
                        locationCode = wq.LocCode,
                        lot = doci.Lot,
                        mode= VirtualMapSTOModeType.REGISTER,
                        options = doci.Options,
                        orderNo = null,
                        productDate = doci.ProductionDate,
                        rootID = null,
                        rootOptions = null,
                        rootType = null,
                        scanCode = baseMst.Code,
                        unitCode = null,
                        warehouseID = doc.Des_Warehouse_ID.Value,
                        validateSKUTypeCodes = null
                    });
                var psto = exec.Execute(this.Logger, buVO,
                    new AWMSEngine.Engine.V2.Business.ScanMapStoNoDoc.TReq()
                    {
                        action = VirtualMapSTOActionType.ADD,
                        amount = doci.Quantity.Value,
                        areaID = doc.Des_AreaMaster_ID,
                        batch = null,
                        isRoot = false,
                        locationCode = null,
                        lot = doci.Lot,
                        mode = VirtualMapSTOModeType.REGISTER,
                        options = doci.Options,
                        orderNo = null,
                        productDate = doci.ProductionDate,
                        rootID = bsto.id,
                        rootOptions = null,
                        rootType = StorageObjectType.BASE,
                        scanCode = doci.Code,
                        unitCode = null,
                        warehouseID = doc.Des_Warehouse_ID.Value,
                        validateSKUTypeCodes = null
                    });

                psto.itemNo = doci.ItemNo;
                psto.ref1 = doci.Ref1;
                psto.ref2 = doci.Ref2;
                psto.ref3 = doci.Ref3;
                psto.ref4 = doci.Ref4;

                StorageObjectADO.GetInstant().PutV2(psto, buVO);
                DocumentADO.GetInstant().CreateDocItemSto(doci.ID.Value, psto.id.Value, psto.qty, psto.unitID, psto.baseQty, psto.baseUnitID, buVO);
            });
        }

        private void WorkedToClosed(VOCriteria buVO)
        {
            var docis = 
                ADO.WMSDB.DataADO.GetInstant().SelectBy<amv_DocumentItem>(
                new SQLConditionCriteria[]
                {
                    new SQLConditionCriteria("DocumentType_ID",DocumentTypeID.PUTAWAY, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("status",EntityStatus.ACTIVE, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("eventStatus",DocumentEventStatus.WORKED, SQLOperatorType.EQUALS)
                }, buVO);
            

            docis.ForEach(doci =>
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

                try
                {
                    //Send Receive Confirm
                    ADOGCL.SceAPI.GetInstant().Receive_Confirm(_req_sce, buVO);

                    //closing document item
                    DataADO.GetInstant().UpdateBy<amt_DocumentItem>(
                        ListKeyValue<string, object>.New("ID", doci.ID),
                        ListKeyValue<string, object>.New("eventstatus", DocumentEventStatus.CLOSED).Add("status", EntityStatus.DONE),
                        buVO);
                }
                catch(Exception ex)
                {
                    this.Logger.LogError($"DocumentItem_ID = {doci.ID} / {ex.Message}");
                }
            });


            //Check for Closed Document
            docis.GroupBy(x => x.Document_ID).ToList().ForEach(doc_id =>
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

    }
}
