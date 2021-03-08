using AMWUtil.Common;
using AMWUtil.DataAccess.Http;
using AMWUtil.Exception;
using AMWUtil.Logger;

using ADO.WMSDB;
using AWMSEngine.Controllers.V2;
using AWMSEngine.Engine.V2.General;
using AMSModel.Constant.EnumConst;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using Microsoft.AspNetCore.Mvc;
using OfficeOpenXml.FormulaParsing.LexicalAnalysis;
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
        public BaseController ControllerAPI { get; set; }
        public dynamic RequestVO { get => this.BuVO.GetDynamic(BusinessVOConst.KEY_REQUEST); }
        public FinalDatabaseLogCriteria FinalDBLog { get => (FinalDatabaseLogCriteria)this.BuVO.GetDynamic(BusinessVOConst.KEY_FINAL_DB_LOG); }
        public bool IsAuthenAuthorize { get; set; }

        public AMWLogger Logger { get; set; }

        protected abstract dynamic ExecuteEngineManual();

        public BaseAPIService(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true)
        {
            this.IsAuthenAuthorize = isAuthenAuthorize;
            this.ControllerAPI = controllerAPI;
            this.APIServiceID = apiServiceID;

        }
        public BaseAPIService()
        {
            this.IsAuthenAuthorize = false;
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

        private class TGetKey
        {
            public string token;
            public string apikey;
            public string secretKey;
            public string ref_id;
        }
        private class TLock
        {
            public int Owner;
            public string KeyLock;
        }
        private static List<TLock> lockRequests = new List<TLock>();
        private object GetKeyLock(string token, long apiServiceID)
        {
            if (string.IsNullOrWhiteSpace(token))
                return new object();
            string keyLock = token + "/" + apiServiceID;
            TLock _lock = lockRequests.FirstOrDefault(x => x.KeyLock == keyLock);
            if (_lock == null)
            {
                _lock = new TLock() { KeyLock = keyLock, Owner = this.GetHashCode() };
                lockRequests.Add(_lock);
            }
            else
            {
                _lock.Owner = this.GetHashCode();
            }

            return _lock;
        }
        private void RemoveKeyLock()
        {
            lockRequests.RemoveAll(x => x.Owner == this.GetHashCode());
        }

        public dynamic Execute(dynamic request, int retryCountdown = 1)
        {
            dynamic response = null;
            dynamic result = new ExpandoObject();
            long dbLogID = 0;
            TGetKey getKey = null;
            try
            {
                this.BuVO = new VOCriteria();
                this.BuVO.Set(BusinessVOConst.KEY_BASE_CONTROLLER, this.ControllerAPI);

                //------GET token || apikey
                if (request != null)
                {
                    getKey = ObjectUtil.Cast2<TGetKey>(request);
                    if (this.ControllerAPI.Request.Headers.ContainsKey("token") && !string.IsNullOrWhiteSpace(this.ControllerAPI.Request.Headers["token"].ToString()))
                        getKey.token = this.ControllerAPI.Request.Headers["token"].ToString();


                    this.BuVO.Set(BusinessVOConst.KEY_TRXREFID, getKey.ref_id);
                    this.BuVO.Set(BusinessVOConst.KEY_RESULT_API, result);
                }

                //-------CREATE FILE LOGGING & Decode TOKEN,APIKEY
                TokenCriteria tokenInfo = null;
                ams_APIKey apiKeyInfo = null;
                if (getKey != null && !string.IsNullOrWhiteSpace(getKey.token) && getKey.token.Count(x => x == '.') == 2)
                {
                    var tk = getKey.token.Split('.');
                    tokenInfo = new TokenCriteria();
                    tokenInfo.HeadEncode = tk[0];
                    tokenInfo.BodyEncode = tk[1];
                    tokenInfo.SignatureEncode = tk[2];
                    tokenInfo.HeadDecode = EncryptUtil.Base64Decode(tk[0]).Json<TokenCriteria.TokenHead>();
                    tokenInfo.BodyDecode = EncryptUtil.Base64Decode(tk[1]).Json<TokenCriteria.TokenBody>();
                    this.Logger = AMWLoggerManager.GetLogger(tokenInfo.BodyDecode.ucode, this.GetType().Name);
                }
                else if (getKey != null && !string.IsNullOrWhiteSpace(getKey.apikey))
                {
                    apiKeyInfo = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_APIKey>(
                            new SQLConditionCriteria[]{
                                new SQLConditionCriteria("APIKey", getKey.apikey, SQLOperatorType.EQUALS),
                                new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS),
                            }, this.BuVO).FirstOrDefault();

                    if (apiKeyInfo != null)
                        this.Logger = AMWLoggerManager.GetLogger(apiKeyInfo.APIKey, this.GetType().Name, apiKeyInfo.IsLogging);
                }

                if (tokenInfo == null && apiKeyInfo == null)
                {
                    this.Logger = AMWLoggerManager.GetLogger("(no_key)", this.GetType().Name);
                    if (this.IsAuthenAuthorize)
                        throw new AMWException(this.Logger, AMWExceptionCode.A0013);
                }
                this.BuVO.Set(BusinessVOConst.KEY_DB_CONNECTION, ADO.WMSDB.DataADO.GetInstant().CreateConnection());
                this.BuVO.Set(BusinessVOConst.KEY_LOGGER, this.Logger);


                //-------START FILE LOGGING
                this.Logger.LogInfo("############## START_TRANSACTION ##############");
                this.Logger.LogInfo("token=" + getKey.token);
                this.Logger.LogInfo("token=" + getKey.apikey);
                string _request_str = ObjectUtil.Json(request);
                this.Logger.LogInfo("request=" + _request_str);
                this.BuVO.Set(BusinessVOConst.KEY_REQUEST, request);
                this.BuVO.Set(BusinessVOConst.KEY_TOKEN, getKey.token);
                this.BuVO.Set(BusinessVOConst.KEY_APIKEY, getKey.apikey);
                this.BuVO.Set(BusinessVOConst.KEY_FINAL_DB_LOG,
                    new FinalDatabaseLogCriteria()
                    {
                        documentOptionMessages = new List<FinalDatabaseLogCriteria.DocumentOptionMessage>(),
                        sendAPIEvents = new List<HttpResultModel>()
                    });

                //-----------VALIDATE SERVICE
                var apiService = ADO.WMSStaticValue.StaticValueManager.GetInstant().APIServices.FirstOrDefault(x => x.ID == this.APIServiceID);
                if (apiService == null)
                {
                    apiService = ADO.WMSStaticValue.StaticValueManager.GetInstant().APIServices.FirstOrDefault(x => x.FullClassName == this.GetType().FullName);
                    if (apiService == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Service Class '" + this.GetType().FullName + "' is not Found");
                }


                //-----------START DB LOGGING
                this.APIServiceID = apiService.ID.Value;

                if (apiKeyInfo == null || apiKeyInfo.IsLogging)
                {
                    dbLogID = ADO.WMSDB.LogingADO.GetInstant().BeginAPIService(
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
                this.VerifyPermission(tokenInfo, apiKeyInfo);

                lock (this.GetKeyLock(getKey.token, this.APIServiceID))
                {
                    this.BuVO.SqlTransaction_Begin();
                    var res = this.ExecuteEngineManual();
                    response = new ResponseObject().Execute(this.Logger, this.BuVO, res);
                    this.BuVO.SqlTransaction_Commit();

                }
                result.status = 1;
                result.code = AMWExceptionCode.I0000.ToString();
                result.message = "Success";
                result.stacktrace = string.Empty;
                result.logref = this.Logger.LogRefID;
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
                this.RemoveKeyLock();
                this.BuVO.SqlConnection_Close();
                try
                {
                    //response = this.BuVO.GetDynamic(BusinessVOConst.KEY_RESPONSE);
                    if (response == null)
                    {
                        response = new { _result = this.BuVO.GetDynamic(BusinessVOConst.KEY_RESULT_API) };
                    }

                    if (this.Logger.IsLogging)
                    {
                        int _status = result.status;
                        string _code = result.code;
                        string _message = result.message;
                        string _stacktrace = result.stacktrace;
                      
                        if (this.FinalDBLog != null)
                        {
                            Logger.LogInfo("[BEGIN] ----Insert FinalDBLog----");
                            this.FinalDBLog.sendAPIEvents.ForEach(x =>
                            {
                                ADO.WMSDB.LogingADO.GetInstant().PutAPIPostBackEvent(x, this.BuVO);
                            });

                            this.FinalDBLog.documentOptionMessages.ForEach(x =>
                            {
                                ADO.WMSDB.LogingADO.GetInstant().PutDocumentAlertMessage(x, this.BuVO);
                            });
                        }
                        if (dbLogID != 0)
                            ADO.WMSDB.LogingADO.GetInstant().EndAPIService(dbLogID, response, _status, _code, _message, _stacktrace, this.BuVO);

                        Logger.LogInfo("[END] ----Insert FinalDBLog----");
                    }

                    string _response_str = ObjectUtil.Json(response);
                    this.Logger.LogInfo("response=" + _response_str);
                    this.Logger.LogInfo("############## END_TRANSACTION ##############");

                    if (!string.IsNullOrEmpty(getKey.apikey))
                        result.stacktrace = null;
                }
                catch (Exception ex)
                {
                    this.Logger.LogFatal("Finally Exception : " + ex.Message);
                }


            }

           
            if ((int)response._result.status == -1)
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


        protected void VerifyPermission(TokenCriteria tokenInfo, ams_APIKey apiKeyInfo)
        {
            //var tokenInfo = !string.IsNullOrEmpty(token) ? ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Token>("token", token, this.BuVO).FirstOrDefault() : null;
            this.BuVO.Set(BusinessVOConst.KEY_TOKEN_INFO, tokenInfo);

            this.BuVO.Set(BusinessVOConst.KEY_APIKEY_INFO, apiKeyInfo);

            if (!this.IsAuthenAuthorize)
                return;
            this.Logger.LogInfo("AuthenAuthorize!");

            //ADO.WMSDB.TokenADO.GetInstant().Authen(token, apiKey, this.APIServiceID, this.BuVO);



            var userInfo = ADO.WMSDB.DataADO.GetInstant().SelectByID<ams_User>(tokenInfo != null ? tokenInfo.BodyDecode.uid : apiKeyInfo.User_ID, this.BuVO);
            if (userInfo != null)
                this.Logger.LogInfo("username=" + userInfo.Code);

            //VALIDATE TOKEN
            if (tokenInfo != null)
            {
                if (DateTime.Now > tokenInfo.BodyDecode.exp)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.A0012);
                }
                if (tokenInfo.HeadDecode.typ.Equals("jwt"))
                {

                    if (tokenInfo.HeadDecode.enc.Equals("sha256"))
                    {
                        if (!tokenInfo.SignatureEncode.Equals(
                            EncryptUtil.GenerateSHA256String(tokenInfo.HeadEncode + "." + tokenInfo.BodyEncode + "." + userInfo.SecretKey)))
                        {
                            throw new AMWException(this.Logger, AMWExceptionCode.A0013);
                        }
                    }
                    else
                    {
                        throw new AMWException(this.Logger, AMWExceptionCode.A0013);
                    }
                }
                else
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.A0013);
                }
            }
        }
    }
}
