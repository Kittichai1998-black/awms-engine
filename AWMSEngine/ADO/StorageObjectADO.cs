using AMWUtil.Common;
using AMWUtil.Logger;
using AWMSEngine.ADO.StaticValue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO
{
    public class StorageObjectADO : BaseMSSQLAccess<StorageObjectADO>
    {
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

            /*values.Clear();
            values.Add(new SPOutSTOMiniCriteria() { id = 450, code="TEST", type = (StorageObjectType)0, mstID = 450, objectSizeID = 1, parentID = null, parentType = null });
            values.Add(new SPOutSTOMiniCriteria() { id = 443, type = (StorageObjectType)1, mstID = 1719, objectSizeID = 5, parentID = 450, parentType = StorageObjectType.LOCATION });
            values.Add(new SPOutSTOMiniCriteria() { id = 448, type = (StorageObjectType)2, mstID = 71, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 450, type = (StorageObjectType)2, mstID = 74, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 452, type = (StorageObjectType)2, mstID = 272, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 453, type = (StorageObjectType)2, mstID = 88, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 454, type = (StorageObjectType)2, mstID = 88, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 458, type = (StorageObjectType)2, mstID = 107, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 460, type = (StorageObjectType)2, mstID = 88, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 462, type = (StorageObjectType)2, mstID = 107, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 465, type = (StorageObjectType)2, mstID = 88, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 466, type = (StorageObjectType)2, mstID = 272, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 468, type = (StorageObjectType)2, mstID = 88, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 470, type = (StorageObjectType)2, mstID = 107, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 471, type = (StorageObjectType)2, mstID = 226, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 473, type = (StorageObjectType)2, mstID = 240, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 475, type = (StorageObjectType)2, mstID = 106, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 477, type = (StorageObjectType)2, mstID = 92, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 479, type = (StorageObjectType)2, mstID = 272, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 481, type = (StorageObjectType)2, mstID = 75, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 482, type = (StorageObjectType)2, mstID = 239, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 483, type = (StorageObjectType)2, mstID = 273, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 484, type = (StorageObjectType)2, mstID = 190, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 485, type = (StorageObjectType)2, mstID = 74, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 486, type = (StorageObjectType)2, mstID = 106, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 487, type = (StorageObjectType)2, mstID = 89, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 488, type = (StorageObjectType)2, mstID = 72, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 489, type = (StorageObjectType)2, mstID = 74, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 490, type = (StorageObjectType)2, mstID = 89, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 491, type = (StorageObjectType)2, mstID = 90, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 492, type = (StorageObjectType)2, mstID = 75, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 493, type = (StorageObjectType)2, mstID = 89, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 494, type = (StorageObjectType)2, mstID = 75, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 495, type = (StorageObjectType)2, mstID = 274, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 496, type = (StorageObjectType)2, mstID = 272, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 497, type = (StorageObjectType)2, mstID = 277, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 498, type = (StorageObjectType)2, mstID = 124, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 499, type = (StorageObjectType)2, mstID = 71, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 500, type = (StorageObjectType)2, mstID = 74, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 501, type = (StorageObjectType)2, mstID = 72, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 502, type = (StorageObjectType)2, mstID = 106, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 503, type = (StorageObjectType)2, mstID = 122, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 504, type = (StorageObjectType)2, mstID = 272, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 505, type = (StorageObjectType)2, mstID = 272, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 506, type = (StorageObjectType)2, mstID = 272, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 507, type = (StorageObjectType)2, mstID = 272, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 508, type = (StorageObjectType)2, mstID = 272, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            values.Add(new SPOutSTOMiniCriteria() { id = 509, type = (StorageObjectType)2, mstID = 71, objectSizeID = 8, parentID = 443, parentType = StorageObjectType.BASE });
            */
            StorageObjectCriteria res = StorageObjectCriteria.Generate(values, StaticValueManager.GetInstant().ObjectSizes, code);
            return res;
        }
        public StorageObjectCriteria GetFree(string code, long? warehouseID, long? areaID, bool isInStorage, bool isToChild, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@code", code);
            param.Add("@warehouseID", warehouseID);
            param.Add("@areaID", areaID);
            param.Add("@isInStorage", isInStorage);
            param.Add("@isToChild", isToChild);
            var r = this.Query<SPOutSTOMiniCriteria>("SP_STO_GETFREE_BYCODE", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction)
                    .ToList();

            if (r == null) return null;

            StorageObjectCriteria res = StorageObjectCriteria.Generate(r, StaticValueManager.GetInstant().ObjectSizes, code);
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


            if (r == null) return null;

            StorageObjectCriteria res = StorageObjectCriteria.Generate(r, StaticValueManager.GetInstant().ObjectSizes, id);
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

        public int GetFreeCount(string code, long? warehouseID, long? areaID, bool isInStorage, string batch, string lot, VOCriteria buVO)
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
            EntityStatus? toStatus = StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<StorageObjectEventStatus>(toEventStatus);
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("rootid", stoRootID);
            param.Add("fromEventStatus", fromEventStatus);
            param.Add("fromStatus", fromStatus);
            param.Add("toEventStatus", toEventStatus);
            param.Add("toStatus", toStatus);
            param.Add("actionBy", buVO.ActionBy);
            var res = this.Execute(
                "SP_STO_UPDATE_STATUS_TO_CHILD",
                System.Data.CommandType.StoredProcedure,
                param,
                buVO.Logger,
                buVO.SqlTransaction);
            return res;
        }

        public long Create(StorageObjectCriteria sto, long areaID, string batch, string lot, VOCriteria buVO)
        {
            sto.id = null;
            return this.Put(sto, areaID, batch, lot, buVO);
        }
        public long Create(StorageObjectCriteria sto, string batch, string lot, VOCriteria buVO)
        {
            sto.id = null;
            return this.Put(sto, sto.areaID, batch, lot, buVO);
        }
        public long Update(StorageObjectCriteria sto, long areaID, VOCriteria buVO)
        {
            return this.Put(sto, areaID, null, null, buVO);
        }
        public long Update(StorageObjectCriteria sto, VOCriteria buVO)
        {
            return this.Put(sto, sto.areaID, null, null, buVO);
        }
        private long Put(StorageObjectCriteria sto, long areaID, string batch, string lot, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("id", sto.id);
            param.Add("type", sto.type);
            param.Add("mstID", sto.mstID);
            param.Add("areaID", areaID);
            //param.Add("code", sto.code);
            param.Add("parentID", sto.parentID);
            param.Add("parentType", sto.parentType);
            param.Add("options", ObjectUtil.ListKeyToQueryString(sto.options));
            param.Add("batch", batch);
            param.Add("lot", lot);
            param.Add("actionBy", buVO.ActionBy);
            param.Add("resID", null, System.Data.DbType.Int64, System.Data.ParameterDirection.Output);
            var r = this.Query<int>("SP_STO_PUT", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction)
                    .ToList();
            sto.id = param.Get<long>("resID");
            return sto.id.Value;
        }
        public long PutV2(StorageObjectCriteria sto,VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("id", sto.id);
            param.Add("type", sto.type);
            param.Add("mstID", sto.mstID);
            param.Add("areaID", sto.areaID);
            param.Add("eventStatus", sto.eventStatus);
            param.Add("status", StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<StorageObjectEventStatus>(sto.eventStatus));
            param.Add("parentID", sto.parentID);
            param.Add("parentType", sto.parentType);
            param.Add("options", ObjectUtil.ListKeyToQueryString(sto.options));
            param.Add("batch", sto.batch);
            param.Add("lot", sto.lot);
            param.Add("actionBy", buVO.ActionBy);
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
                var sto = this.Get(stoid.rootID, stoid.objectType, false, true, buVO);
                res.Add(sto);
            }

            return res;
        }
        
    }

}
