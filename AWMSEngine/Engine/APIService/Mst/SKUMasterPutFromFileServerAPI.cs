using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService.Mst
{
    public class SKUMasterPutFromFileServerAPI : BaseAPIService
    {
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var res = new Engine.General.PutMasterDateFromFileServer().Execute(this.Logger, this.BuVO,
                new General.PutMasterDateFromFileServer.TReq()
                {
                    APICode = "Product_Master_Transfer",
                    TableName = "ams_SKUMaster",
                    FieldWhere = "Code",
                    ReqFieldNames = new string[] { "Code", "Name", "Description", "SKUMasterType_ID" },
                    ReqFieldNamesMandatory = new string[] { "Code", "Name", "SKUMasterType_ID" },
                    ResFieldNames = new string[] { "Code", "Name", "Description", "SKUMasterType_ID" },

                });
            return res;
        }
    }
}
