using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.Business.Consolidate;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.UI
{
    public class BSTOMatchGIDocCheckAPI : BaseAPIService
    {
        public BSTOMatchGIDocCheckAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var res = new BSTOMatchDocCheck().Execute(this.Logger, this.RequestVO,
                new BSTOMatchDocCheck.TReq()
                {
                    baseCode = this.RequestVO.baseCode,
                    desCustomerID = this.RequestVO.desCustomerID,
                    docID = this.RequestVO.docID,
                    docType = AWMSModel.Constant.EnumConst.DocumentTypeID.GOODS_ISSUED
                });
            return res;
        }
    }
}
