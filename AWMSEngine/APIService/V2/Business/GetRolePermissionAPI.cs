using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMSModel.Constant.EnumConst;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.Business
{
    public class GetRolePermissionAPI : BaseAPIService
    {
        public GetRolePermissionAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        public class TRes
        {
            public long ID;
            public long? RoleID;
            public string Code;
            public string Name;
            public string Description;
            public EntityStatus? Status;
            public string RolePermissionID;
        }

        protected override dynamic ExecuteEngineManual()
        {
            string ObjID = this.RequestVO.ID;
            var param = new Dapper.DynamicParameters();
            param.Add("roleID", ObjID);
            var res = ADO.WMSDB.DataADO.GetInstant().QuerySP<TRes>(
                "SP_GET_ROLE_PERMISSION",
                param,
                this.BuVO);
            return res;
        }
    }
}
