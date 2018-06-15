using AWMSEngine.Common;
using AWMSModel.Constant.StringConst;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.General
{
    public class ResponseObject : BaseEngine
    {
        public const string KEY_IN_BuVOKeyResponse = "BuVOKeyResponse";
        [EngineParamAttr(EngineParamAttr.InOutType.Request, KEY_IN_BuVOKeyResponse, "")]
        public RefVO<dynamic> InBuVOKeyResponse { get; set; }

        protected override void ExecuteEngine()
        {
            ExpandoObject res = new ExpandoObject();
            var t = this.InBuVOKeyResponse.ValueType();
            var infos = t.GetFields();
            foreach(var info in infos)
            {
                object v = info.GetValue(this.InBuVOKeyResponse.Value);
                bool x = res.TryAdd(info.Name, v);
            }
            object resapi = this.BuVO.Get<dynamic>(BusinessVOConst.KEY_RESULT_API);
            res.TryAdd(BusinessVOConst.KEY_RESULT_API, resapi);
            this.BuVO.Set(BusinessVOConst.KEY_RESPONSE, res);
            
        }
    }
}
