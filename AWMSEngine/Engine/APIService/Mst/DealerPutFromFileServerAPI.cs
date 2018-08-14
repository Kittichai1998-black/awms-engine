using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService.Mst
{
    public class DealerPutFromFileServerAPI : BaseAPIService
    {
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var res = new Engine.General.TransferMasterFromFileServer().Execute(this.Logger, this.BuVO,
                new General.TransferMasterFromFileServer.TReq()
                {
                    APICode = "Dealer_Master_Transfer",
                    TableName = "ams_Dealer",
                    FieldWhere = "Code",
                    ReqFieldNames = new string[] { "Code", "Name", "Description" },
                    ReqFieldNamesMandatory = new string[] { "Code", "Name" },
                    ResFieldNames = new string[] { "Code", "Name", "Description" },

                });
            return res;
        }
    }
}
