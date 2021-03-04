using AMWUtil.Common;
using AMWUtil.DataAccess.Http;
using AMWUtil.Logger;
using Microsoft.CodeAnalysis;
using Microsoft.Extensions.Hosting;
using Microsoft.VisualStudio.Web.CodeGeneration.Templating;
using Novell.Directory.Ldap;
using SyncApi_WCS_LN.ADO;
using SyncApi_WCS_LN.Const;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SyncApi_WCS_LN.WorkerService
{
    public class WorkerWCS2WMS
    {
        public string SP_Request { get; set; }
        public string SP_Response { get; set; }
        public string APIUrl { get; set; }
        public AMWLogger Logger { get; set; }

        public class TResutl
        {
            public string ListID;
            public int Status;
        }

        public WorkerWCS2WMS(string sp_request, string sp_response,string apiUrl)
        {
            this.SP_Request = sp_request;
            this.SP_Response = sp_response;
            this.APIUrl = apiUrl;
            this.Logger = AMWLoggerManager.GetLogger(this.SP_Request, "worker");
        }


        public void Run()
        {
            int thread_sleep = int.Parse(ConfigADO.Post2wmsConfigs[ConfigString.KEY_POST2WMS_THREAD_SLEEP]);
            while (true)
            {
                try
                {
                    var posts = DataADO.GetInstant().Query<dynamic>(this.SP_Request, this.Logger).ToList().Select(x => (IDictionary<string, object>)x).ToList(); 

                    if(posts != null && posts.Count() > 0)
                    {
                        foreach(var post in posts)
                        {
                            string listID = (string)post.Values.ToString();
                            TResutl data_result = new TResutl() { ListID = listID, Status = 0 };
                            try
                            {
                                
                                var res = RESTFulAccess.SendForm<dynamic>(this.Logger, this.APIUrl, RESTFulAccess.HttpMethod.POST, post);
                                data_result.Status = 1;
                            }
                            catch
                            {
                                data_result.Status = 0;
                            }
                            finally
                            {
                                if (!string.IsNullOrWhiteSpace(this.SP_Response))
                                    DataADO.GetInstant().Query<dynamic>(this.SP_Response, this.Logger, data_result);
                            }
                        }
                    }
                }
                catch(Exception ex)
                {
                    this.Logger.LogError(ex.Message);
                }
                finally
                {
                    Thread.Sleep(thread_sleep);
                }
            }
        }
    }
}
