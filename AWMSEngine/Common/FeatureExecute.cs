using AMWUtil.Common;
using AMWUtil.Logger;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Common
{
    public static class FeatureExecute
    {
        public static dynamic EngineExec(AWMSModel.Constant.EnumConst.FeatureCode code,AMWLogger logger, VOCriteria buVO,dynamic reqVO)
        {
            var staticVal = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
            var c = AMWUtil.Common.AttributeUtil.Attribute<AMWUtil.Common.EnumValueAttribute>(code);
            if (c != null)
            {
                if (staticVal.Features.ContainsKey(c.ValueString))
                    throw new Exception("Feature '" + c.ValueString + "' not found");
                var feature = staticVal.Features[c.ValueString];
                Type type = ClassType.GetClassType(feature.FullClassName);//Type.GetType(className.FullClassName);
                AWMSEngine.Engine.V2.Business.ClosedDocument x = new Engine.V2.Business.ClosedDocument();
                var getInstanct = (AWMSEngine.Engine.BaseEngine<dynamic, dynamic>)Activator.CreateInstance(type, new object[] { });
                var res = getInstanct.Execute(logger, buVO, reqVO);
                return res;
            }
            return null;
        }
    }
}
