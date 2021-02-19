using ADO;
using ADO.WCSStaticValue;
using AMWUtil.Common;
using AMWUtil.Logger;
using AWCSEngine.APIFileService;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Controller
{
    public class ApiController
    {
        public dynamic Execute(long api_id, dynamic request, AMWLogger logger)
        {
            var api = StaticValueManager.GetInstant().GetAPIFile(api_id);
            var ctype = ClassType.GetClassType(api.FullClassName);
            var exec = (BaseAPIFileService)Activator.CreateInstance(ctype);
            return exec.Execute(request, logger);
        }
    }
}
