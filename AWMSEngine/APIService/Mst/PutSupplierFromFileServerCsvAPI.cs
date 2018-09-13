using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.General;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Mst
{
    public class PutSupplierFromFileServerCsvAPI : BaseAPIService
    {
        public PutSupplierFromFileServerCsvAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var res = new Engine.General.TransferMasterFromFileServerCsv().Execute(this.Logger, this.BuVO,
                new TransferMasterFromFileServerCsv.TReq()
                {
                    apiCode = "Supplier_Master_Transfer",
                    tableName = "ams_Supplier",
                    fieldWhere = "Code",
                    beginRowIndex = 1,
                    columnInfos = new List<TransferMasterFromFileServerCsv.TReq.ColumnInfo>()
                    {
                        new TransferMasterFromFileServerCsv.TReq.ColumnInfo(){ columnIndex = 0, fieldName = "Code", isMandatory = true },
                        new TransferMasterFromFileServerCsv.TReq.ColumnInfo(){ columnIndex = 1, fieldName = "Name", isMandatory = false },
                        new TransferMasterFromFileServerCsv.TReq.ColumnInfo(){ columnIndex = -1, fieldName = "Description", isMandatory =false }
                    }

                });
            return res;
        }
    }
}
