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
                                var byteArray = Encoding.ASCII.GetBytes(a.Username + ":" + a.Password);
                                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray));
                            }
                        }

                        client.Timeout = new TimeSpan(timeout);
                        var response = client.PostAsync(apiUrl, content);
                        var responseString = response.Result.Content.ReadAsStringAsync();
                        string body = responseString.Result;
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
                            CookieContainer myContainer = new CookieContainer();
                            httpWebRequest.Credentials = new NetworkCredential(a.Username, a.Password);
                            httpWebRequest.CookieContainer = myContainer;
                            httpWebRequest.PreAuthenticate = true;
                        }
                    }

                    using (StreamWriter streamWriter = new StreamWriter(httpWebRequest.GetRequestStream()))
                    {
                        string json = Newtonsoft.Json.JsonConvert.SerializeObject(datas);

                        streamWriter.Write(json);
                        streamWriter.Flush();
                        streamWriter.Close();
                    }



                    var httpResponse = (HttpWebResponse)httpWebRequest.GetResponse();
                    using (var streamReader = new StreamReader(httpResponse.GetResponseStream()))
                    {
                        result = Newtonsoft.Json.JsonConvert.DeserializeObject<T>(streamReader.ReadToEnd());
                    }
                }
                catch (System.Exception ex)
                {
                    result = null;
                    if (retry == 0 && logger != null)
                        throw new AMWException(logger, AMWExceptionCode.S0002, ex.Message);
                }
            } while (result == null);

            return result;
        }
    }
}
