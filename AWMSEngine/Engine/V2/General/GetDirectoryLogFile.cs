using AMSModel.Criteria;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.General
{
    public class GetDirectoryLogFile : BaseEngine<string, dynamic>
    {
        private string PATH = @"D:/logs/" + Environment.MachineName;
        protected override dynamic ExecuteEngine(string reqVO)
        {
            var directory = GetDirectory(new DirectoryInfo(PATH + reqVO));
            return directory;
        }

        JToken GetDirectory(DirectoryInfo directory)
        {
            return JToken.FromObject(new
            {
                directory = directory.GetDirectories().Select(x => x.Name),
                //directoryNew = directory.EnumerateDirectories()
                //    .ToDictionary(x => x.Name, x => GetDirectory(x)),
                file = JToken.FromObject(new { 
                    name= directory.EnumerateFiles().Select(x => x.Name).ToList(),
                    modifyDate= directory.EnumerateFiles().Select(x => x.LastWriteTime).ToList()
                })
                
            });
        }
    }
}
