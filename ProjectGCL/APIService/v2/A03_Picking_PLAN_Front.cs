using AMWUtil.Common;
using AWMSEngine.APIService;
using ProjectGCL.GCLModel.Criterie;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.APIService.v2
{
    public class A03_Picking_PLAN_Front : BaseAPIService
    {
        public class TREQ
        {
            public string wms_doc;
            public string customer;
            public string to_wh;
            public string grade;
            public string lot;
            public string sku;
            public string status;
            public decimal qty_pick;
            public string unit;
            public string dock;
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            TREQ temp = ObjectUtil.DynamicToModel<TREQ>(this.RequestVO);
            TREQ_Picking_Plan req = new TREQ_Picking_Plan();
            req.RECORD = new TREQ_Picking_Plan.TRecord();
            req.RECORD.LINE = new List<TREQ_Picking_Plan.TRecord.TLine>()
            {
                new TREQ_Picking_Plan.TRecord.TLine()
                {
                    WMS_DOC = temp.wms_doc,
                    CUSTOMER_CODE = temp.customer,
                    ACTIVIT_YTYPE = "S",
                    DOC_STATUS = "N",
                    PICK_GROUP = DateTime.Now.Ticks,
                    API_REF="AMS."+ObjectUtil.GenUniqID(),
                    API_DATE_TIME = DateTime.Now,
                    IsFromAMS = true,
                    PICK_DETAIL = new List<TREQ_Picking_Plan.TRecord.TLine.TPICK_DETAIL>()
                    {
                        new TREQ_Picking_Plan.TRecord.TLine.TPICK_DETAIL()
                        {
                            LOT = temp.lot,
                            SKU = temp.sku,
                            UD_CODE = null,
                            FROM_LOCATION = null,
                            FROM_WH_ID = temp.to_wh,
                            PRIORITY = "1",
                            QTY = temp.qty_pick,
                            UNIT = temp.unit,
                            WMS_LINE = "1",
                            TO_Location_Destination = "808",
                            TO_Location_Staging = "808"
                        }
                    },
                }
            };
            Engine.v2.SCE02_CreatePickingPlanEngine exec = new Engine.v2.SCE02_CreatePickingPlanEngine();
            return exec.Execute(this.Logger, this.BuVO, req);
        }
    }
}