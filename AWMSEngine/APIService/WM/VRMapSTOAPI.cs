using AMWUtil.Common;
using AWMSEngine.Engine.Business;
using AWMSEngine.Engine.Validation;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.WM
{
    public class VRMapSTOAPI : BaseAPIService
    {
        public VRMapSTOAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var options = ObjectUtil.DynamicToModel<List<KeyValuePair<string, string>>>(this.RequestVO.options);
            var res = new VRMapSTO().Execute(this.Logger, this.BuVO,
                new VRMapSTO.TReqModle()
                {
                    scanCode = this.RequestVO.scanCode,
                    warehouseID = this.RequestVO.warehouseID,
                    areaID = this.RequestVO.areaID,
                    batch = this.RequestVO.batch,
                    lot = this.RequestVO.lot,
                    amount = this.RequestVO.amount,
                    mode = (VirtualMapSTOModeType)this.RequestVO.mode,
                    options = options,
                    action = (VirtualMapSTOActionType)this.RequestVO.action,
                });
            if ((VirtualMapSTOActionType)this.RequestVO.action == VirtualMapSTOActionType.ADD)
                new ValidateInnerSTOOverlimit().Execute(this.Logger, this.BuVO, res);

            return res;
        }
    }
}
