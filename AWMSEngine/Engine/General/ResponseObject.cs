using AWMSEngine.Common;
using AWMSModel.Constant.StringConst;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.General
{
    public class ResponseObject : BaseEngine<object, dynamic>
    {

        protected override dynamic ExecuteEngine(object reqVO)
        {
            ExpandoObject res = new ExpandoObject();
            if(reqVO != null)
            {
                if(reqVO is ICollection)
                {
                    res.TryAdd("datas", reqVO);
                }
                else
                {
                    var t = reqVO.GetType();
                    var infos = t.GetFields();
                    foreach (var info in infos)
                    {
                        object v = info.GetValue(reqVO);
                        bool x = res.TryAdd(info.Name, v);
                    }
                    var infos2 = t.GetProperties();
                    foreach (var info in infos2)
                    {
                        object v = info.GetValue(reqVO);
                        bool x = res.TryAdd(info.Name, v);
                    }
                }
            }
            object resapi = this.BuVO.Get<dynamic>(BusinessVOConst.KEY_RESULT_API);
            res.TryAdd(BusinessVOConst.KEY_RESULT_API, resapi);
            this.BuVO.Set(BusinessVOConst.KEY_RESPONSE, res);
            return res;
        }
    }
}
