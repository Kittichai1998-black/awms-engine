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
    public class ReturnAPI : BaseAPIService
    {
        public ReturnAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var req = ObjectUtil.DynamicToModel<ScanMapStoNoDoc.TReq>(this.RequestVO);
            var res = new ScanMapStoNoDoc().Execute(this.Logger, this.BuVO, req);
            if ((VirtualMapSTOActionType)this.RequestVO.action == VirtualMapSTOActionType.ADD)
                new ValidateObjectSizeOverLimit().Execute(this.Logger, this.BuVO, res);
            this.CommitTransaction();


            this.BeginTransaction();
            var reqInsert = ObjectUtil.DynamicToModel<InsertToDocItemSto.TDocReq>(this.RequestVO);
            var resInsert = new InsertToDocItemSto().Execute(this.Logger, this.BuVO, reqInsert);
            return resInsert;



        }
    }
}
