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
    public class WorkerPost2WMS
    {
        public string SP_Post { get; set; }
        public string SP_Result { get; set; }
        public string APIUrl { get; set; }
        public AMWLogger Logger { get; set; }

        public class TResutl
        {
            public string ListID;
            public int Status;
        }

        public WorkerPost2WMS(string sp_post, string sp_result,string apiUrl)
        {
            this.SP_Post = sp_post;
            this.SP_Result = sp_result;
            this.APIUrl = apiUrl;
            this.Logger = AMWLoggerManager.GetLogger(this.SP_Post, "worker");
        }


        public void Run()
        {
            int thread_sleep = int.Parse(ConfigADO.Post2wmsConfigs[ConfigString.KEY_POST2WMS_THREAD_SLEEP]);
            while (true)
            {
                try
                {
                    var posts = DataADO.GetInstant().Query<dynamic>(this.SP_Post, this.Logger);
                    if(posts != null && posts.Count() > 0)
                    {
                        foreach(var post in posts)
                        {
                            string listID = (string)post.ListID;
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
                                if (!string.IsNullOrWhiteSpace(this.SP_Result))
                                    DataADO.GetInstant().Query<dynamic>(this.SP_Result, this.Logger, data_result);
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
