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
            
            try
            {

                this.BuVO.Set(BusinessVOConst.KEY_REQUEST, request);
                this.BuVO.Set(BusinessVOConst.KEY_TOKEN, request._token);
                this.BuVO.Set(BusinessVOConst.KEY_APIKEY, request._apikey);
                dynamic result = new ExpandoObject();
                result.status = 1;
                result.code = AMWExceptionCode.S0000.ToString();
                result.message = "Success";
                this.BuVO.Set(BusinessVOConst.KEY_RESULT_API, result);
                this.Logger = AMWLoggerManager.GetLogger(request._token ?? request._apikey ?? "notkey", this.GetType().Name);
                var res = this.ExecuteEngineManual();
                new General.ResponseObject().Execute(this.Logger, this.BuVO, res);
            }
            catch (AMWException ex)
            {

            }
            catch (Exception ex)
            {

            }
            finally
            {
                response = this.BuVO.GetDynamic(BusinessVOConst.KEY_RESPONSE);
                if (response == null)
                    response = this.BuVO.GetDynamic(BusinessVOConst.KEY_RESULT_API);
            }
            return response;
        }
    }
}
