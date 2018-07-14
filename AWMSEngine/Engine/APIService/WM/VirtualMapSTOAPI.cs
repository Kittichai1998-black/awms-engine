using AMWUtil.Common;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService.WM
{
    public class VirtualMapSTOAPI : BaseAPIService
    {
        protected override dynamic ExecuteEngineManual()
        {
            //this.CreateTransaction();
            var options = ObjectUtil.DynamicToModel<List<KeyValuePair<string, string>>>(this.RequestVO.options);
            var res = new Engine.Business.VirtualMapSTO().Execute(this.Logger, this.BuVO,
                new Business.VirtualMapSTO.TReqModle()
                {
                    scanCode = this.RequestVO.scanCode,
                    amount = this.RequestVO.amount,
                    mode = this.RequestVO.mode,
                    options = options,
                    action = (AWMSModel.Constant.EnumConst.VirtualMapSTOActionType)this.RequestVO.action,
                });
            return res;
        }
    }
}
