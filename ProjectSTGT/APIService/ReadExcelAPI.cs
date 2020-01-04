using AWMSEngine.APIService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectSTGT.APIService
{
    public class ReadExcelAPI : BaseAPIService
    {
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var engine = new ProjectSTGT.Engine.Worker.ReadExcelFile();
            engine.Execute(this.Logger, this.BuVO, null);
            return null;
        }
    }
}
