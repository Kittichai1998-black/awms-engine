using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService.Mst
{
    public class CustomerPutFromFileServerCsvAPI : BaseAPIService
    {
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var res = new Engine.General.TransferMasterFromFileServerCsv().Execute(this.Logger, this.BuVO,
                new General.TransferMasterFromFileServerCsv.TReq()
                {
                    apiCode = "Customer_Master_Transfer",
                    tableName = "ams_Customer",
                    fieldWhere = "Code",
                    beginRowIndex = 1,
                    columnInfos = new List<General.TransferMasterFromFileServerCsv.TReq.ColumnInfo>()
                    {
                        new General.TransferMasterFromFileServerCsv.TReq.ColumnInfo(){ columnIndex = 0, fieldName = "Code", isMandatory = true },
                        new General.TransferMasterFromFileServerCsv.TReq.ColumnInfo(){ columnIndex = 1, fieldName = "Name", isMandatory = false },
                        new General.TransferMasterFromFileServerCsv.TReq.ColumnInfo(){ columnIndex = -1, fieldName = "Description", isMandatory =false }
                    }

                });
            return res;
        }
    }
}
