﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ProjectTAP.Controllers
{
    public class V2Controller : AWMSEngine.Controllers.BaseV2Controller
    {
        protected override Type GetClass(string fullName)
        {
            Type t = Type.GetType(fullName);
            return t;
        }
    }
}