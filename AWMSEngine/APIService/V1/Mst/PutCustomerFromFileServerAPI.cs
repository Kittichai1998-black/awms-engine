using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.General;
using AWMSModel.Constant.EnumConst;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Mst
{
    public class PutCustomerFromFileServerAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 49;
        }
        public PutCustomerFromFileServerAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var res = new Engine.General.TransferMasterFromFileServer().Execute(this.Logger, this.BuVO,
                new TransferMasterFromFileServer.TReq()
                {
                    TableName = "ams_Customer",
                    FieldWhere = "Code"

                });
            return res;
        }
    }
}
