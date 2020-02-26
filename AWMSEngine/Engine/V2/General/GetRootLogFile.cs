using AWMSModel.Criteria;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.General
{
    public class GetRootLogFile : BaseEngine<NullCriteria, dynamic>
    {
        protected override dynamic ExecuteEngine(NullCriteria reqVO)
        {
            var directory = GetDirectory(new DirectoryInfo(@"D:\logs"));
            return directory;
        }

        JToken GetDirectory(DirectoryInfo directory)
        {
            return JToken.FromObject(new
            {
                directory = directory.EnumerateDirectories()
                    .ToDictionary(x => x.Name, x => GetDirectory(x)),
                file = directory.EnumerateFiles().Select(x => x.Name).ToList()
            });
        }
    }
}
