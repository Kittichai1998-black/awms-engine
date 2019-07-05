﻿using AMWUtil.DataAccess.Http;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO
{
    public abstract class BaseAPIAccess<TThis>
        where TThis : new()
    {
        private static TThis instants;
        public static TThis GetInstant()
        {
            if (instants == null)
                instants = new TThis();
            return instants;
        }

        public T SendJson<T>(string apiConfigName, object datas, BasicAuthentication authentication, VOCriteria buVO)
            where T : class, new()
        {
            //return new TRes() { _result = new TRes.Result() { resultcheck = 1, resultmessage = "SUCCESS" } };

            var apiURL = StaticValue.StaticValueManager.GetInstant().GetConfig(apiConfigName);
            List<HttpResultModel> outResults = new List<HttpResultModel>();
            var res = RESTFulAccess.SendJson<T>(buVO.Logger, apiURL, RESTFulAccess.HttpMethod.POST, datas, outResults, authentication);
            outResults.ForEach(x => { x.APIService_Module = buVO.Logger.SubServiceName; x.APIName = apiConfigName; });
            return res;
        }
        public T SendJson<T>(string apiConfigName, object datas, VOCriteria buVO)
            where T : class, new()
        {
            return SendJson<T>(apiConfigName, datas, null, buVO);
        }
    }
}