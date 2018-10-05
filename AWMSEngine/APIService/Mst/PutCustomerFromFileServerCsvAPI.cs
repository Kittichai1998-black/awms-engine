using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.General;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Mst
{
    public class PutCustomerFromFileServerCsvAPI : BaseAPIService
    {
        public PutCustomerFromFileServerCsvAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var res = new Engine.General.TransferMasterFromFileServerCsv().Execute(this.Logger, this.BuVO,
                new TransferMasterFromFileServerCsv.TReq()
                {
                    path = "Customer_Master_Transfer",
                    tableName = "ams_Customer",
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
