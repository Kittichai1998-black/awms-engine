using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Engine.APIService.Mst
{
    public class CustomerPutFromFileServerAPI : BaseAPIService
    {
        public CustomerPutFromFileServerAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var res = new Engine.General.TransferMasterFromFileServer().Execute(this.Logger, this.BuVO,
                new General.TransferMasterFromFileServer.TReq()
                {
                    APICode = "Customer_Master_Transfer",
                    TableName = "ams_Customer",
                    FieldWhere = "Code",
                    ReqFieldNames = new string[] { "Code", "Name", "Description" },
                    ReqFieldNamesMandatory = new string[] { "Code", "Name" },
                    ResFieldNames = new string[] { "Code", "Name", "Description" },

                });
            return res;
        }
    }
}
