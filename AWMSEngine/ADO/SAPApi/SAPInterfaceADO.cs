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

        public SAPResposneAPI MMI0001_FG_GOODS_RECEIPT(SAPInterfaceReturnvalues datas, VOCriteria buVO)
        {
            string apiURL = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_MMI0001_URL");
            string username = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_USERNAME");
            string password = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_PASSWORD");
            var res = RESTFulAccess.SendJson<SAPResposneAPI>(buVO.Logger, apiURL, RESTFulAccess.HttpMethod.POST, datas, new BasicAuthentication(username, password));
            return res;
        }

        public SAPResposneAPI MMI0002_PACKAGE_GOODS_RECEIPT(SAPInterfaceReturnvalues datas, VOCriteria buVO)
        {
            string apiURL = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_MMI0002_URL");
            string username = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_USERNAME");
            string password = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_PASSWORD");
            var res = RESTFulAccess.SendJson<SAPResposneAPI>(buVO.Logger, apiURL, RESTFulAccess.HttpMethod.POST, datas, new BasicAuthentication(username, password));
            return res;
        }

        public SAPResposneAPI MMI0003_CUSTOMER_RETURN(SAPInterfaceReturnvalues datas, VOCriteria buVO)
        {
            string apiURL = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_MMI0003_URL");
            string username = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_USERNAME");
            string password = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_PASSWORD");
            var res = RESTFulAccess.SendJson<SAPResposneAPI>(buVO.Logger, apiURL, RESTFulAccess.HttpMethod.POST, datas, new BasicAuthentication(username, password));
            return res;
        }

        public SAPResposneAPI MMI0004_PLANT_STOCK_TRANSFER(SAPInterfaceReturnvalues datas, VOCriteria buVO)
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
        public SAPResposneAPI MMI0009_CONFORM_DELIVERY_ORDER_PICK(dynamic datas, VOCriteria buVO)
        {
            string apiURL = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_MMI0009_URL");
            string username = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_USERNAME");
            string password = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_PASSWORD");
            var res = RESTFulAccess.SendJson<SAPResposneAPI>(buVO.Logger, apiURL, RESTFulAccess.HttpMethod.POST, datas, new BasicAuthentication(username, password));
            return res;
        }

        public class MMI0008_1
        {
            public THeader HEADER_DATA;
            public class THeader
            {
                public string DELIV_NUMB;
                public string DELIV_ITEM;
            }
        }
        public CreateIssueAPI.TModel.TDocument MMI0008_1_DO_INFO(MMI0008_1 datas, VOCriteria buVO)
        {
            string apiURL = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_MMI0008_1_URL");
            string username = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_USERNAME");
            string password = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_PASSWORD");
            var res = RESTFulAccess.SendJson<CreateIssueAPI.TModel.TDocument>(buVO.Logger, apiURL, RESTFulAccess.HttpMethod.POST, datas, new BasicAuthentication(username, password));
            return res;
        }
    }
}
