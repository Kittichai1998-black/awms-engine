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
        public GetObjectSizeMapAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        public override int APIServiceID()
        {
            return 108;
        }

        public class TRes
        {
            public long ID;
            public string Code;
            public string Name;
            public long? OuterObjectSize_ID;
            public long? InnerObjectSize_ID;
            public decimal? MaxQuantity;
            public decimal? MinQuantity;
            public int ObjectType;
            public EntityStatus Status;
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
