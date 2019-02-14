using System;
using System.Collections.Generic;
using System.Text;
using System.Net;
using System.IO;
using AMWUtil.Logger;
using AMWUtil.Exception;
using System.Net.Http;
using AMWUtil.Common;

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
        public static T SendForm<T>(AMWLogger logger, string apiUrl, HttpMethod method, object datas, IAuthentication authen = null, int retry = 2, int timeout = 5000)
            where T : class, new()
        {
            T result = null;
            var values = new Dictionary<string, string>();
            ObjectUtil.FieldKeyValuePairs(datas).ForEach(x => {
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

                        client.Timeout = new TimeSpan(timeout);
                        logger.LogInfo("API_REQUEST_DATA(" + (retry + 1) + "):: " + datas.Json());
                        var response = client.PostAsync(apiUrl, content);
                        logger.LogInfo("API_RESPONSE_STATUS(" + (retry + 1) + "):: " + response.Result.StatusCode);
                        var responseString = response.Result.Content.ReadAsStringAsync();
                        string body = responseString.Result;
                        logger.LogInfo("API_RESPONSE_DATA(" + (retry + 1) + "):: " + body);
                        result = Newtonsoft.Json.JsonConvert.DeserializeObject<T>(body);
                    }
                }
                catch (System.Exception ex)
                {
                    if (retry == 0 && logger != null)
                        throw new AMWException(logger, AMWExceptionCode.S0002, ex.Message);
                }
            } while (result == null);

            return result;
        }

        public static T SendJson<T>(AMWLogger logger, string apiUrl, HttpMethod method, object datas, IAuthentication authen = null, int retry = 2, int timeout = 5000)
            where T : class, new()
        {
            T result = null;
            if(logger != null)
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

                    if(authen != null)
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
                catch (System.Exception ex)
                {
                    result = null;
                    if (retry <= 0 && logger != null)
                        throw new AMWException(logger, AMWExceptionCode.S0002, ex.Message);
                }
            } while (result == null);

            return result;
        }
    }
}
