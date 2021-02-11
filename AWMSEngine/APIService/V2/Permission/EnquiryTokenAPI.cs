using AWMSEngine.Engine.V2.General;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.V2.Permission
{
    public class EnquiryTokenAPI : BaseAPIService
    {
        public EnquiryTokenAPI(AWMSEngine.Controllers.V2.BaseController controllerAPI, int apiServiceID = 0) : base(controllerAPI, apiServiceID, false)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            //new Validation.EnquiryTokenRequestValidate().Execute(this.Logger, this.BuVO);
            //string qry = "select * from xxx where id=? "
            var res1 = new EnquiryToken().Execute(this.Logger, this.BuVO,
                new EnquiryToken.TReqModle() { Token = this.RequestVO.token, SecretKey = this.RequestVO.secretKey });

            return res1;
        }
    }
}
