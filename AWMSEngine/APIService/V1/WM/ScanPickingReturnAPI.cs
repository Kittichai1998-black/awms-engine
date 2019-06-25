using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.V2.Business.Picking;
using AWMSEngine.Engine.V2.Validation;
using AWMSModel.Constant.EnumConst;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.WM
{
    public class ScanPickingReturnAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 94;
        }
        public ScanPickingReturnAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }
        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<ScanPickingReturn.TReq>(this.RequestVO);
            var res = new ScanPickingReturn().Execute(this.Logger, this.BuVO, req);

            //if ((VirtualMapSTOActionType)this.RequestVO.action == VirtualMapSTOActionType.ADD)
            //    new ValidateObjectSizeOverLimit().Execute(this.Logger, this.BuVO, resScanMapSto);


            return res;
        }
    }
}
