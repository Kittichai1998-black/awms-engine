using AWMSEngine.Common;
using AWMSModel.Constant.StringConst;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.General
{
    public class ListResponseObject : BaseEngine<dynamic,dynamic>
    {
        protected override dynamic ExecuteEngine(dynamic reqVO)
        {
            ExpandoObject res = new ExpandoObject();
            var t = reqVO;
            //var infos = t.GetFields();
            foreach(var info in t)
            {
                object objinfo = info.Value;
                string strkey = info.Key.ToString();
                res.TryAdd(strkey, objinfo);
            }
            object resapi = this.BuVO.Get<dynamic>(BusinessVOConst.KEY_RESULT_API);
            res.TryAdd(BusinessVOConst.KEY_RESULT_API, resapi);
            this.BuVO.Set(BusinessVOConst.KEY_RESPONSE, res);
            return res;
            
        }
    }
}
