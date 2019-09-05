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
    public class TransferPankanAPI : BaseAPIService
    {
        public TransferPankanAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<TransferPankan.TReq>(this.RequestVO);
            var res = new TransferPankan().Execute(this.Logger, this.BuVO, req);
            StorageObjectCriteria stos = res;
            var overLimit = new AWMSEngine.Engine.V2.Validation.ValidateObjectSizeOverLimit();
            overLimit.Execute(this.Logger, this.BuVO, stos);
            return res;
        }
    }
}
