﻿using AMWUtil.Common;
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

            if (staticVal.Features.ContainsKey(fcode.ValueString))
                return null;
            var feature = staticVal.Features[fcode.ValueString];
            Type type = ClassType.GetClassType(feature.FullClassName);
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