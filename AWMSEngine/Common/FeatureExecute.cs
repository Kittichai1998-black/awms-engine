using AMWUtil.Common;
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
        public static TRes ExectProjectFeature<TReq, TRes>(FeatureCode featureCode, AMWLogger logger, VOCriteria buVO, TReq reqVO)
            where TRes : class
        {
            var staticVal = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
            var fcode = AMWUtil.Common.AttributeUtil.Attribute<AMWUtil.Common.EnumValueAttribute>(featureCode);

            if (staticVal.Features.ContainsKey(fcode.ValueString))
                return null;
            var feature = staticVal.Features[fcode.ValueString];
            Type type = ClassType.GetClassType(feature.FullClassName);
            var getInstanct = (IProjectEngine<TReq, TRes>)Activator.CreateInstance(type, new object[] { });
            return getInstanct.ExecuteEngine(logger, buVO, reqVO);
        }
    }
}
