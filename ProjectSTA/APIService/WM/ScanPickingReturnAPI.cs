using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.APIService;   
using Microsoft.AspNetCore.Mvc;
using ProjectSTA.Engine.V2.Business.Picking;

namespace ProjectSTA.APIService.WM
{
    public class ScanPickingReturnAPI : BaseAPIService
    {
        public ScanPickingReturnAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
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
