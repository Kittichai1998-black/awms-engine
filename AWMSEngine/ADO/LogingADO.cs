using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO
{
    public class LogingADO : BaseMSSQLAccess<LogingADO>
    {
        public long BeginAPIService(int? serviceID,string url, string ipRemote, string ipLocal, string serverName, object request, VOCriteria buVO)
        {
            var service = StaticValue.StaticValueManager.GetInstant().APIServices.FirstOrDefault(x => x.ID == serviceID);
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@LogRefID", buVO.Logger.LogRefID);
            param.Add("@Token", buVO.Get<string>(AWMSModel.Constant.StringConst.BusinessVOConst.KEY_TOKEN));
            param.Add("@APIKey ", buVO.Get<string>(AWMSModel.Constant.StringConst.BusinessVOConst.KEY_APIKEY));
            param.Add("@APIService_ID ", service != null ? service.ID : null);
            param.Add("@APIService_Code ", service != null ? service.ID : null);
            param.Add("@APIService_Name ", service != null ? service.ID : null);
            param.Add("@IPRemote", ipRemote);
            param.Add("@IPLocal", ipLocal);
            param.Add("@ServerName ", serverName);
            param.Add("@InputText ", AMWUtil.Common.ObjectUtil.Json(request));
            param.Add("@Url ", url);
            param.Add("@ActionBy", buVO.ActionBy);
            param.Add("@ID", null, System.Data.DbType.Int64, System.Data.ParameterDirection.InputOutput);
            this.Execute("SP_LOG_APISERVICE_EVENT", System.Data.CommandType.StoredProcedure, param, buVO.Logger);
            long id = param.Get<long>("@ID");
            return id;
        }
        public long EndAPIService(long logID, int resultStatus, string resultCode, string resultMessage, string techMessage, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();

            param.Add("@ResultStatus", resultStatus);
            param.Add("@ResultCode", resultCode);
            param.Add("@ResultMessage ", resultMessage);
            param.Add("@TechMessage ", techMessage);
            param.Add("@ID", logID, System.Data.DbType.Int64, System.Data.ParameterDirection.InputOutput);
            this.Execute("SP_LOG_APISERVICE_EVENT", System.Data.CommandType.StoredProcedure, param, buVO.Logger);
            long id = param.Get<long>("@ID");
            return id;
        }

        public long BeginAPIServiceAction(long logID, string className, object request, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@APIServiceEvent_ID", logID);
            param.Add("@ClassName", className);
            param.Add("@InputText ", AMWUtil.Common.ObjectUtil.Json(request));
            param.Add("@ID", null, System.Data.DbType.Int64, System.Data.ParameterDirection.InputOutput);
            this.Execute("SP_LOG_APISERVICE_ACTION_EVENT", System.Data.CommandType.StoredProcedure, param, buVO.Logger);
            long id = param.Get<long>("@ID");
            return id;
        }
        public long EndAPIServiceAction(long logActionID, int resultStatus, string resultCode, string resultMessage, string techMessage, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();

            param.Add("@ResultStatus", resultStatus, System.Data.DbType.Int32);
            param.Add("@ResultCode", resultCode, System.Data.DbType.String);
            param.Add("@ResultMessage ", resultMessage, System.Data.DbType.String);
            param.Add("@TechMessage ", techMessage, System.Data.DbType.String);
            param.Add("@ID", logActionID, System.Data.DbType.Int64, System.Data.ParameterDirection.InputOutput);
            this.Execute("SP_LOG_APISERVICE_ACTION_EVENT", System.Data.CommandType.StoredProcedure, param, buVO.Logger);
            long id = param.Get<long>("@ID");
            return id;
        }

        /*public long STOEvent(long? documentItemID, long? storageObjectID, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("LogRefID", buVO.Logger.LogRefID);
            param.Add("TokenID", buVO.Get<string>(AWMSModel.Constant.StringConst.BusinessVOConst.KEY_TOKEN));
            param.Add("DocumentItem_ID ", documentItemID);
            param.Add("Des_StorageObject_ID ", storageObjectID);
            param.Add("ActionBy", buVO.ActionBy);

            int res = this.Execute("SP_LOG_STO_EVENT", System.Data.CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction);
            return res;
        }*/
        /*public long STOEvent(StorageObjectEventCriteria log,VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("ActionCommand", log.ActionCommand);
            param.Add("Des_AreaLocationMaster_ID", log.Des_AreaLocationMaster_ID);
            param.Add("Des_AreaMaster_ID ", log.Des_AreaMaster_ID);
            param.Add("Des_BaseMaster_ID ", log.Des_BaseMaster_ID);
            param.Add("Des_Branch_ID ", log.Des_Branch_ID);
            param.Add("Des_PackMaster_ID ", log.Des_PackMaster_ID);
            param.Add("Des_ParentStorageObject_ID ", log.Des_ParentStorageObject_ID);
            param.Add("Des_RootStorageObject_ID ", log.Des_RootStorageObject_ID);
            param.Add("Des_SKUMaster_ID ", log.Des_SKUMaster_ID);
            param.Add("Des_StorageObject_ID ", log.Des_StorageObject_ID);
            param.Add("Des_Warehouse_ID ", log.Des_Warehouse_ID);
            param.Add("DocumentItem_ID", log.DocumentItem_ID);
            param.Add("Document_ID ", log.Document_ID);
            param.Add("Sou_AreaLocationMaster_ID ", log.Sou_AreaLocationMaster_ID);
            param.Add("Sou_AreaMaster_ID ", log.Sou_AreaMaster_ID);
            param.Add("Sou_BaseMaster_ID", log.Sou_BaseMaster_ID);
            param.Add("Sou_Branch_ID", log.Sou_Branch_ID);
            param.Add("Sou_PackMaster_ID", log.Sou_PackMaster_ID);
            param.Add("Sou_ParentStorageObject_ID", log.Sou_ParentStorageObject_ID);
            param.Add("Sou_RootStorageObject_ID", log.Sou_RootStorageObject_ID);
            param.Add("Sou_SKUMaster_ID", log.Sou_SKUMaster_ID);
            param.Add("Sou_StorageObject_ID", log.Sou_StorageObject_ID);
            param.Add("Sou_Warehouse_ID", log.Sou_Warehouse_ID);
            
            param.Add("ResultStatus", log.Sou_Warehouse_ID);
            param.Add("ResultCode", log.Sou_Warehouse_ID);
            param.Add("ResultMessage", log.Sou_Warehouse_ID);
            param.Add("TechMessage", log.Sou_Warehouse_ID);
            param.Add("ActionBy", buVO.ActionBy);

            int res = this.Execute("SP_LOG_STO_PUT", System.Data.CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction);
            return res;
        }*/
    }
}
