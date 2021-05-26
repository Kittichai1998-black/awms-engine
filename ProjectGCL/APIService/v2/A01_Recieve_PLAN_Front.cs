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
    public class A01_Recieve_PLAN_Front : BaseAPIService
    {
        public A01_Recieve_PLAN_Front(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        public class TREQ
        {
            public string wms_doc;
            public string customer;
            public string to_wh;
            public string grade;
            public string lot;
            public int no_strat;
            public int no_end;
            public string sku;
            public string status;
            public decimal qty_pallet;
            public string unit;
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            TREQ temp = ObjectUtil.DynamicToModel<TREQ>(this.RequestVO);
            TREQ_Recieve_Plan req = new TREQ_Recieve_Plan();
            req.RECORD = new TREQ_Recieve_Plan.TRecord();
            var req_pallets = new List<TREQ_Recieve_Plan.TRecord.TLine.TPallet_Detail>();
            for(int i = temp.no_strat; i <= temp.no_end; i++)
            {
                req_pallets.Add(new TREQ_Recieve_Plan.TRecord.TLine.TPallet_Detail()
                {
                    PALLET_NO = string.Format("{0}{1}{2}{3}{4:0000}",
                            temp.grade, new string(' ', 9 - temp.grade.Length),
                            temp.lot, new string(' ', 11 - temp.lot.Length),
                            i),
                    GRADE_Barcode = temp.grade,
                    LOT_Barcode = temp.lot,
                    NO_Barcode = i.ToString("0000"),
                    EXP = null,
                    MFG = null,
                    LOT = temp.lot,
                    PALLET_STATUS = "N",
                    QTY_Pallet = temp.qty_pallet,
                    SKU = temp.sku,
                    UD_CODE = temp.status,
                    TO_LOCATION = "",
                    UNIT = temp.unit
                });
            }
            req.RECORD.LINE = new List<TREQ_Recieve_Plan.TRecord.TLine>()
            {
                new TREQ_Recieve_Plan.TRecord.TLine()
                {
                    WMS_DOC = temp.wms_doc,
                    CUSTOMER_CODE = temp.customer,
                    TO_WH_ID = temp.to_wh,
                    STATUS = temp.status,
                    UNIT = temp.unit,
                    QTY = req_pallets.Sum(x=>x.QTY_Pallet),
                    API_REF="AMS."+ObjectUtil.GenUniqID(),
                    API_DATE_TIME = DateTime.Now,
                    IsFromAMS = true,
                    Pallet_Detail = req_pallets
                }
            };
            Engine.v2.SCE01_CreateReceivePlan_Engine exec = new Engine.v2.SCE01_CreateReceivePlan_Engine();
            return exec.Execute(this.Logger, this.BuVO, req);
        }
    }
}
