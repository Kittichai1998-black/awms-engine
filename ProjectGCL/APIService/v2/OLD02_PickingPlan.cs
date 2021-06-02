using ADO.WMSStaticValue;
using AMWUtil.Common;
using AWMSEngine.APIService;
using AWMSEngine.Controllers.V2;
using ProjectGCL.GCLModel.Criteria;
using ProjectGCL.GCLModel.Criterie;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.APIService.v2
{
    public class OLD02_PickingPlan : BaseAPIService
    {
        public OLD02_PickingPlan(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            AMWRequestCreateGIDocList temp = ObjectUtil.DynamicToModel<AMWRequestCreateGIDocList>(this.RequestVO);
            foreach(var rec in temp.RECORD)
            {
                var line = rec.LINE;

                TREQ_Picking_Plan req = new TREQ_Picking_Plan();

                var wh = StaticValueManager.GetInstant().Warehouses.First(x => x.Name2 == line.warehouse.Split(',').First());
                req.RECORD = new TREQ_Picking_Plan.TRecord()
                {
                    LINE = new List<TREQ_Picking_Plan.TRecord.TLine>()
                    {
                        new TREQ_Picking_Plan.TRecord.TLine()
                        {
                            API_REF = line.api_ref,
                            API_DATE_TIME = DateTime.Now,
                            CUSTOMER_CODE = line.customer,
                            IsFromAMS = true,
                            ACTIVIT_YTYPE = "S",
                            DOC_STATUS = "N",
                            PICK_GROUP = 0,
                            WMS_DOC = line.doc_wms,

                            PICK_DETAIL = new List<TREQ_Picking_Plan.TRecord.TLine.TPICK_DETAIL>()
                            {
                                new TREQ_Picking_Plan.TRecord.TLine.TPICK_DETAIL()
                                {
                                    LOT = line.lot,
                                    SKU = line.sku,
                                    UD_CODE = line.status,
                                    QTY = line.qty.Value,
                                    PRIORITY = line.Priority.ToString(),
                                    FROM_WH_ID = line.warehouse,
                                    FROM_LOCATION="",
                                    TO_Location_Destination = string.IsNullOrEmpty(line.Dock_no)?line.staging.Split(",").First(): line.Dock_no.Split(",").First(),
                                    TO_Location_Staging = line.staging.Split(",").First(),
                                    WMS_LINE = "1",
                                    UNIT = line.unit
                                }
                            }
                        }
                    }
                };
                Engine.v2.SCE02_CreatePickingPlan_Engine exec = new Engine.v2.SCE02_CreatePickingPlan_Engine();
                exec.Execute(this.Logger, this.BuVO, req);

            }

            return new TRES__return() { };
        }
    }
}
