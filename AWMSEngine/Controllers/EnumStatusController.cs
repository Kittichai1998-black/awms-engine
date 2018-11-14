using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSModel.Constant.EnumConst;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Controllers
{
    [Route("api/enum")]
    [ApiController]
    public class EnumStatusController : ControllerBase
    {
        [HttpGet("{key}")]
        public dynamic GetEnumStatus(string key)
        {
            Type t = EnumUtil.GetEnumType("AWMSModel.Constant.EnumConst." + key);
            MethodInfo method = typeof(EnumUtil).GetMethod("ListObjectView");
            method = method.MakeGenericMethod(t);
            var res = method.Invoke(this, new object[0]);
            return res;
        }
    }
}