using AMWUtil.Common;
using AMWUtil.Logger;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService
{
    public abstract class BaseAPIService
    {
        public VOCriteria BuVO { get; set; }
        public AMWLogger Logger { get; set; }
        protected abstract void ExecuteEngineManual();
        public dynamic Execute(dynamic request)
        {
            this.BuVO = new VOCriteria();
            this.BuVO.Set(BusinessVOConst.KEY_REQUEST, request);
            this.BuVO.Set(BusinessVOConst.KEY_TOKEN, request._token);
            this.BuVO.Set(BusinessVOConst.KEY_APIKEY, request._apikey);
            this.Logger = AMWLoggerManager.GetLogger(request._token ?? request._apikey ?? "notkey", this.GetType().Name);
            this.ExecuteEngineManual();

            return this.BuVO.GetDynamic(BusinessVOConst.KEY_RESPONSE);
        }
    }
}
