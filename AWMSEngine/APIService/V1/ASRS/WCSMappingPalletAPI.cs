using AMWUtil.Common;
using AWMSEngine.Engine.Business.Received;
using AWMSModel.Criteria;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.APIService.ASRS
{
    public class WCSMappingPalletAPI : BaseAPIService
    {
        public WCSMappingPalletAPI(ControllerBase controllerAPI,int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            var palletList = new List<PalletDataCriteria>();
            foreach (var row in this.RequestVO.data)
            {
                palletList.Add(new PalletDataCriteria()
                {
                    souWarehouseCode = "Sou_Warehouse_ID=" + row.source,
                    code = row.code,
                    batch = row.batch,
                    qty = row.qty,
                    unit = row.baseunit,
                    warehouseCode = this.RequestVO.warehouseCode,
                    areaCode = this.RequestVO.areaCode,
                });
            }

            var req = new WCSMappingPallet.TReq() {
                palletData = palletList
            };

            var res = new WCSMappingPallet().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
