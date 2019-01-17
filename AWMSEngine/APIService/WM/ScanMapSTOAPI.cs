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
    public class ScanMapStoAPI : BaseAPIService
    {
        public ScanMapStoAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            var mapsto = ObjectUtil.DynamicToModel<StorageObjectCriteria>(this.RequestVO.mapsto);
            var res = new ScanMapStoV2().Execute(this.Logger, this.BuVO,
                new ScanMapStoV2.TReq()
                {
                    scanCode = this.RequestVO.scanCode,
                    warehouseID = this.RequestVO.warehouseID,
                    areaID = this.RequestVO.areaID,
                    batch = this.RequestVO.batch,
                    lot = this.RequestVO.lot,
                    amount = this.RequestVO.amount,
                    mode = (VirtualMapSTOModeType)this.RequestVO.mode,
                    options = this.RequestVO.options,
                    action = (VirtualMapSTOActionType)this.RequestVO.action,
                    mapsto = mapsto
                });
            if ((VirtualMapSTOActionType)this.RequestVO.action == VirtualMapSTOActionType.ADD)
                new ValidateObjectSizeOverLimit().Execute(this.Logger, this.BuVO, res);

            return res;
        }
    }
}
