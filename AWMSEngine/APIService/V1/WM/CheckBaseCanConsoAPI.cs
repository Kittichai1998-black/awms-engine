using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.Business;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.WM
{
    public class CheckBaseCanConsoAPI : BaseAPIService
    {
        public CheckBaseCanConsoAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = new CheckBaseCanUseInDocument.TReq()
            {
                baseCode = this.RequestVO.baseCode,
                //desCustomerID = this.RequestVO.desCustomerID,
                docID = this.RequestVO.docID,
                //docType = AWMSModel.Constant.EnumConst.DocumentTypeID.GOODS_ISSUED
            };

            var res = new CheckBaseCanUseInDocument().Execute(this.Logger, this.BuVO, req);

            return res;
        }
    }
}
