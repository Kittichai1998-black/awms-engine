using AMWUtil.Logger;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.APIFileService
{
    public abstract class BaseAPIFileService
    {
        protected abstract dynamic ExecuteClid(dynamic request, AMWLogger logger);
        public dynamic Execute(dynamic request, AMWLogger logger)
        {
            return this.ExecuteClid(request, logger);
        }

    }
}
