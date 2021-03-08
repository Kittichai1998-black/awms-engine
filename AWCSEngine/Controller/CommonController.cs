using ADO;
using ADO.WCSStaticValue;
using AMWUtil.Common;
using AMWUtil.Logger;
using AWCSEngine.Engine;
using AWCSEngine.Engine.APIFileRuntime;
using AWCSEngine.Engine.CommonEngine;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Controller
{
    public class CommonController : BaseController<CommonController>
    {
        public dynamic Execute(string api_code, dynamic request, string logref)
        {
            var api = StaticValueManager.GetInstant().GetAPIFile(api_code);
            var ctype = ClassType.GetClassType(api.FullClassName);
            var exec = (BaseCommonEngine<dynamic, dynamic>)Activator.CreateInstance(ctype, new object[] { logref });
            return exec.Execute(request);
        }
        public dynamic Execute(long api_id, dynamic request, string logref)
        {
            var api = StaticValueManager.GetInstant().GetAPIFile(api_id);
            var ctype = ClassType.GetClassType(api.FullClassName);

            var _exec = Activator.CreateInstance(ctype,new object[] { logref });
            var exec = (BaseAPIFileRuntime)_exec;
            return exec.Execute(request);
        }
    }
}
