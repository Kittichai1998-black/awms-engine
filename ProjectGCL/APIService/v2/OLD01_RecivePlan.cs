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
    public class OLD01_RecivePlan : BaseAPIService
    {
        public OLD01_RecivePlan(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            AMWRequestCreateGRDocList temp = ObjectUtil.DynamicToModel<AMWRequestCreateGRDocList>(this.RequestVO);
            foreach(var rec in temp.RECORD)
            {
                var line = rec.LINE;

                TREQ_Recieve_Plan req = new TREQ_Recieve_Plan();

                var wh = StaticValueManager.GetInstant().Warehouses.First(x => x.Name2 == line.warehouse.Split(',').First());
                req.RECORD = new TREQ_Recieve_Plan.TRecord()
                {
                    LINE = new List<TREQ_Recieve_Plan.TRecord.TLine>()
                    {
                        new TREQ_Recieve_Plan.TRecord.TLine()
                        {
                            BookZone = "inbound",
                            BookCount = line.List_Pallet.Length,
                            API_REF = line.api_ref,
                            API_DATE_TIME = line.Date_time,
                            CUSTOMER_CODE = line.customer,
                            IsFromAMS = true,
                            QTY = line.qty??0,
                            STATUS = line.status,
                            TO_WH_ID = wh.Name,
                            UNIT = line.unit,
                            WMS_DOC = line.doc_wms,

                            Pallet_Detail = line.List_Pallet.Select(x =>
                            {
                                string grade = x.Substring(0,9).Trim();
                                string lot = x.Substring(9,11).Trim();
                                string no = x.Substring(20).Trim();
                                var pl = new TREQ_Recieve_Plan.TRecord.TLine.TPallet_Detail()
                                {
                                    GRADE_Barcode = grade,
                                    LOT = lot,
                                    LOT_Barcode = lot,
                                    NO_Barcode = no,
                                    MFG = null,
                                    EXP = null,
                                    PALLET_NO = x,
                                    PALLET_STATUS = line.Check_recieve,
                                    QTY_Pallet = line.qty_per_pallet??0,
                                    SKU = line.sku,
                                    TO_LOCATION = "",
                                    UD_CODE = line.status,
                                    UNIT = line.unit
                                };
                                return pl;
                            }).ToList()
                        }
                    }
                };
                Engine.v2.SCE01_CreateReceivePlan_Engine exec = new Engine.v2.SCE01_CreateReceivePlan_Engine();
                exec.Execute(this.Logger, this.BuVO, req);

            }

            return new TRES__return() { };
        }
    }
}
