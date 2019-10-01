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
        public static TExecRes ExectProject<TExecReq, TExecRes>(FeatureCode featureCode,  AMWLogger logger, VOCriteria buVO, TExecReq req)
            where TExecRes : class
        {
            var staticVal = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
            var fcode = AMWUtil.Common.AttributeUtil.Attribute<AMWUtil.Common.EnumValueAttribute>(featureCode);

            if (!staticVal.Features.Any(x=>x.Code == fcode.ValueString))
                return null;
            var feature = staticVal.GetFeature(fcode.ValueString);
            if (string.IsNullOrWhiteSpace(feature.FullClassName))
                throw new AMWException(logger, AMWExceptionCode.V2001, "Feature '"+ fcode.ValueString + "' Field FullClassName Not Found");
            Type type = ClassType.GetClassType(feature.FullClassName);
            if (type == null)
                throw new AMWException(logger, AMWExceptionCode.S0001, "Feature " + fcode.ValueString + " Class Type Not Found.");
            var getInstanct = (IProjectEngine<TExecReq, TExecRes>)Activator.CreateInstance(type, new object[] { });
            return getInstanct.ExecuteEngine(logger, buVO, req);
        }

        public static bool EvalExec(string fullClassName, dynamic data)
        {
            var eval = (IEval)Activator.CreateInstance(ClassType.GetClassType(fullClassName));
            return eval.exec(data);
        }
    }
}
