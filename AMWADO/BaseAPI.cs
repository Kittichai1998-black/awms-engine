using AMWUtil.DataAccess.Http;
using AMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ADO
{
    public abstract class BaseAPI<TThis>
        where TThis : BaseAPI<TThis>, new()
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
            List<HttpResultModel> outResults = new List<HttpResultModel>();
            //return new TRes() { _result = new TRes.Result() { resultcheck = 1, resultmessage = "SUCCESS" } };
            try
            {
                var apiURL = WMSStaticValue.StaticValueManager.GetInstant().GetConfigValue(apiConfigName);
                var res = RESTFulAccess.SendJson<T>(buVO.Logger, apiURL, RESTFulAccess.HttpMethod.POST, datas, outResults, authentication);
                return res;
            }
            catch
            {
                throw;
            }
            finally
            {
                if(buVO.FinalLogSendAPIEvent != null)
                {
                    outResults.ForEach(x => { x.APIService_Module = buVO.Logger.SubServiceName; x.APIName = apiConfigName; });
                    buVO.FinalLogSendAPIEvent.AddRange(outResults);
                }
            }
        }
        public T SendJson<T>(string apiConfigName, object datas, VOCriteria buVO)
            where T : class, new()
        {
            return SendJson<T>(apiConfigName, datas, null, buVO);
        }

        public T SendForm<T>(string apiConfigName, object datas, BasicAuthentication authentication, VOCriteria buVO)
            where T : class, new()
        {
            List<HttpResultModel> outResults = new List<HttpResultModel>();
            try
            {
                var apiURL = WMSStaticValue.StaticValueManager.GetInstant().GetConfigValue(apiConfigName);
                var res = RESTFulAccess.SendForm<T>(buVO.Logger, apiURL, RESTFulAccess.HttpMethod.POST, datas, outResults, authentication);
                return res;
            }
            catch
            {
                throw;
            }
            finally
            {
                if (buVO.FinalLogSendAPIEvent != null)
                {
                    outResults.ForEach(x => { x.APIService_Module = buVO.Logger.SubServiceName; x.APIName = apiConfigName; });
                    buVO.FinalLogSendAPIEvent.AddRange(outResults);
                }
            }
        }
        public T SendForm<T>(string apiConfigName, object datas, VOCriteria buVO)
            where T : class, new()
        {
            return SendForm<T>(apiConfigName, datas, null, buVO);
        }


        public T SendFileJson<T>(string apiRefID, string partIn,string partOut, object datas,VOCriteria buVO)
            where T : class, new()
        {
            List<HttpResultModel> outResults = new List<HttpResultModel>();
            //return new TRes() { _result = new TRes.Result() { resultcheck = 1, resultmessage = "SUCCESS" } };
            try
            {
                var res = AMWUtil.DataAccess.APIFileAccess.WriteLocalSync<T>(
                    buVO.Logger, partIn, partOut, apiRefID + ".json", datas); ;
                return res;
            }
            catch
            {
                throw;
            }
            finally
            {
                if (buVO.FinalLogSendAPIEvent != null)
                {
                    //outResults.ForEach(x => { x.APIService_Module = buVO.Logger.SubServiceName; x.APIName = apiConfigName; });
                    buVO.FinalLogSendAPIEvent.AddRange(outResults);
                }
            }
        }
    }
}
