using AMWUtil.Common;
using AWMSEngine.APIService;
using AWMSModel.Criteria;
using Microsoft.AspNetCore.Mvc;
using ProjectPanKan.Engine.Business;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace ProjectPanKan.APIService.WM
{
    public class PutCustomerFromFileServerAPI : BaseAPIService
    {
        public PutCustomerFromFileServerAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var res = new TransferMasterFromFileServer().Execute(this.Logger, this.BuVO,
                new TransferMasterFromFileServer.TReq()
                {
                    TableName = "ams_Customer",
                    FieldWhere = "Code"

                });
            return res;
        }
    }
}
