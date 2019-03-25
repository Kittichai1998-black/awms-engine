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
        private SAPResposneAPI _PostSAP(string apiURL, string username, string password, SAPInterfaceReturnvalues datas, VOCriteria buVO)
        {
            try
            {
                var res = RESTFulAccess.SendJson<SAPResposneAPI>(buVO.Logger, apiURL, RESTFulAccess.HttpMethod.POST, datas, new BasicAuthentication(username, password));
                return res;
            }
            catch (Exception ex)
            {
                return new SAPResposneAPI()
                {
                    docstatus = "4",
                    doc_year = "",
                    mat_doc = "",
                    @return = new List<SAPResposneAPI.items>()
                    {
                        new SAPResposneAPI.items()
                        {
                            message = ex.Message
                        }
                    }
                };
            }
        }

        public SAPResposneAPI MMI0001_FG_GOODS_RECEIPT(SAPInterfaceReturnvalues datas, VOCriteria buVO)
        {
            string apiURL = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_MMI0001_URL");
            string username = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_USERNAME");
            string password = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_PASSWORD");
            var res = _PostSAP(apiURL, username, password, datas, buVO);
            return res;
        }

        public SAPResposneAPI MMI0002_PACKAGE_GOODS_RECEIPT(SAPInterfaceReturnvalues datas, VOCriteria buVO)
        {
            string apiURL = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_MMI0002_URL");
            string username = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_USERNAME");
            string password = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_PASSWORD");
            var res = _PostSAP(apiURL, username, password, datas, buVO);
            return res;
        }

        public SAPResposneAPI MMI0003_CUSTOMER_RETURN(SAPInterfaceReturnvalues datas, VOCriteria buVO)
        {
            string apiURL = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_MMI0003_URL");
            string username = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_USERNAME");
            string password = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_PASSWORD");
            var res = _PostSAP(apiURL, username, password, datas, buVO);
            return res;
        }

        public SAPResposneAPI MMI0004_PLANT_STOCK_TRANSFER(SAPInterfaceReturnvalues datas, VOCriteria buVO)
        {
            string apiURL = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_MMI0004_URL");
            string username = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_USERNAME");
            string password = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_PASSWORD");
            var res = _PostSAP(apiURL, username, password, datas, buVO);
            return res;
        }
        public SAPResposneAPI MMI0008_PLANT_STOCK_TRANSFER(dynamic datas, VOCriteria buVO)
        {
            string apiURL = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_MMI0008_URL");
            string username = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_USERNAME");
            string password = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_PASSWORD");
            var res = _PostSAP(apiURL, username, password, datas, buVO);
            return res;
        }
        public SAPResposneAPI MMI0009_CONFORM_DELIVERY_ORDER_PICK(dynamic datas, VOCriteria buVO)
        {
            string apiURL = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_MMI0009_URL");
            string username = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_USERNAME");
            string password = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_PASSWORD");
            var res = _PostSAP(apiURL, username, password, datas, buVO);
            return res;
        }

        public TRES_MMI0008_1_DO_INFO MMI0008_1_DO_INFO(TREQ_MMI0008_1_DO_INFO datas, VOCriteria buVO)
        {
            string apiURL = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_MMI0008_URL");
            string username = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_USERNAME");
            string password = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_PASSWORD");
            var res = RESTFulAccess.SendJson<TRES_MMI0008_1_DO_INFO>(buVO.Logger, apiURL, RESTFulAccess.HttpMethod.POST, datas, new BasicAuthentication(username, password), 0, 10000);
            return res;
        }

        public SAPResposneAPI MMI0009_CONFORM_PHYSICALCOUNT(dynamic datas, VOCriteria buVO)
        {
            string apiURL = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_MMI00011_URL");
            string username = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_USERNAME");
            string password = StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_PASSWORD");
            var res = _PostSAP(apiURL, username, password, datas, buVO);
            return res;
        }

        public ERPReturnValues GOODS_ISSUED_SendERPAPIOnClosed_NORMAL(dynamic datas, VOCriteria buVO)
        {
            ERPReturnValues res = new ERPReturnValues() {
                status = 1,
                message="Test Error",
                data = datas
            };
            return res;
        }

        public ERPReturnValues GOODS_RECEIVED_SendERPAPIOnClosed_NORMAL(dynamic datas, VOCriteria buVO)
        {
            ERPReturnValues res = new ERPReturnValues()
            {
                status = 1,
                message = "Test Error",
                data = datas
            };
            return res;
        }
    }
}
