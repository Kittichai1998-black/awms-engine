using System;
using System.Collections.Generic;
using System.Text;
using System.Net;
using System.IO;
using AMWUtil.Logger;
using AMWUtil.Exception;
using System.Net.Http;
using AMWUtil.Common;
using System.Linq;

namespace AMWUtil.DataAccess.Http
{
    public static class RESTFulAccess
    {
        public enum HttpMethod
        {
            GET,
            POST,
            PUT,
            DELETE,
            PATCH
        }
        public static T SendForm<T>(AMWLogger logger, string apiUrl, HttpMethod method, object datas, IAuthentication authen = null, int retry = 0, int timeout = 30000)
            where T : class
        {
            return SendForm<T>(logger, apiUrl, method, datas, null, authen, retry, timeout);
        }
        
        public static T SendForm<T>(AMWLogger logger, string apiUrl, HttpMethod method, object datas, List<HttpResultModel> outResults, IAuthentication authen = null, int retry = 0, int timeout = 30000)
            where T : class
        {
            T result = null;
            var values = new Dictionary<string, string>();
            ObjectUtil.FieldKeyValuePairs(datas).ForEach(x =>
            {
                string val;
                if (x.Value is int || x.Value is long || x.Value is decimal || x.Value is float || x.Value is double || x.Value is string)
                    val = x.Value.ToString();
                else
                    val = Newtonsoft.Json.JsonConvert.SerializeObject(x.Value);
                values.Add(x.Key, val);
            });
            var content = new FormUrlEncodedContent(values);

            logger.LogInfo("API_CONNECTION:: URL=" + apiUrl + " | RETRY=" + retry + " | TIMEOUT=" + timeout);

            do
            {
                try
                {
                    var outResult = new HttpResultModel();
                    outResults.Add(outResult);
                    retry--;
                    using (HttpClient client = new HttpClient())
                    {
                        if (authen != null)
                        {
                            if (authen is BasicAuthentication)
                            {
                                var a = (BasicAuthentication)authen;
                                logger.LogInfo("API_REQUEST_AUTHEN(" + (retry + 1) + "):: USER=" + a.Username + " | PASS=" + a.Password);
                                var byteArray = Encoding.ASCII.GetBytes(a.Username + ":" + a.Password);
                                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray));
                            }
                        }

                        if (outResult == null)
                        {
                            outResult.APIUrl = apiUrl;
                            outResult.Header = string.Format("{0},{1},{2}", (retry + 1), method, client.DefaultRequestHeaders.From);
                            outResult.InputText = datas.Json();
                            outResult.StartTime = DateTime.Now;
                        }

                        client.Timeout = new TimeSpan(timeout);
                        logger.LogInfo("API_REQUEST_DATA(" + (retry + 1) + "):: " + datas.Json());
                        var response = client.PostAsync(apiUrl, content);
                        logger.LogInfo("API_RESPONSE_STATUS(" + (retry + 1) + "):: " + response.Result.StatusCode);
                        var responseString = response.Result.Content.ReadAsStringAsync();
                        string body = responseString.Result;
                        logger.LogInfo("API_RESPONSE_DATA(" + (retry + 1) + "):: " + body);
                        result = Newtonsoft.Json.JsonConvert.DeserializeObject<T>(body);

                        if (outResult != null)
                        {
                            outResult.HttpStatus = (int)response.Result.StatusCode;
                            outResult.OutputText = body;
                            outResult.EndTime = DateTime.Now;
                        }
                    }
                }
                catch (System.Exception ex)
                {
                    if (retry < 0 && logger != null)
                        throw new AMWException(logger, AMWExceptionCode.S0002, ex.Message);
                }
            } while (result == null);

            return result;
        }
        public static T SendJson<T>(AMWLogger logger, string apiUrl, HttpMethod method, object datas, IAuthentication authen = null, int retry = 0, int timeout = 30000)
            where T : class
        {
            return SendJson<T>(logger, apiUrl, method, datas, null, authen, retry, timeout);
        }
        public static T SendJson<T>(AMWLogger logger, string apiUrl, HttpMethod method, object datas, List<HttpResultModel> outResults, IAuthentication authen = null, int retry = 0, int timeout = 30000)
            where T : class
        {
            T result = null;
            if (logger != null)
                logger.LogInfo("API_CONNECTION:: URL=" + apiUrl + " | RETRY=" + retry + " | TIMEOUT=" + timeout);
            do
            {
                var outResult = new HttpResultModel();
                if (outResults != null)
                    outResults.Add(outResult);
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
                        else if (authen is BearerAuthentication)
                        {
                            var a = (BearerAuthentication)authen;
                            httpWebRequest.ContentType = "application/x-www-form-urlencoded";
                            httpWebRequest.Headers[HttpRequestHeader.Authorization] = "Bearer " + a.Token;

                            var data = Encoding.UTF8.GetBytes(datas.ToString());
                            httpWebRequest.ContentLength = data.Length;

                            //using (var stream = httpWebRequest.GetRequestStream()) stream.Write(data, 0, data.Length);
                            //var response = (HttpWebResponse)httpWebRequest.GetResponse();
                        }

                    }

                    string json = datas.Json();
                    if (logger != null)
                        logger.LogInfo("API_REQUEST_DATA(" + (retry + 1) + "):: " + json);
                    //return new T();


                    if (outResult != null)
                    {
                        var heads = httpWebRequest.Headers.AllKeys.ToList().Select(x => x + "=" + httpWebRequest.Headers.Get(x)).JoinString();
                        outResult.APIUrl = apiUrl;
                        outResult.Header = string.Format("{0},{1},{2}", (retry + 1), method, heads);
                        outResult.InputText = datas.Json();
                        outResult.StartTime = DateTime.Now;
                    }

                    using (StreamWriter streamWriter = new StreamWriter(httpWebRequest.GetRequestStream()))
                    {
                        if (authen is BearerAuthentication)
                        {
                            streamWriter.Write(datas.ToString(), 0, Encoding.UTF8.GetBytes(datas.ToString()));
                        }
                        else {
                            streamWriter.Write(Newtonsoft.Json.JsonConvert.SerializeObject(datas));
                        }
                    
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
                        if (result == null)
                        {
                            throw new System.Exception("API_RESPONSE_DATA is NULL");
                        }
                        if (outResult != null)
                        {
                            outResult.HttpStatus = (int)httpResponse.StatusCode;
                            outResult.OutputText = body;
                            outResult.EndTime = DateTime.Now;
                            outResult.ResultStatus = 1;
                            outResult.ResultMessage = "SUCCESS";
                        }
                    }


                }
                catch (System.Exception ex)
                {
                    if (outResult != null)
                    {
                        outResult.HttpStatus = -1;
                        outResult.OutputText = string.Empty;
                        outResult.EndTime = DateTime.Now;
                        outResult.ResultStatus = 0;
                        outResult.ResultMessage = ex.Message;
                    }
                    result = null;
                    if (retry < 0)
                    {
                        if (logger != null)
                            throw new AMWException(logger, AMWExceptionCode.S0002, ex.Message);
                        else
                            throw ex;
                    }
                }
            } while (result == null);

            return result;
        }
    }
}
