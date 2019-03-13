using AMWUtil.Common;
using AMWUtil.Logger;
using AWMSEngine.Common;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Validation
{
    public class BuVORequiredFields : BaseEngine
    {
        public class TReqModel
        {
            public string RequiedFields;
            public string ThrowFlag;
        }

        protected override void ExecuteEngine()
        {
            string[] fields = InRequiedFields.Value.Split(',');
            bool throwFlag = InThrowFlag.Value == YesNoConst.YES;
            OutPassFlag.Value = YesNoConst.YES;
            foreach (var f in fields)
            {
                dynamic v = this.BuVO.GetDynamic(f);
                if (AMWUtil.Common.ObjectUtil.IsZeroEmptyNull(v))
                {
                    OutPassFlag.Value = YesNoConst.NO;
                    if (throwFlag)
                        throw new AMWUtil.Exception.AMWException(this.Logger, AMWUtil.Exception.AMWExceptionCode.V0002, f);
                    else
                        new AMWUtil.Exception.AMWException(this.Logger, AMWUtil.Exception.AMWExceptionCode.V0002, f);
                }
            }
        }
    }
}
