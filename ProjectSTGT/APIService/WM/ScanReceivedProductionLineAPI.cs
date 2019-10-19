using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.APIService;
using AWMSEngine.Engine.V2.Business;
using Microsoft.AspNetCore.Mvc;
using ProjectSTGT.Engine.Received;

namespace ProjectSTGT.APIService.WM
{
    public class ScanReceivedProductionLineAPI : BaseAPIService
    {
        public ScanReceivedProductionLineAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<ScanMapStoNoDoc.TReq>(this.RequestVO);
            var res = new ScanReceivedProductionLine().Execute(this.Logger, this.BuVO, req);

            //if ((VirtualMapSTOActionType)this.RequestVO.action == VirtualMapSTOActionType.ADD)
            //    new ValidateObjectSizeOverLimit().Execute(this.Logger, this.BuVO, resScanMapSto);


            return res;
        }
    }
}
