using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService.Mst
{
    public class SupplierPutFromFileServerAPI : BaseAPIService
    {
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var res = new Engine.General.PutMasterDateFromFileServer().Execute(this.Logger, this.BuVO,
                new General.PutMasterDateFromFileServer.TReq()
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
