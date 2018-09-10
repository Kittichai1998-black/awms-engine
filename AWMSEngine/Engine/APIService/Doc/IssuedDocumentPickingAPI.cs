using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Engine.APIService.Doc
{
    public class IssuedDocumentPickingAPI : BaseAPIService
    {
        public IssuedDocumentPickingAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            throw new NotImplementedException();
        }
    }
}
