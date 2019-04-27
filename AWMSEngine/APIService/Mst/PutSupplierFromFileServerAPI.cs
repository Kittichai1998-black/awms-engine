using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.General;
using AWMSModel.Constant.EnumConst;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Mst
{
    public class PutSupplierFromFileServerAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 53;
        }
        public PutSupplierFromFileServerAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var res = new Engine.General.TransferMasterFromFileServer().Execute(this.Logger, this.BuVO,
                new TransferMasterFromFileServer.TReq()
                {
                    TableName = "ams_Supplier",
                    FieldWhere = "Code",

                });
            return res;
        }
    }
}
