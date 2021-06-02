using AMWUtil.Common;
using AWMSEngine.APIService;
using AWMSEngine.Controllers.V2;
using ProjectGCL.GCLModel.Criterie;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.APIService.v2
{
    public class A03_Picking_PLAN_Front : BaseAPIService
    {
        public A03_Picking_PLAN_Front(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        public class TREQ
        {
            public int priority = 1;
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
                            UD_CODE = temp.status,
                            FROM_LOCATION = null,
                            FROM_WH_ID = temp.to_wh,
                            PRIORITY = temp.priority.ToString(),
                            QTY = temp.qty_pick,
                            UNIT = temp.unit,
                            WMS_LINE = "1",
                            TO_Location_Destination = temp.dock,
                            TO_Location_Staging = temp.dock
                        }
                    },
                }
            };
            Engine.v2.SCE02_CreatePickingPlan_Engine exec = new Engine.v2.SCE02_CreatePickingPlan_Engine();
            return exec.Execute(this.Logger, this.BuVO, req);
        }
    }
}