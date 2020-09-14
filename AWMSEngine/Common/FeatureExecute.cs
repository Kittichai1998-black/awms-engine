using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Common
{
    public static class FeatureExecute
    {
        public static TExecRes ExectProject<TExecReq, TExecRes>(string featurePluginCode,  AMWLogger logger, VOCriteria buVO, TExecReq req)
            where TExecRes : class
        {
            var staticVal = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
            string className = string.Empty;
            try
            {
                className = staticVal.GetConfigValue<string>(featurePluginCode);
            }
            catch
            {
                return null;
            }

            if (string.IsNullOrWhiteSpace(className))
                throw new AMWException(logger, AMWExceptionCode.V2001, "Feature '" + featurePluginCode + "' Field FullClassName Not Found");
            Type type = ClassType.GetClassType(className);
            if (type == null)
                throw new AMWException(logger, AMWExceptionCode.S0001, "Feature " + featurePluginCode + " Class Type Not Found.");
            var getInstanct = (IProjectEngine<TExecReq, TExecRes>)Activator.CreateInstance(type, new object[] { });
            return getInstanct.ExecuteEngine(logger, buVO, req);
        }

    }
}
