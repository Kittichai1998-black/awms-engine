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
        [EngineParamAttr(EngineParamAttr.InOutType.Request, "RequiredFields", "ชื่อ Fields ใน BusinessVO ที่ต้องส่ง (ชื่อ Field ขั้นด้วย Comma(,) )")]
        public RefVO<string> InRequiedFields { get; set; }

        [EngineParamAttr(EngineParamAttr.InOutType.Request, "ThrowFlag", "throw Exception เมื่อ Validate ไม่ผ่าน (Y,N)")]
        public RefVO<string> InThrowFlag { get; set; }

        [EngineParamAttr(EngineParamAttr.InOutType.Response, "PassFlag", "ผลลัพธ์การ Validate กรณีให้ ThrowFlag=Y (Y,N)")]
        public RefVO<string> OutPassFlag { get; set; }

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
