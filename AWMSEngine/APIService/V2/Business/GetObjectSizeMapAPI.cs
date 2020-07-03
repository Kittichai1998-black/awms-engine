using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSModel.Constant.EnumConst;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.V2.Business
{
    public class GetObjectSizeMapAPI : BaseAPIService
    {
        public GetObjectSizeMapAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        public class TRes
        {
            public long ID;
            public long? ObjMapID;
            public string Code;
            public string Name;
            public long? ObjectSize_ID;
            public long? InnerObjectSize_ID;
            public int ObjectType;
            public EntityStatus? Status;
        }

        protected override dynamic ExecuteEngineManual()
        {
            string ObjID = this.RequestVO.ID;
            var param = new Dapper.DynamicParameters();
            param.Add("ID", ObjID);
            var res = ADO.DataADO.GetInstant().QuerySP<TRes>(
                "SP_GET_MAP_OBJECTSIZE",
                param,
                this.BuVO);
            return res;
        }
    }
}
