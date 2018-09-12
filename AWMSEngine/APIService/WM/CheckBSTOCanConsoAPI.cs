using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.Business.Consolidate;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.WM
{
    public class CheckBSTOCanConsoAPI : BaseAPIService
    {
        public CheckBSTOCanConsoAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = new CheckBSTOCanUseInDocument.TReq()
            {
                baseCode = this.RequestVO.baseCode,
                desCustomerID = this.RequestVO.desCustomerID,
                docID = this.RequestVO.docID,
                docType = AWMSModel.Constant.EnumConst.DocumentTypeID.GOODS_ISSUED
            };
            var res = new CheckBSTOCanUseInDocument().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
