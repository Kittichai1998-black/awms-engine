using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService
{
    public abstract class BaseAPIService
    {
        public VOCriteria BuVO { get; set; }
        public dynamic RequestVO { get => this.BuVO.GetDynamic(BusinessVOConst.KEY_REQUEST); }

        public AMWLogger Logger { get; set; }
        protected abstract dynamic ExecuteEngineManual();
        public dynamic Execute(dynamic request)
        {
            this.BuVO = new VOCriteria();
            dynamic response = new { };
            dynamic result = new ExpandoObject();

            try
            {
                this.Logger = AMWLoggerManager.GetLogger(request._token ?? request._apikey ?? "notkey", this.GetType().Name);
                this.Logger.LogBegin();
                this.BuVO.Set(BusinessVOConst.KEY_RESULT_API, result);

                this.BuVO.Set(BusinessVOConst.KEY_REQUEST, request);
                this.Logger.LogInfo("request : " + ObjectUtil.Json(request));

                this.BuVO.Set(BusinessVOConst.KEY_TOKEN, request._token);
                this.Logger.LogInfo("_token : " + request._token);

                this.BuVO.Set(BusinessVOConst.KEY_APIKEY, request._apikey);
                this.Logger.LogInfo("_apikey : " + request._apikey);

                this.Logger.LogInfo("[BeginExecuteEngineManual]");
                var res = this.ExecuteEngineManual();
                this.Logger.LogInfo("[EndExecuteEngineManual]");
                if (res == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.T0003);
                var resAPI = new General.ResponseObject().Execute(this.Logger, this.BuVO, res);
                result.status = 1;
                result.code = AMWExceptionCode.S0000.ToString();
                result.message = "Success";
            }
            catch (AMWException ex)
            {
                result.status = 0;
                result.code = ex.GetAMWCode();
                result.message = ex.GetAMWMessage();
                result.stacktrace = ex.StackTrace;
            }
            catch (Exception ex)
            {
                var e = new AMWException(this.Logger, AMWExceptionCode.U0000, ex.Message);
                result.status = 0;
                result.code = e.GetAMWCode();
                result.message = e.GetAMWMessage();
                result.stacktrace = ex.StackTrace;
                this.Logger.LogError(ex.StackTrace);
            }
            finally
            {
                response = this.BuVO.GetDynamic(BusinessVOConst.KEY_RESPONSE);
                if (response == null)
                {
                    response = new { _result = this.BuVO.GetDynamic(BusinessVOConst.KEY_RESULT_API) };
                }
                this.Logger.LogInfo("API Response : " + ObjectUtil.Json(response));
                this.Logger.LogEnd();
            }
            return response;
        }
    }
}
