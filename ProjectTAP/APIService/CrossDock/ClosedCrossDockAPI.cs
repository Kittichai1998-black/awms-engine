using AMWUtil.Common;
using AWMSEngine.APIService;
using Microsoft.AspNetCore.Mvc;
using ProjectTAP.Engine.Business.Crossdock;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectTAP.APIService.CrossDock
{
    public class ClosedCrossDockAPI : BaseAPIService
    {
        public ClosedCrossDockAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        public override int APIServiceID()
        {
            throw new NotImplementedException();
        }

        protected override dynamic ExecuteEngineManual()
        {
            var req = ObjectUtil.DynamicToModel<GetIssueCrossdockDoc.TReq>(this.RequestVO);
            long docID = req.docID;
            var close = new ClosedCrossDock();
            var res = close.Execute(this.Logger, this.BuVO, docID);
            return res;
        }
    }
}
