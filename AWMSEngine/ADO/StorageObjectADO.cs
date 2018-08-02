using AMWUtil.Common;
using AMWUtil.Logger;
using AWMSEngine.ADO.StaticValue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
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
        public StorageObjectCriteria Get(string code, bool isToRoot, bool isToChild, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@code", code);
            param.Add("@isToRoot", isToRoot);
            param.Add("@isToChild", isToChild);
            var r = this.Query<SPStorageObjectCriteria>("SP_STO_GET_BYCODE", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction)
                    .ToList();

            if (r == null) return null;
            StorageObjectCriteria res = StorageObjectCriteria.Generate(r, StaticValueManager.GetInstant().ObjectSizes, code);
            return res;
        }
        public StorageObjectCriteria GetFree(string code, bool isInStorage, bool isToChild, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@code", code);
            param.Add("@isInStorage", isInStorage);
            param.Add("@isToChild", isToChild);
            var r = this.Query<SPStorageObjectCriteria>("SP_STO_GETFREE_BYCODE", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction)
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
            var r = this.Query<SPStorageObjectCriteria>("SP_STO_GET_BYID", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction)
                    .ToList();

            if (r == null) return null;
            StorageObjectCriteria res = StorageObjectCriteria.Generate(r, StaticValueManager.GetInstant().ObjectSizes, id);
            return res;
        }
        public int GetRootID(string code, StorageObjectType rootType, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("code", code);
            param.Add("rootType", rootType);
            param.Add("rootID", System.Data.ParameterDirection.Output);
            this.Query<int>("SP_STO_GETROOTID", System.Data.CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction);
            return param.Get<int>("rootID");
        }
        public int GetFreeCount(string code, bool isInStorage, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("code", code);
            param.Add("isInStorage", isInStorage);
            param.Add("res", null, System.Data.DbType.Int32, System.Data.ParameterDirection.Output);
            this.Query<int>("SP_STO_FREE_COUNT", System.Data.CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction);
            return param.Get<int>("res");
        }
        public long ReceivingConfirm(long id, StorageObjectType type, bool isConfirm, VOCriteria buVO)
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
        }

        public long Put(StorageObjectCriteria sto, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("id", sto.id);
            param.Add("type", sto.type);
            param.Add("mstID", sto.mstID);
            //param.Add("code", sto.code);
            param.Add("parentID", sto.parentID);
            param.Add("parentType", sto.parentType);
            param.Add("options", ObjectUtil.ListKeyToQueryString(sto.options));
            param.Add("actionBy", buVO.ActionBy);
            param.Add("resID", null, System.Data.DbType.Int32, System.Data.ParameterDirection.Output);
            var r = this.Query<int>("SP_STO_PUT", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction)
                    .ToList();
            sto.id = param.Get<int>("resID");
            return sto.id.Value;
        }
    }

}
