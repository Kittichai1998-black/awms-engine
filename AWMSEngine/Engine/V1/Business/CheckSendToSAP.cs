using AMWUtil.Common;
using AMWUtil.DataAccess.Http;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO.SAPApi;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business
{
    public class CheckSendToSAP : BaseEngine<CheckSendToSAP.TReq, CheckSendToSAP.TRes>
    {

        public class TReq
        {
            public string type ;

        }
        public class TRes
        {      
            public List<massageReturn> SendSAP;
            public class massageReturn
            {
                public string url;
                public string massage;

            }
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var Returnvalues = new SAPInterfaceReturnvalues()
            {
                GOODSMVT_HEADER = new SAPInterfaceReturnvalues.header()
                {
                    HEADER_TXT = "ASRS Test Condition"
                },
                GOODSMVT_ITEM = new List<SAPInterfaceReturnvalues.items>()
            };

            ADO.SAPApi.TREQ_MMI0008_1_DO_INFO tReq = new ADO.SAPApi.TREQ_MMI0008_1_DO_INFO()
            {
                HEADER_DATA = new ADO.SAPApi.TREQ_MMI0008_1_DO_INFO.THeader()
                {
                    DELIV_NUMB = "ASRS Test Condition",
                    DELIV_ITEM = "ASRS Test Condition"
                }
            };

            string apiURL = ADO.StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_MMI0001_URL");
            string apiURL02 = ADO.StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_MMI0002_URL");
            string apiURL03 = ADO.StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_MMI0003_URL");
            string apiURL04 = ADO.StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_MMI0004_URL");
            string apiURL08 = ADO.StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_MMI0008_URL");
            string apiURL09 = ADO.StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_MMI0009_URL");
            string apiURL081 = ADO.StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_MMI0008_URL");
            string apiURL11 = ADO.StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_MMI00011_URL");



            string username = ADO.StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_USERNAME");
            string password = ADO.StaticValue.StaticValueManager.GetInstant().GetConfig("SAP_PASSWORD");


            var res01 = SendJson<SAPResposneAPI>(this.BuVO.Logger, apiURL, HttpMethod.Post, Returnvalues, new BasicAuthentication(username, password));
            var res02 = SendJson<SAPResposneAPI>(this.BuVO.Logger, apiURL02, HttpMethod.Post, Returnvalues, new BasicAuthentication(username, password));
            var res03 = SendJson<SAPResposneAPI>(this.BuVO.Logger, apiURL03, HttpMethod.Post, Returnvalues, new BasicAuthentication(username, password));
            var res04 = SendJson<SAPResposneAPI>(this.BuVO.Logger, apiURL04, HttpMethod.Post, Returnvalues, new BasicAuthentication(username, password));
            var res08 = SendJson<SAPResposneAPI>(this.BuVO.Logger, apiURL08, HttpMethod.Post, Returnvalues, new BasicAuthentication(username, password));
            var res09 = SendJson<SAPResposneAPI>(this.BuVO.Logger, apiURL09, HttpMethod.Post, Returnvalues, new BasicAuthentication(username, password));
            var res081 = SendJson<TRES_MMI0008_1_DO_INFO>(this.BuVO.Logger, apiURL081, HttpMethod.Post, tReq, new BasicAuthentication(username, password));
            var res011 = SendJson<SAPResposneAPI>(this.BuVO.Logger, apiURL11, HttpMethod.Post, Returnvalues, new BasicAuthentication(username, password));

            var return01 = "";
            if (res01 == null) { return01 = "false"; } else { return01 = "true"; };
            var return02 = "";
            if (res02 == null) { return02 = "false"; } else { return02 = "true"; };
            var return03 = "";
            if (res03 == null) { return03 = "false"; } else { return03 = "true"; };
            var return04 = "";
            if (res04 == null) { return04 = "false"; } else { return04 = "true"; };
            var return08 = "";
            if (res08 == null) { return08 = "false"; } else { return08= "true"; };
            var return09 = "";
            if (res09 == null) { return09 = "false"; } else { return09 = "true"; };
            var return081 = "";
            if (res081 == null) { return081 = "false"; } else { return081 = "true"; };
            var return011 = "";
            if (res011 == null) { return011 = "false"; } else { return011 = "true"; };

            var DataReturn = new TRes();
            var SendSAP = new List<TRes.massageReturn>();
            SendSAP.Add(new TRes.massageReturn()
            {
                url = apiURL,
                massage = return01,
              
            });
            SendSAP.Add(new TRes.massageReturn()
            {
                url = apiURL02,
                massage = return02,

            });
            SendSAP.Add(new TRes.massageReturn()
            {
                url = apiURL03,
                massage = return03,

            });
            SendSAP.Add(new TRes.massageReturn()
            {
                url = apiURL04,
                massage = return04,

            });
            SendSAP.Add(new TRes.massageReturn()
            {
                url = apiURL08,
                massage = return08,

            });
            SendSAP.Add(new TRes.massageReturn()
            {
                url = apiURL09,
                massage = return09,

            });
            SendSAP.Add(new TRes.massageReturn()
            {
                url = apiURL081,
                massage = return081,

            });
            SendSAP.Add(new TRes.massageReturn()
            {
                url = apiURL11,
                massage = return011,

            });

            DataReturn.SendSAP = SendSAP;

            return DataReturn;
        }


        public  T SendJson<T>(AMWLogger logger, string apiUrl, HttpMethod method, object datas, IAuthentication authen = null, int retry = 2, int timeout = 5000)
           where T : class, new()
        {
            T result = null;
            if (logger != null)
                logger.LogInfo("API_CONNECTION:: URL=" + apiUrl + " | RETRY=" + retry + " | TIMEOUT=" + timeout);
            do
            {
                try
                {
                    retry--;
                    HttpWebRequest httpWebRequest = (HttpWebRequest)WebRequest.Create(apiUrl);
                    httpWebRequest.ContentType = "application/json";
                    httpWebRequest.Method = method.ToString();
                    httpWebRequest.Timeout = timeout;

                    if (authen != null)
                    {
                        if (authen is BasicAuthentication)
                        {
                            var a = (BasicAuthentication)authen;
                            if (logger != null)
                                logger.LogInfo("API_REQUEST_AUTHEN(" + (retry + 1) + "):: USER=" + a.Username + " | PASS=" + a.Password);
                            CookieContainer myContainer = new CookieContainer();
                            //httpWebRequest.Credentials = new NetworkCredential(a.Username, a.Password);
                            string credentials = Convert.ToBase64String(Encoding.ASCII.GetBytes(a.Username + ":" + a.Password));
                            httpWebRequest.Headers[HttpRequestHeader.Authorization] = string.Format("Basic {0}", credentials);
                            httpWebRequest.CookieContainer = myContainer;
                            httpWebRequest.PreAuthenticate = true;
                        }
                    }

                    string json = datas.Json();
                    if (logger != null)
                        logger.LogInfo("API_REQUEST_DATA(" + (retry + 1) + "):: " + json);
                    //return new T();

                    using (StreamWriter streamWriter = new StreamWriter(httpWebRequest.GetRequestStream()))
                    {
                        streamWriter.Write(Newtonsoft.Json.JsonConvert.SerializeObject(datas));
                        streamWriter.Flush();
                        streamWriter.Close();
                    }

                    var httpResponse = (HttpWebResponse)httpWebRequest.GetResponse();
                    if (logger != null)
                        logger.LogInfo("API_RESPONSE_STATUS(" + (retry + 1) + "):: " + httpResponse.StatusCode);
                    using (var streamReader = new StreamReader(httpResponse.GetResponseStream()))
                    {
                        string body = streamReader.ReadToEnd();
                        if (logger != null)
                            logger.LogInfo("API_RESPONSE_DATA(" + (retry + 1) + "):: " + body);
                        result = Newtonsoft.Json.JsonConvert.DeserializeObject<T>(body);
                    }
                }
                catch
                {
                    result = null;
                    if (retry == 0 && logger != null)
                        return null;
                }


            } while (result == null);
            return result;
        }
        
        }
}
