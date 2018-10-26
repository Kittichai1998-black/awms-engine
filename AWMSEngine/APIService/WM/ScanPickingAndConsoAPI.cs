using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Engine.Business;
using AWMSEngine.Engine.Business.Issued;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.WM
{
    public class ScanPickingAndConsoAPI : BaseAPIService
    {
        public ScanPickingAndConsoAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            ScanIssuedToPicking.TReq req = ObjectUtil.DynamicToModel<ScanIssuedToPicking.TReq>(this.RequestVO);
            //var docItem = ADO.DataADO.GetInstant().SelectByID<amt_DocumentItem>(req.docItemID, this.BuVO);

            //if(req.action == VirtualMapSTOActionType.SELECT)
            //{
            //    if (!String.IsNullOrWhiteSpace(req.baseCode))
            //    {
            //        var doc = new Engine.Business.CheckBSTOCanUseInDocument().Execute(this.Logger, this.BuVO, new Engine.Business.CheckBSTOCanUseInDocument.TReq()
            //        {
            //            baseCode = req.baseCode,
            //            docID = docItem.Document_ID
            //        });
            //    }
            //}
            //else if(req.action != VirtualMapSTOActionType.REMOVE)
            //{
            //    throw new AMWException(this.Logger, AMWExceptionCode.V1002, "รอรับเฉพาะ Action Add & Remove");
            //}

            var res = new ScanIssuedToPicking().Execute(this.Logger, this.BuVO, req);
            return res;
        }
    }
}
