using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.Engine;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Common
{
    public static class FeatureExecute
    {
        public static TExecRes ExectProject<TExecReq, TExecRes>(Type typeEngine,string featurePluginCode,  AMWLogger logger, VOCriteria buVO, TExecReq req)
            //where TEngine : BaseEngine<TExecReq,TExecRes>, new()
            where TExecRes : class
        {
            var staticVal = ADO.WMSStaticValue.StaticValueManager.GetInstant();
            string className = string.Empty;
            className = staticVal.GetConfigValue(featurePluginCode);
            if (string.IsNullOrWhiteSpace(className))
                return null;
                //throw new AMWException(logger, AMWExceptionCode.V2001, "Feature '" + featurePluginCode + "' Field FullClassName Not Found");
            Type type = ClassType.GetClassType(className);
            if (type == null)
                throw new AMWException(logger, AMWExceptionCode.S0001, "Feature " + featurePluginCode + " Class Type Not Found.");
            var getInstanct = (IProjectEngine<TExecReq, TExecRes>)Activator.CreateInstance(type, new object[] { });
            return getInstanct.Execute(typeEngine, logger, buVO, req);
        }

    }
}
