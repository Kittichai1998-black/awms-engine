using AMWUtil.Logger;
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
        [EngineParamAttr(EngineParamAttr.InOutType.Request, typeof(string), "ชื่อ Fields ใน BusinessVO ที่ต้องส่ง (ชื่อ Field ขั้นด้วย Comma(,) )")]
        public const string IN_KEY_FIELDNAMES = "RequiredFields";

        [EngineParamAttr(EngineParamAttr.InOutType.Request, typeof(string), "throw Exception เมื่อ Validate ไม่ผ่าน (Y,N)")]
        public const string IN_KEY_THROWFLAG = "ThrowFlag";

        [EngineParamAttr(EngineParamAttr.InOutType.Request, typeof(string), "ผลลัพธ์การ Validate กรณีให้ ThrowFlag=Y (Y,N)")]
        public const string OUT_KEY_PASSFLAG = "PassFlag";

        protected override void ExecuteEngine()
        {
            string[] fields = this.EngineVO.GetString(IN_KEY_FIELDNAMES).Split(',');
            bool throwFlag = this.EngineVO.GetString(IN_KEY_THROWFLAG) == YesNoConst.YES;
            this.EngineVO.Set(OUT_KEY_PASSFLAG, YesNoConst.YES);
            foreach (var f in fields)
            {
                dynamic v = this.BuVO.GetDynamic(f);
                if (AMWUtil.Common.ObjectUtil.IsZeroEmptyNull(v))
                {
                    this.EngineVO.Set(OUT_KEY_PASSFLAG, YesNoConst.NO);
                    if (throwFlag)
                        throw new AMWUtil.Exception.AMWException(this.Logger, AMWUtil.Exception.AMWExceptionCode.V0002, f);
                    else
                        new AMWUtil.Exception.AMWException(this.Logger, AMWUtil.Exception.AMWExceptionCode.V0002, f);
                }
            }
        }
    }
}
