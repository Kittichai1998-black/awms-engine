using AMWUtil.Common;
using AMWUtil.Logger;
using AWMSEngine.ADO.StaticValue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Criteria.SP.Response;
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
        public StorageObjectCriteria Get(string code, int warehouseID, int? areaID, bool isToRoot, bool isToChild, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@code", code);
            param.Add("@warehouseID", warehouseID);
            param.Add("@areaID", areaID);
            param.Add("@isToRoot", isToRoot);
            param.Add("@isToChild", isToChild);
            var r = this.Query<SPOutSTOMiniCriteria>("SP_STO_GET_BYCODE", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction)
                    .ToList();

            if (r == null) return null;
            StorageObjectCriteria res = StorageObjectCriteria.Generate(r, StaticValueManager.GetInstant().ObjectSizes, code);
            return res;
        }
        public StorageObjectCriteria GetFree(string code, int warehouseID, int? areaID, bool isInStorage, bool isToChild, VOCriteria buVO)
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

        public int GetFreeCount(string code, int warehouseID, int? areaID, bool isInStorage, string batch, string lot, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("code", code);
            param.Add("warehouseID", warehouseID);
            param.Add("areaID", areaID);
            param.Add("isInStorage", isInStorage);
            param.Add("batch", batch);
            param.Add("lot", lot);
            param.Add("res", null, System.Data.DbType.Int32, System.Data.ParameterDirection.Output);
            this.Query<int>("SP_STO_FREE_COUNT", System.Data.CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction);
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
            StorageObjectEventStatus? fromEventStatus, EntityStatus? fromStatus, StorageObjectEventStatus? toEventStatus, EntityStatus? toStatus, 
            VOCriteria buVO)
        {
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

        public long Create(StorageObjectCriteria sto, int areaID, string batch, string lot, VOCriteria buVO)
        {
            sto.id = null;
            return this.Put(sto, areaID, batch, lot, buVO);
        }
        public long Update(StorageObjectCriteria sto, int areaID, VOCriteria buVO)
        {
            return this.Put(sto, areaID, null, null, buVO);
        }
        private long Put(StorageObjectCriteria sto, int areaID, string batch, string lot, VOCriteria buVO)
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
            param.Add("resID", null, System.Data.DbType.Int32, System.Data.ParameterDirection.Output);
            var r = this.Query<int>("SP_STO_PUT", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction)
                    .ToList();
            sto.id = param.Get<int>("resID");
            return sto.id.Value;
        }
        public List<StorageObjectFullCriteria> Search(SPInSTOSearchCriteria search, VOCriteria buVO)
        {
            var param = this.CreateDynamicParameters(search);
            var qry = this.Query<StorageObjectFullCriteria>("SP_STO_SEARCH", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction).ToList();
            List<StorageObjectFullCriteria> res = StorageObjectFullCriteria.Generate(qry);
            return res;
        }
    }

}
