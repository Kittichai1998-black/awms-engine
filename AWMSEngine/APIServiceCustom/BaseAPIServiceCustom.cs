using AMWUtil.Common;
using AMWUtil.DataAccess.Http;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO;
using AWMSEngine.Engine.V2.General;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Dynamic;
using System.Linq;
using System.Threading;

namespace AWMSEngine.APIServiceCustom
{
    public abstract class BaseAPIServiceCustom : APIService.BaseAPIService
    {

        public BaseAPIServiceCustom(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true)
            : base(controllerAPI, apiServiceID, isAuthenAuthorize, false)
        {

        }


    }
}
