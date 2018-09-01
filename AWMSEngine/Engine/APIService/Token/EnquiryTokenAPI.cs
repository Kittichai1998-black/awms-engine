using AWMSEngine.Engine.General;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService.Token
{
    public class EnquiryTokenAPI : BaseAPIService
    {
        public EnquiryTokenAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            //new Validation.EnquiryTokenRequestValidate().Execute(this.Logger, this.BuVO);
            //string qry = "select * from xxx where id=? "
            var res1 = new General.EnquiryToken().Execute(this.Logger, this.BuVO,
                new EnquiryToken.TReqModle() { Token = this.RequestVO.token, SecretKey = this.RequestVO.secretKey });

            return res1;
        }
    }
}
