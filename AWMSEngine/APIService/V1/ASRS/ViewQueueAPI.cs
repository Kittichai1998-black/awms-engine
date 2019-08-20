using AWMSEngine.Engine.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.ASRS
{
    public class ViewQueueAPI : BaseAPIService
    {
        public ViewQueueAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            IOType type = this.RequestVO.IOType;
            string palletCode = this.RequestVO.PalletCode;
            var res = new ViewQueue().Execute(this.Logger, this.BuVO, new ViewQueue.TReq
            {
                iotypp = type,
                palletCode = palletCode
            });

            return res;
        }
    }
}
