﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.Engine.APIService.Mst
{
    public class SupplierPutFromFileServerCsvAPI : BaseAPIService
    {
        public SupplierPutFromFileServerCsvAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var res = new Engine.General.TransferMasterFromFileServerCsv().Execute(this.Logger, this.BuVO,
                new General.TransferMasterFromFileServerCsv.TReq()
                {
                    apiCode = "Supplier_Master_Transfer",
                    tableName = "ams_Supplier",
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
