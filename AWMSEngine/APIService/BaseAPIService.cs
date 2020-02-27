using AMWUtil.Common;
using AMWUtil.DataAccess.Http;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO;
using AWMSEngine.Engine.V2.General;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Dynamic;
using System.Linq;
using System.Threading;

namespace AWMSEngine.APIService
{
    public abstract class BaseAPIService
    {
        public long APIServiceID;
        public VOCriteria BuVO { get; set; }
        public ControllerBase ControllerAPI { get; set; }
        public dynamic RequestVO { get => this.BuVO.GetDynamic(BusinessVOConst.KEY_REQUEST); }
        public FinalDatabaseLogCriteria FinalDBLog { get => (FinalDatabaseLogCriteria)this.BuVO.GetDynamic(BusinessVOConst.KEY_FINAL_DB_LOG); }
        public bool IsAuthenAuthorize { get; set; }
        public bool IsJsonResponse { get; set; }

        public AMWLogger Logger { get; set; }

        protected abstract dynamic ExecuteEngineManual();

        public BaseAPIService(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true, bool isJsonResponse = true)
        {
            this.IsAuthenAuthorize = isAuthenAuthorize;
            this.IsJsonResponse = isJsonResponse;
            this.ControllerAPI = controllerAPI;
            this.APIServiceID = apiServiceID;
        }
        public BaseAPIService()
        {
            this.IsAuthenAuthorize = false;
            this.IsJsonResponse = true;
            this.ControllerAPI = null;
            this.APIServiceID = 0;
        }

        public void BeginTransaction()
        {
            this.BuVO.SqlTransaction_Begin();
        }
        public void RollbackTransaction()
        {
            this.BuVO.SqlTransaction_Rollback();
        }
        public void CommitTransaction()
        {
            this.BuVO.SqlTransaction_Commit();
        }

        private class _GetKey
        {
            public string token;
            public string _token;
            public string apikey;
            public string _apikey;
        }

        public dynamic Execute(dynamic request, int retryCountdown = 1)
        {
            dynamic response = null;
            dynamic result = new ExpandoObject();
            long dbLogID = 0;
            string token = null;
            string apiKey = null;
            ams_APIKey apiKeyInfo = null;

            try
            {
                this.BuVO = new VOCriteria();
                //------GET token || apikey
                if (request != null)
                {
                    string _getKeyJson = Newtonsoft.Json.JsonConvert.SerializeObject(request);
                    _GetKey getKey = Newtonsoft.Json.JsonConvert.DeserializeObject<_GetKey>(_getKeyJson);

                    token = !string.IsNullOrWhiteSpace(getKey.token) ? getKey.token : getKey._token;
                    apiKey = !string.IsNullOrWhiteSpace(getKey.apikey) ? getKey.apikey : getKey._apikey;
                }

                //-------CREATE FILE LOGGING
                amt_Token tokenInfo = null; 
                if (!string.IsNullOrWhiteSpace(token))
                {
                    tokenInfo = ADO.DataADO.GetInstant().SelectBy<amt_Token>("token", token, this.BuVO).FirstOrDefault();
                    if (tokenInfo != null)
                    {
                        var user = ADO.DataADO.GetInstant().SelectByID<ams_User>(tokenInfo.User_ID, this.BuVO);
                        this.Logger = AMWLoggerManager.GetLogger(user.Code, this.GetType().Name);
                    }
                }
                else if (!string.IsNullOrWhiteSpace(apiKey))
                {
                    apiKeyInfo = ADO.DataADO.GetInstant().SelectBy<ams_APIKey>("APIKey", apiKey, this.BuVO).FirstOrDefault();
                    if (apiKeyInfo != null)
                        this.Logger = AMWLoggerManager.GetLogger(apiKeyInfo.APIKey, this.GetType().Name, apiKeyInfo.IsLogging);
                }
                if (this.Logger == null)
                {
                    this.Logger = AMWLoggerManager.GetLogger("(no_key)", this.GetType().Name);
                }
                this.BuVO.Set(BusinessVOConst.KEY_DB_CONNECTION, ADO.BaseMSSQLAccess<DataADO>.GetInstant().CreateConnection());
                this.BuVO.Set(BusinessVOConst.KEY_LOGGER, this.Logger);


                //-------START FILE LOGGING
                this.Logger.LogInfo("############## START_TRANSACTION ##############");
                string _request_str = ObjectUtil.Json(request);
                this.Logger.LogInfo("request=" + _request_str);
                this.BuVO.Set(BusinessVOConst.KEY_RESULT_API, result);
                this.BuVO.Set(BusinessVOConst.KEY_REQUEST, request);
                this.BuVO.Set(BusinessVOConst.KEY_TOKEN, token);
                this.BuVO.Set(BusinessVOConst.KEY_APIKEY, apiKey);
                this.BuVO.Set(BusinessVOConst.KEY_FINAL_DB_LOG,
                    new FinalDatabaseLogCriteria()
                    {
                        documentOptionMessages = new List<FinalDatabaseLogCriteria.DocumentOptionMessage>(),
                        sendAPIEvents = new List<HttpResultModel>()
                    });

                //-----------VALIDATE SERVICE
                var apiService = ADO.StaticValue.StaticValueManager.GetInstant().APIServices.FirstOrDefault(x => x.ID == this.APIServiceID);
                if (apiService == null)
                {
                    apiService = ADO.StaticValue.StaticValueManager.GetInstant().APIServices.FirstOrDefault(x => x.FullClassName == this.GetType().FullName);
                    if (apiService == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Service Class '" + this.GetType().FullName + "' is not Found");
                }


                //-----------START DB LOGGING
                this.APIServiceID = apiService.ID.Value;

                if (apiKeyInfo == null || apiKeyInfo.IsLogging)
                {
                    dbLogID = ADO.LogingADO.GetInstant().BeginAPIService(
                        this.APIServiceID,
                        this.GetType().Name,
                        this.ControllerAPI == null ? string.Empty : this.ControllerAPI.HttpContext.Request.Headers["Referer"].ToString(),
                        this.ControllerAPI == null ? string.Empty : this.ControllerAPI.HttpContext.Connection.RemoteIpAddress.ToString(),
                        this.ControllerAPI == null ? string.Empty : this.ControllerAPI.HttpContext.Connection.LocalIpAddress.ToString(),
                        System.Environment.MachineName,
                        this.RequestVO,
                        this.BuVO);
                }

                //-----------VALIDATE PERMISSION
                this.Permission(token, tokenInfo, apiKey, apiKeyInfo);
                
                var res = this.ExecuteEngineManual();

                if (this.IsJsonResponse)
                    response = new ResponseObject().Execute(this.Logger, this.BuVO, res);
                else
                    response = res;

                result.status = 1;
                result.code = AMWExceptionCode.I0000.ToString();
                result.message = "Success";
                result.stacktrace = string.Empty;
                result.logref = this.Logger.LogRefID;
                this.BuVO.SqlTransaction_Commit();
            }
            catch (AMWException ex)
            {
                this.BuVO.SqlTransaction_Rollback();
                result.status = 0;
                result.code = ex.GetAMWCode();
                result.message = ex.GetAMWMessage();
                result.stacktrace = ex.StackTrace;
                result.logref = this.Logger == null ? string.Empty : this.Logger.LogRefID;
            }
            catch (SqlException ex) when (ex.Number == 1205)
            {
                this.BuVO.SqlTransaction_Rollback();
                var e = new AMWException(this.Logger, AMWExceptionCode.S0004, ex.Message, new AMWExceptionSourceChild(ex));
                this.Logger.LogError(ex.StackTrace);
                result.status = retryCountdown > 0 ? -1 : 0;
                result.code = e.GetAMWCode();
                result.message = e.GetAMWMessage();
                result.stacktrace = ex.StackTrace;
                result.logref = this.Logger == null ? string.Empty : this.Logger.LogRefID;
            }
            catch (Exception ex)
            {
                this.BuVO.SqlTransaction_Rollback();
                var e = new AMWException(this.Logger, AMWExceptionCode.U0000, ex.Message, new AMWExceptionSourceChild(ex));
                this.Logger.LogError(ex.StackTrace);
                result.status = 0;
                result.code = e.GetAMWCode();
                result.message = e.GetAMWMessage();
                result.stacktrace = ex.StackTrace;
                result.logref = this.Logger == null ? string.Empty : this.Logger.LogRefID;
            }
            finally
            {
                this.BuVO.SqlConnection_Close();
                try
                {
                    //response = this.BuVO.GetDynamic(BusinessVOConst.KEY_RESPONSE);
                    if (response == null)
                    {
                        response = new { _result = this.BuVO.GetDynamic(BusinessVOConst.KEY_RESULT_API) };
                    }

                    if (apiKeyInfo == null || apiKeyInfo.IsLogging)
                    {
                        int _status = result.status;
                        string _code = result.code;
                        string _message = result.message;
                        string _stacktrace = result.stacktrace;
                        this.FinalDBLog.sendAPIEvents.ForEach(x =>
                        {
                            ADO.LogingADO.GetInstant().PutSendAPIEvent(x, this.BuVO);
                        });
                        this.FinalDBLog.documentOptionMessages.ForEach(x =>
                        {
                            ADO.LogingADO.GetInstant().PutDocumentAlertMessage(x, this.BuVO);
                        });
                        if(dbLogID != 0)
                            ADO.LogingADO.GetInstant().EndAPIService(dbLogID, response, _status, _code, _message, _stacktrace, this.BuVO);
                    }

                    string _response_str = ObjectUtil.Json(response);
                    this.Logger.LogInfo("response=" + _response_str);
                    this.Logger.LogInfo("############## END_TRANSACTION ##############");

                    if (!string.IsNullOrEmpty(apiKey))
                        result.stacktrace = null;
                }
                catch (Exception ex)
                {
                    this.Logger.LogFatal("Finally Exception : " + ex.Message);
                }


            }

            if (this.IsJsonResponse && (int)response._result.status == -1)
            {
                this.Logger.LogFatal("############## RETRY_DEADLOCK_TRANSACTION ##############");
                this.Logger.LogFatal("##############       SLEEP 1000 MS        ##############");
                Thread.Sleep(1000);
                return this.Execute(request, retryCountdown - 1);
            }
            else
                return response;
        }

        //private void Permission(string token, string apiKey, int APIServiceID)
        //{
        //    throw new NotImplementedException();
        //}


        protected void Permission(string token,amt_Token tokenInfo,string apiKey, ams_APIKey apiKeyInfo)
        {
            //var tokenInfo = !string.IsNullOrEmpty(token) ? ADO.DataADO.GetInstant().SelectBy<amt_Token>("token", token, this.BuVO).FirstOrDefault() : null;
            this.BuVO.Set(BusinessVOConst.KEY_TOKEN_INFO, tokenInfo);
            this.Logger.LogInfo("token=" + token);

            this.BuVO.Set(BusinessVOConst.KEY_APIKEY_INFO, apiKeyInfo);
            this.Logger.LogInfo("apikey=" + apiKey);

            if (!this.IsAuthenAuthorize)
                return;
            this.Logger.LogInfo("AuthenAuthorize!");

            ADO.TokenADO.GetInstant().Authen(token, apiKey, this.APIServiceID, this.BuVO);

            if (!string.IsNullOrEmpty(apiKey) && apiKeyInfo == null)
                throw new AMWException(this.Logger, AMWExceptionCode.A0001, "API Key Not Found");
            if (!string.IsNullOrEmpty(token) && tokenInfo == null)
                throw new AMWException(this.Logger, AMWExceptionCode.A0001, "Token Not Found");
            if (tokenInfo == null && apiKeyInfo == null)
                throw new AMWException(this.Logger, AMWExceptionCode.A0001, "Key Not Found");

            if (tokenInfo != null)
            {
                if (DateTime.Now > tokenInfo.ExpireTime)
                    throw new AMWException(this.Logger, AMWExceptionCode.A0001, "Token Expire");
            }

            var userInfo = ADO.DataADO.GetInstant().SelectByID<ams_User>(tokenInfo != null ? tokenInfo.User_ID : apiKeyInfo.User_ID, this.BuVO);
            if (userInfo != null)
                this.Logger.LogInfo("username=" + userInfo.Code);
        }
    }
}
