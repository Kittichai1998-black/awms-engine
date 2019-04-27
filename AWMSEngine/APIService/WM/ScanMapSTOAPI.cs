using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business;
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
    public class ScanMapStoAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 80;
        }
        public ScanMapStoAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<ScanMapStoNoDoc.TReq>(this.RequestVO);
            var res = new ScanMapStoNoDoc().Execute(this.Logger, this.BuVO, req);
            if ((VirtualMapSTOActionType)this.RequestVO.action == VirtualMapSTOActionType.ADD)
                new ValidateObjectSizeOverLimit().Execute(this.Logger, this.BuVO, res);

            return res;
        }
    }
}
