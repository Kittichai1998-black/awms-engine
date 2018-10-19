using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO;
using AWMSEngine.Engine.General;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService
{
    public abstract class BaseAPIService
    {
        public int APIServiceID() { return 0; }
        public VOCriteria BuVO { get; set; }
        public ControllerBase ControllerAPI { get; set; }
        public dynamic RequestVO { get => this.BuVO.GetDynamic(BusinessVOConst.KEY_REQUEST); }

        public AMWLogger Logger { get; set; }

        protected abstract dynamic ExecuteEngineManual();

        public BaseAPIService(ControllerBase controllerAPI)
        {
            this.ControllerAPI = controllerAPI;
        }

        private SqlConnection _SqlConnection = null;
        protected void BeginTransaction()
        {
            this.RollbackTransaction();
            var trans = ADO.BaseMSSQLAccess<ADO.DataADO>.GetInstant().CreateTransaction(this.Logger.LogRefID);
            this._SqlConnection = trans.Connection;
            this.BuVO.Set(BusinessVOConst.KEY_DB_TRANSACTION, trans);
        }
        protected void CommitTransaction()
        {
            var trans = this.BuVO.SqlTransaction;
            if (trans !=null && trans.Connection != null && trans.Connection.State == System.Data.ConnectionState.Open)
            {
                var conn = trans.Connection;
                trans.Commit();
                trans.Dispose();
                if (conn != null)
                    conn.Close();
                this.BuVO.SqlTransaction = null;
                this._SqlConnection = null;
            }
        }
        protected void RollbackTransaction()
        {
            var trans = this.BuVO.SqlTransaction;
            if (trans != null && trans.Connection != null && trans.Connection.State == System.Data.ConnectionState.Open)
            {
                var conn = trans.Connection;
                trans.Rollback();
                trans.Dispose();
                if (conn != null)
                    conn.Close();
                this.BuVO.SqlTransaction = null;
                this._SqlConnection = null;
            }
        }



        public dynamic Execute(dynamic request)
        {
            this.BuVO = new VOCriteria();
            dynamic response = new { };
            dynamic result = new ExpandoObject();
            long dbLogID = 0;
            try
            {
                var getKey = ObjectUtil.QueryStringToObject(this.ControllerAPI.Request.QueryString.Value);
                string token = null;
                string apiKey = null;
                try
                {
                    if (getKey._apiKey != null)
                        apiKey = getKey._apiKey;
                    if (RequestVO._apiKey != null)
                        apiKey = RequestVO._apiKey;
                    if (!string.IsNullOrWhiteSpace(apiKey))
                    {
                        this.Logger = AMWLoggerManager.GetLogger(apiKey, this.GetType().Name);
                    }
                    else
                    {
                        apiKey = null;
                    }
                    if (getKey._token != null)
                        token = getKey._token;
                    if (RequestVO._token != null)
                        token = RequestVO._token;
                    if (!string.IsNullOrWhiteSpace(token))
                    {
                        this.Logger = AMWLoggerManager.GetLogger(token, this.GetType().Name);
                    }
                    else
                    {
                        token = null;
                    }
                }
                catch {
                    this.Logger = AMWLoggerManager.GetLogger("notkey", this.GetType().Name);
                }
                
                this.BuVO.Set(BusinessVOConst.KEY_LOGGER, this.Logger);
                this.Logger.LogBegin();
                dbLogID = ADO.LogingADO.GetInstant().BeginAPIService(
                    this.APIServiceID(),
                    this.ControllerAPI.HttpContext.Connection.RemoteIpAddress.ToString(),
                    this.ControllerAPI.HttpContext.Connection.LocalIpAddress.ToString(),
                    System.Environment.MachineName,
                    this.RequestVO,
                    this.BuVO);
                this.BuVO.Set(BusinessVOConst.KEY_DB_LOGID, dbLogID);
                this.BuVO.Set(BusinessVOConst.KEY_RESULT_API, result);

                this.BuVO.Set(BusinessVOConst.KEY_REQUEST, request);
                this.Logger.LogInfo("request : " + ObjectUtil.Json(request));

                this.BuVO.Set(BusinessVOConst.KEY_TOKEN, token);
                this.Logger.LogInfo("token : " + token);

                this.BuVO.Set(BusinessVOConst.KEY_APIKEY, apiKey);
                this.Logger.LogInfo("apikey : " + apiKey);

                this.Logger.LogInfo("[BeginExecuteEngineManual]");
                var res = this.ExecuteEngineManual();
                this.Logger.LogInfo("[EndExecuteEngineManual]");
                //if (res == null)
                //    throw new AMWException(this.Logger, AMWExceptionCode.V3001, "Response API");
                var resAPI = new ResponseObject().Execute(this.Logger, this.BuVO, res);
                result.status = 1;
                result.code = AMWExceptionCode.I0000.ToString();
                result.message = "Success";
                result.stacktrace = string.Empty;
                this.CommitTransaction();
            }
            catch (AMWException ex)
            {
                result.status = 0;
                result.code = ex.GetAMWCode();
                result.message = ex.GetAMWMessage();
                result.stacktrace = ex.StackTrace;
                this.RollbackTransaction();
            }
            catch (Exception ex)
            {
                var e = new AMWException(this.Logger, AMWExceptionCode.U0000, ex.Message);
                result.status = 0;
                result.code = e.GetAMWCode();
                result.message = e.GetAMWMessage();
                result.stacktrace = ex.StackTrace;
                this.Logger.LogError(ex.StackTrace);
                this.RollbackTransaction();
            }
            finally
            {
                this.RollbackTransaction();
                response = this.BuVO.GetDynamic(BusinessVOConst.KEY_RESPONSE);
                if (response == null)
                {
                    response = new { _result = this.BuVO.GetDynamic(BusinessVOConst.KEY_RESULT_API) };
                }
                this.Logger.LogInfo("API Response : " + ObjectUtil.Json(response));
                this.Logger.LogEnd();
                int _status = result.status;
                string _code = result.code;
                string _message = result.message;
                string _stacktrace = result.stacktrace;
                ADO.LogingADO.GetInstant().EndAPIService(dbLogID, _status, _code, _message, _stacktrace, this.BuVO);
            }
            return response;
        }
    }
}
