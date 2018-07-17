using AMWUtil.Common;
using AWMSEngine.Engine.Business;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.APIService.WM
{
    public class VRMapSTOAPI : BaseAPIService
    {
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var options = ObjectUtil.DynamicToModel<List<KeyValuePair<string, string>>>(this.RequestVO.options);
            var res = new VRMapSTO().Execute(this.Logger, this.BuVO,
                new Business.VRMapSTO.TReqModle()
                {
                    scanCode = this.RequestVO.scanCode,
                    amount = this.RequestVO.amount,
                    mode = (VirtualMapSTOModeType)this.RequestVO.mode,
                    options = options,
                    action = (VirtualMapSTOActionType)this.RequestVO.action,
                });
            if ((VirtualMapSTOActionType)this.RequestVO.action == VirtualMapSTOActionType.Add)
                new Validation.ValidateInnerSTOOverlimit().Execute(this.Logger, this.BuVO, res);

            return res;
        }
    }
}
