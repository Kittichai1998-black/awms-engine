using AMWUtil.Common;
using AMWUtil.Logger;
using ADO.WMSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Criteria.SP.Request;
using AMSModel.Criteria.SP.Response;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace ADO.WMSDB
{
    public class StorageObjectADO : BaseWMSDB<StorageObjectADO>
    {
        public amt_StorageObject GetParent(long childStoID, VOCriteria buVO)
        {
            return ListParent(new long[] { childStoID }, buVO).FirstOrDefault();
        }
        public List<amt_StorageObject> ListParent(long[] childStoIDs,VOCriteria buVO)
        {
            Dapper.DynamicParameters parameter = new Dapper.DynamicParameters();
            parameter.Add("@childStoIDs", string.Join(',', childStoIDs));
            var res = this.Query<amt_StorageObject>("SP_STO_LIST_PARENT", 
                CommandType.StoredProcedure, parameter, buVO.Logger, buVO.SqlTransaction).ToList();
            return res;
        }
        public StorageObjectCriteria UpdateLocationToChild(StorageObjectCriteria baseInfo, long locationID, VOCriteria buVO)
        {
            return UpdateLocationToChild(baseInfo, baseInfo.eventStatus, locationID, buVO);
        }
        public StorageObjectCriteria UpdateLocationToChild(StorageObjectCriteria baseInfo,StorageObjectEventStatus eventStatus, long locationID, VOCriteria buVO)
        {
            var location = DataADO.GetInstant().SelectByID<ams_AreaLocationMaster>(locationID, buVO);

            baseInfo.parentID = location.ID;
            baseInfo.parentType = StorageObjectType.LOCATION;
            baseInfo.areaID = location.AreaMaster_ID;
            baseInfo.eventStatus = eventStatus;

            this.PutV2(baseInfo, buVO);
            baseInfo.ToTreeList().ForEach(x => {
                if (x != baseInfo)
                {
                    x.areaID = location.AreaMaster_ID;
                   
                    this.PutV2(x, buVO);
                }
            });
            return baseInfo;
        }
        public StorageObjectCriteria Get(string code, long? warehouseID, long? areaID, bool isToRoot, bool isToChild, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@code", code);
            param.Add("@warehouseID", warehouseID);
            param.Add("@areaID", areaID);
            param.Add("@isToRoot", isToRoot);
            param.Add("@isToChild", isToChild);
            List<SPOutSTOMiniCriteria> values = this.Query<SPOutSTOMiniCriteria>("SP_STO_GET_BYCODE", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction)
                    .ToList();

            if (values == null) return null;
            
            StorageObjectCriteria res = StorageObjectCriteria.GenerateBySP(values,
                StaticValueManager.GetInstant().ObjectSizes,
                StaticValueManager.GetInstant().UnitTypes,
                StaticValueManager.GetInstant().SKUMasterTypes, code);
            return res;
        }
        public StorageObjectCriteria GetFree(
            string code, 
            long? warehouseID, 
            long? areaID,
            string batch,
            string lot,
            bool isInStorage,
            bool isToChild,
            VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@code", code);
            param.Add("@warehouseID", warehouseID);
            param.Add("@areaID", areaID);
            param.Add("batch", batch);
            param.Add("lot", lot);
            param.Add("@isInStorage", isInStorage);
            param.Add("@isToChild", isToChild);
            var r = this.Query<SPOutSTOMiniCriteria>("SP_STO_GETFREE_BYCODE", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction)
                    .ToList();

            if (r == null) return null;

            StorageObjectCriteria res = StorageObjectCriteria.GenerateBySP(r, 
                StaticValueManager.GetInstant().ObjectSizes,
                StaticValueManager.GetInstant().UnitTypes,
                StaticValueManager.GetInstant().SKUMasterTypes, code);
            return res;
        }
        public StorageObjectCriteria Get(long id, StorageObjectType type, bool isToRoot, bool isToChild, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@id", id);
            param.Add("@type", type);
            param.Add("@isToRoot", isToRoot);
            param.Add("@isToChild", isToChild);
            var r = this.Query<SPOutSTOMiniCriteria>("SP_STO_GET_BYID", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction)
                    .ToList();


            if (r == null || r.Count == 0) return null;

            StorageObjectCriteria res = StorageObjectCriteria.GenerateBySP(r, 
                StaticValueManager.GetInstant().ObjectSizes,
                StaticValueManager.GetInstant().UnitTypes,
                StaticValueManager.GetInstant().SKUMasterTypes, id);
            return res;
        }

        /*public int GetRootID(string code, int? warehouseID, int areaID, StorageObjectType rootType, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("code", code);
            param.Add("warehouseID", warehouseID);
            param.Add("areaID", areaID);
            param.Add("rootType", rootType);
            param.Add("rootID", System.Data.ParameterDirection.Output);
            this.Query<int>("SP_STO_GETROOTID", System.Data.CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction);
            return param.Get<int>("rootID");
        }*/

        public int GetFreeCount(
            string code,
            long? warehouseID,
            long? areaID,
            string batch,
            string lot,
            bool isInStorage,
            VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("code", code);
            param.Add("warehouseID", warehouseID);
            param.Add("areaID", areaID);
            param.Add("isInStorage", isInStorage);
            param.Add("batch", batch);
            param.Add("lot", lot);
            param.Add("res", null, System.Data.DbType.Int32, System.Data.ParameterDirection.Output);
            this.Query<int>("SP_STO_FREE_COUNT_V2", System.Data.CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction);
            return param.Get<int>("res");
        }

        /*public long ReceivingConfirm(long id, StorageObjectType type, bool isConfirm, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("id", id);
            param.Add("type", type);
            param.Add("isConfirm", isConfirm);
            param.Add("actionBy", buVO.ActionBy);
            var res = this.Execute(
                "SP_STO_RECEIVING_CONFIRM",
                System.Data.CommandType.StoredProcedure,
                param, 
                buVO.Logger,
                buVO.SqlTransaction);
            return res;
        }*/

        public int UpdateStatusToChild(long stoRootID,
            StorageObjectEventStatus? fromEventStatus, EntityStatus? fromStatus, StorageObjectEventStatus? toEventStatus, 
            VOCriteria buVO)
        {
            return this.UpdateStatusToChild(stoRootID,fromEventStatus, fromStatus, toEventStatus, false, null, null, buVO);
        }

        public int UpdateStatusToChild(long stoRootID,
            StorageObjectEventStatus? fromEventStatus, EntityStatus? fromStatus, StorageObjectEventStatus? toEventStatus, bool flagOldStatus, 
            StorageObjectEventStatus? flagDoneSou, 
            StorageObjectEventStatus? flagDoneDes,
            VOCriteria buVO)
        {
            EntityStatus? toStatus = StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<StorageObjectEventStatus>(toEventStatus);
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("rootid", stoRootID);
            param.Add("fromEventStatus", fromEventStatus);
            param.Add("fromStatus", fromStatus);
            param.Add("toEventStatus", toEventStatus);
            param.Add("toStatus", toStatus);
            param.Add("flagOldStatus", flagOldStatus);
            param.Add("flagDoneSou", flagDoneSou);
            param.Add("flagDoneDes", flagDoneDes);

            param.Add("actionBy", buVO.ActionBy);
            var res = this.Execute(
                "SP_STO_UPDATE_STATUS_TO_CHILD",
                System.Data.CommandType.StoredProcedure,
                param,
                buVO.Logger,
                buVO.SqlTransaction);
            return res;
        }

        public int UpdateStatus(long stoID, StorageObjectEventStatus? fromEventStatus, EntityStatus? fromStatus, StorageObjectEventStatus? toEventStatus,
            VOCriteria buVO)
        {
            EntityStatus? toStatus = StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<StorageObjectEventStatus>(toEventStatus);
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("stoid", stoID);
            param.Add("fromEventStatus", fromEventStatus);
            param.Add("fromStatus", fromStatus);
            param.Add("toEventStatus", toEventStatus);
            param.Add("toStatus", toStatus);
            param.Add("actionBy", buVO.ActionBy);

            var res = this.Execute(
                "SP_STO_UPDATE_STATUS",
                System.Data.CommandType.StoredProcedure,
                param,
                buVO.Logger,
                buVO.SqlTransaction);
            return res;
        }

        public long PutV2(StorageObjectCriteria sto,VOCriteria buVO)
        {
            if (sto.type == StorageObjectType.BASE)
            {
                var eventStatus = StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<StorageObjectEventStatus>(sto.eventStatus);
                sto.eventStatus = (StorageObjectEventStatus)eventStatus;
            }

            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("id", sto.id);
            param.Add("type", sto.type);
            param.Add("mstID", sto.mstID);
            param.Add("itemNo", sto.itemNo);
            param.Add("areaID", sto.areaID);
            param.Add("eventStatus", sto.eventStatus);
            param.Add("status", StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<StorageObjectEventStatus>(sto.eventStatus));
            param.Add("parentID", sto.parentID);
            param.Add("parentType", sto.parentType);
            param.Add("forCustomerID", sto.forCustomerID);
            param.Add("options", sto.options);
            param.Add("orderNo", sto.orderNo);
            param.Add("batch", sto.batch);
            param.Add("lot", sto.lot);
            param.Add("cartonNo", sto.cartonNo);
            
            param.Add("qty", sto.qty);
            param.Add("unitID", sto.unitID);
            param.Add("baseQty", sto.baseQty);
            param.Add("baseUnitID", sto.baseUnitID);
            
            param.Add("weiKG", sto.weiKG);
            param.Add("widthM", sto.widthM);
            param.Add("heightM", sto.heightM);
            param.Add("lengthM", sto.lengthM);

            param.Add("actionBy", buVO.ActionBy);
            param.Add("productDate", sto.productDate);
            param.Add("expiryDate", sto.expiryDate);
            param.Add("incubationDate", sto.incubationDate);
            param.Add("shelfLifeDate", sto.shelfLifeDate);

            param.Add("refID", sto.refID);
            param.Add("ref1", sto.ref1);
            param.Add("ref2", sto.ref2);
            param.Add("ref3", sto.ref3);
            param.Add("ref4", sto.ref4);
            param.Add("IsStock", sto.IsStock); 
            param.Add("IsHold", sto.IsHold);
            param.Add("auditStatus", sto.AuditStatus);
            param.Add("productOwner", sto.productOwner); 

            param.Add("resID", null, System.Data.DbType.Int64, System.Data.ParameterDirection.Output);
            this.Execute("SP_STO_PUT_V2", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction);
            sto.id = param.Get<long>("resID");
            return sto.id.Value;
        }

        public List<StorageObjectFullCriteria> Search(SPInSTOSearchCriteria search, VOCriteria buVO)
        {
            var param = this.CreateDynamicParameters(search);
            var qry = this.Query<StorageObjectFullCriteria>("SP_STO_SEARCH", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction).ToList();
            List<StorageObjectFullCriteria> res = StorageObjectFullCriteria.Generate(qry);
            return res;
        }
        public ams_BaseMaster MatchDocLock(string baseCode, long? docID, DocumentTypeID? docTypeID,
            long? desCustomerID, long? desBranchID, long? desSupplierID, long? desWarehouseID, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@baseCode", baseCode);
            param.Add("@docID", docID);
            param.Add("@docTypeID", docTypeID);
            param.Add("@desCustomerID", desCustomerID);
            param.Add("@desBranchID", desBranchID);
            param.Add("@desSupplierID", desSupplierID);
            param.Add("@desWarehouseID", desWarehouseID);
            var res = this.Query<ams_BaseMaster>("SP_BASE_MATCH_DOCLOCK", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction).FirstOrDefault();
            return res;
        }
        public ams_BaseMaster MatchDocLock(string baseCode, long? docID, VOCriteria buVO)
        {
            return MatchDocLock(baseCode, docID, null, null, null, null, null, buVO);
        }
        public ams_BaseMaster MatchDocLock(string baseCode, DocumentTypeID? docTypeID, long? desCustomerID, VOCriteria buVO)
        {
            return MatchDocLock(baseCode, null, docTypeID, desCustomerID, null, null, null, buVO);
        }

        public List<SPOutSTORootCanUseCriteria> ListRootFree(VOCriteria buVO)
        {

            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            //param.Add("docItemID", docItemID);
            var res = this.Query<SPOutSTORootCanUseCriteria>("SP_STOROOT_LISTFREE", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction);
            return res.ToList();
            //SP_STOROOT_FIND_ISSUED_BYDOCITEM
        }

        public List<SPOutSTORootCanUseCriteria> ListRootCanPicking(long? docItemID, VOCriteria buVO)
        {

            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("docItemID", docItemID);
            var res = this.Query<SPOutSTORootCanUseCriteria>("SP_STOROOT_LISTFREE_FORPICK", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction);
            return res.ToList();
            //SP_STOROOT_FIND_ISSUED_BYDOCITEM
        }
        public List<SPOutSTORootCanUseCriteria> ListBaseInDoc(long? docID, long? docItemID, DocumentTypeID? docTypeID, VOCriteria buVO)
        {

            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("docID", docID);
            param.Add("docItemID", docItemID);
            param.Add("docTypeID", docTypeID);
            var res = this.Query<SPOutSTORootCanUseCriteria>("SP_STOROOT_LIST_IN_DOC", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction).ToList();

            res.ForEach(x =>
            {
                var unitConvertSale = WMSStaticValue.StaticValueManager.GetInstant()
                .ConvertToNewUnitByPack(x.sou_packID, x.distoBaseQtyMax, x.sou_packBaseUnitID, x.distoUnitID);

                x.distoQtyMax = unitConvertSale.newQty;
            });

            return res;
        }
        
        public List<StorageObjectCriteria> ListInDoc(long? docID, long? docItemID, DocumentTypeID? docTypeID, VOCriteria buVO)
        {

            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("docID", docID);
            param.Add("docItemID", docItemID);
            param.Add("docTypeID", docTypeID); 
            List<StorageObjectCriteria> res = new List<StorageObjectCriteria>();
            var stoids = this.Query<SPOutSTORootCanUseCriteria>("SP_STOID_LIST_IN_DOC", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction);
            foreach(var stoid in stoids)
            {
                var sto = this.Get(stoid.rootID, stoid.sou_objectType, false, true, buVO);
                res.Add(sto);
            }

            return res;
        }
        
        public void UpdatePicking(string palletCode, long docItemID, string packCode, string batch, string lot, decimal pickQty, decimal basePickQty, PickingModeType pickMode, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("palletCode", palletCode);
            param.Add("docItemID", docItemID);
            param.Add("packCode", packCode);
            param.Add("batch", batch);
            param.Add("lot", lot);
            param.Add("pickQty", pickQty);
            param.Add("basepickQty", basePickQty);
            param.Add("pickMode", pickMode);
            param.Add("userID", buVO.ActionBy);
            var stoids = this.Query<SPOutSTORootCanUseCriteria>("SP_STO_UPDATE_PICKING", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction);
        }

        public List<amt_StorageObject> ListPallet(string palletCode, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("palletCode", palletCode);
            var res = this.Query<amt_StorageObject>("SP_STO_PALLET", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction).ToList();

            return res;
        }

        public void UpdateAuditing(long stoID, long docItemID, string packCode, decimal auditQty, decimal auditBaseQty, string option ,long parentID, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("stoID", stoID);
            param.Add("docItemID", docItemID);
            param.Add("packCode", packCode);
            param.Add("auditQty", auditQty);
            param.Add("auditBaseQty", auditBaseQty);
            param.Add("userID", buVO.ActionBy);
            param.Add("option", option);
            param.Add("parentID", parentID);

        var stoids = this.Query<SPOutSTORootCanUseCriteria>("SP_STO_UPDATE_AUDIT", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction);
        }

        public List<amt_DocumentItemStorageObject> ListStoBacth(string stoBatch,long docItemID, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("stoBatch", stoBatch);
            param.Add("docItemID", docItemID);
            var res = this.Query<amt_DocumentItemStorageObject>("SP_STO_BATCH_QTY", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction).ToList();

            return res;
        }

        public List<SPOutSTOProcesQueueIssue> StoProcessQueue(string itemCode, int pickOrderBy, string pickBy, string stampDate, string orderNo, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@ITEM_CODE", itemCode);
            param.Add("PICK_ORDER_BY", pickOrderBy);
            param.Add("PICK_BY", pickBy);
            param.Add("LOT", stampDate);
            param.Add("ORDER_NO", orderNo);

            var res = this.Query<SPOutSTOProcesQueueIssue>("SP_STO_PROCESS_QUEUE_ISSUE",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction).ToList();
            return res;
        }

        public List<amt_DocumentItemStorageObject> UpdateAuditSto(long docID, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("docID", docID);
            param.Add("userID", buVO.ActionBy);
            var res = this.Query<amt_DocumentItemStorageObject>("SP_STO_UPDATE_QTY_AUDIT", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction).ToList();

            return res;
        }

        public List<SPOutSTOProcessQueueCriteria> ListByProcessQueue(SPInSTOProcessQueueCriteria search, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("warehouseCode", search.warehouseCode);
            param.Add("locationCode", search.locationCode);
            param.Add("baseCode", search.baseCode);
            param.Add("skuCode", search.skuCode);
            param.Add("forCustomerID", search.forCustomerID);
            param.Add("desCustomerID", search.desCustomerID);
            param.Add("packUnitID", search.packUnitID);
            param.Add("packUnitCode", search.packUnitCode);

            param.Add("useFullPick", search.useFullPick);
            param.Add("useExpireDate", search.useExpireDate); 
            param.Add("useIncubateDate", search.useIncubateDate);
            param.Add("useShelfLifeDate", search.useShelfLifeDate);
            param.Add("eventStatuses", search.eventStatuses.Select(x => (int)x).JoinString());
            param.Add("auditStatuses", search.auditStatuses.Select(x => (int)x).JoinString());
            param.Add("baseQty", search.condition.baseQty);
            param.Add("batch", search.condition.batch);
            param.Add("lot", search.condition.lot);
            param.Add("orderNo", search.condition.orderNo);
            param.Add("options", search.condition.options);
            param.Add("refID", search.condition.refID);
            param.Add("ref1", search.condition.ref1);
            param.Add("ref2", search.condition.ref2);
            param.Add("ref3", search.condition.ref3);
            param.Add("ref4", search.condition.ref4);

            param.Add("orderBys", search.orderBys.Select(x => x.fieldName + " " + x.orderByType.ToString()).JoinString());
            param.Add("not_pstoIDs", search.not_pstoIDs.JoinString());

            
            var res = this.Query<SPOutSTOProcessQueueCriteria>("SP_STO_PROCESS_QUEUE_V3", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction).ToList();

            return res;
        }

        public List<SPOutGetLastPallet> GetLastPallet(string palletCode, string warehouseCode, string areaCode, string locationCode, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("palletCode", palletCode);
            param.Add("warehouseCode", warehouseCode);
            param.Add("areaCode", areaCode);
            param.Add("locationCode", locationCode);

            var res = this.Query<SPOutGetLastPallet>("SP_STO_GET_LASTEST_PALLET",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction).ToList();
            return res;
        }

        public List<SPOutSTOLeftGI> ListLeftSTO(List<long> palletIDs, List<long> packIDs, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("palletIDs", string.Join(",", palletIDs.ToArray()));
            param.Add("packIDs", string.Join(",", packIDs.ToArray()));

            var res = this.Query<SPOutSTOLeftGI>("SP_STO_GET_LEFT_GI",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction).ToList();
            return res;
        }
        public List<SPOutSTOQty> SumSTOQty(string skuCode,long? packID, long areaID, StorageObjectEventStatus eventStatus, EntityStatus status, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("skuCode", skuCode);
            param.Add("packID", packID);
            param.Add("areaID", areaID);
            param.Add("eventStatus", eventStatus);
            param.Add("status", status);

            var res = this.Query<SPOutSTOQty>("SP_STO_SUMQTY",
                                System.Data.CommandType.StoredProcedure,
                                param,
                                buVO.Logger, buVO.SqlTransaction).ToList();
            return res; 
        }
        public List<SPOutSTOQty> SumSTOQty(long areaID, StorageObjectEventStatus eventStatus, EntityStatus status, VOCriteria buVO) {
            return this.SumSTOQty(null,null,  areaID,  eventStatus,  status, buVO);
        }
        public StorageObjectCriteria GetSTONoParent(List<long> stoIDs, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("stoIDs", string.Join(",", stoIDs.ToArray()));

            var values = this.Query<SPOutSTOMiniCriteria>("SP_STO_NO_PARENT", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction)
                    .ToList();

            if (values == null) return null;

            StorageObjectCriteria res = StorageObjectCriteria.GenerateBySP(values,
                StaticValueManager.GetInstant().ObjectSizes,
                StaticValueManager.GetInstant().UnitTypes,
                StaticValueManager.GetInstant().SKUMasterTypes, null);

            return res;
        }

        public List<SPOutLocationCondCriteria> ListLocationCondition(List<long> bsto_ids, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("bsto_ids", string.Join(",", bsto_ids.ToArray()));
            var res = this.Query<SPOutLocationCondCriteria>("SP_LOCATIONCONDITION_PROCESS", 
                CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction).ToList();

            return res;
        }

    }

}
