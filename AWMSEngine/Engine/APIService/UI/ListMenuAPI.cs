using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using AWMSEngine.Common;

namespace AWMSEngine.Engine.APIService.UI
{
    public class ListMenuAPI : BaseAPIService
    {
        protected override dynamic ExecuteEngineManual()
        {
            var res1 = new General.ListMenu().Execute(this.Logger, this.BuVO,
                new General.ListMenu.TReqModel() { Token = this.RequestVO.token });

            return res1;
        }
    }
}
