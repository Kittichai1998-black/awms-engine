using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.General;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Mst
{
    public class PutSupplierFromFileServerAPI : BaseAPIService
    {
        public PutSupplierFromFileServerAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var res = new Engine.General.TransferMasterFromFileServer().Execute(this.Logger, this.BuVO,
                new TransferMasterFromFileServer.TReq()
                {
                    APICode = "Supplier_Master_Transfer",
                    TableName = "ams_Supplier",
                    FieldWhere = "Code",
                    ReqFieldNames = new string[] { "Code", "Name", "Description" },
                    ReqFieldNamesMandatory = new string[] { "Code", "Name" },
                    ResFieldNames = new string[] { "Code", "Name", "Description" },

                });
            return res;
        }
    }
}
