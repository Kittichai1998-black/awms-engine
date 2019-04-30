using AWMSEngine.Engine.General;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using Microsoft.AspNetCore.Mvc;
using AWMSModel.Constant.EnumConst;

namespace AWMSEngine.APIService.Mst
{
    public class PutWarehouseAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 54;
        }
        public PutWarehouseAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            List<ams_Warehouse> req = ObjectUtil.DynamicToModel<ams_Warehouse>(this.RequestVO.data);
            this.BeginTransaction();
            var res = new PutMaster<ams_Warehouse>().Execute(this.Logger, this.BuVO, new PutMaster<ams_Warehouse>.TReq { datas = req, whereFields = new List<string> { "ID" } });

            return res;
        }
    }
}
