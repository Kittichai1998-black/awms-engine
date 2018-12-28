using AMWUtil.DataAccess.Http;
using AWMSEngine.APIService.Api2;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO.SAPApi
{
    public class SAPInterfaceADO : BaseMSSQLAccess<SAPInterfaceADO>
    {

        public SAPResposneAPI MMI0001_FG_GOODS_RECEIPT(dynamic datas, VOCriteria buVO)
        {
            string apiURL = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_MMI0001_URL");
            string username = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_USERNAME");
            string password = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_PASSWORD");
            var res = RESTFulAccess.SendJson<SAPResposneAPI>(buVO.Logger, apiURL, RESTFulAccess.HttpMethod.POST, datas, new BasicAuthentication(username, password));
            return res;
        }

        public SAPResposneAPI MMI0002_PACKAGE_GOODS_RECEIPT(dynamic datas, VOCriteria buVO)
        {
            string apiURL = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_MMI0002_URL");
            string username = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_USERNAME");
            string password = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_PASSWORD");
            var res = RESTFulAccess.SendJson<SAPResposneAPI>(buVO.Logger, apiURL, RESTFulAccess.HttpMethod.POST, datas, new BasicAuthentication(username, password));
            return res;
        }

        public SAPResposneAPI MMI0003_CUSTOMER_RETURN(dynamic datas, VOCriteria buVO)
        {
            string apiURL = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_MMI0003_URL");
            string username = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_USERNAME");
            string password = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_PASSWORD");
            var res = RESTFulAccess.SendJson<SAPResposneAPI>(buVO.Logger, apiURL, RESTFulAccess.HttpMethod.POST, datas, new BasicAuthentication(username, password));
            return res;
        }

        public SAPResposneAPI MMI0004_PLANT_STOCK_TRANSFER(dynamic datas, VOCriteria buVO)
        {
            string apiURL = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_MMI0004_URL");
            string username = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_USERNAME");
            string password = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_PASSWORD");
            var res = RESTFulAccess.SendJson<SAPResposneAPI>(buVO.Logger, apiURL, RESTFulAccess.HttpMethod.POST, datas, new BasicAuthentication(username, password));
            return res;
        }
        public SAPResposneAPI MMI0008_PLANT_STOCK_TRANSFER(dynamic datas, VOCriteria buVO)
        {
            string apiURL = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_MMI0008_URL");
            string username = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_USERNAME");
            string password = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_PASSWORD");
            var res = RESTFulAccess.SendJson<SAPResposneAPI>(buVO.Logger, apiURL, RESTFulAccess.HttpMethod.POST, datas, new BasicAuthentication(username, password));
            return res;
        }
    }
}
