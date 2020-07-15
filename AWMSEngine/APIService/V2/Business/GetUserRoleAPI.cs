using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSModel.Constant.EnumConst;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.Business
{
    public class GetUserRoleAPI : BaseAPIService
    {
        public GetUserRoleAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        public class TRes
        {
            public long ID;
            public long? User_ID;
            public string Code;
            public string Name;
            public EntityStatus? Status;
        }

        protected override dynamic ExecuteEngineManual()
        {
            string ObjID = this.RequestVO.ID;
            var param = new Dapper.DynamicParameters();
            param.Add("userID", ObjID);
            var res = ADO.DataADO.GetInstant().QuerySP<TRes>(
                "SP_GET_USER_ROLE",
                param,
                this.BuVO);
            return res;
        }
    }
}
