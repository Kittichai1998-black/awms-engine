using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using AMWUtil.Common;
using AWCSWebApp.GCLModel.Criterie;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.APIService.v2
{
    public class RecivePLAN : AWMSEngine.APIService.BaseAPIService
    {
        protected override dynamic ExecuteEngineManual()
        {
            TREQ_Recieve_Plan request = ObjectUtil.DynamicToModel<TREQ_Recieve_Plan>(this.RequestVO);
            request.RECORD.LINE.ForEach(req =>
            {
                this.exec(req);
                
            });
            return new { };
        }

        private TRES__return exec(TREQ_Recieve_Plan.TRecord.TLine req)
        {
            try
            {
                this.BeginTransaction();

                var wh = ADO.WMSStaticValue.StaticValueManager.GetInstant().Warehouses.FirstOrDefault(x => x.Name == req.TO_WH_ID);
                if (wh == null) throw new Exception("TO_WH_ID ไม่ถูกต้อง");

                amt_Document doc = new amt_Document()
                {
                    ActionTime = req.API_DATE_TIME,
                    Sou_Warehouse_ID = wh.ID,
                    Des_AreaMaster_ID = wh.ID,
                    EventStatus = DocumentEventStatus.NEW,
                    Ref1 = req.API_REF,
                    Ref2 = req.WMS_DOC,
                };
                doc = ADO.WMSDB.DocumentADO.GetInstant().Create(doc, this.BuVO);
                req.Pallet_Detail.ForEach(req_pl =>
                {
                    var doci = new amt_DocumentItem()
                    {
                        Ref1 = req_pl.PALLET_NO,
                        AuditStatus = EnumUtil.GetValueEnum<AuditStatus>(req_pl.PALLET_STATUS),
                        BaseQuantity = req_pl.QTY_Pallet,
                    };
                });
                //ADO.WMSDB.DocumentADO.GetInstant().CreateItem()
                this.CommitTransaction();
                return new TRES__return()
                {
                    API_REF = req.API_REF,
                    Date_time = DateTime.Now,
                    _result = new TRES__return.TResult() { status = 1, message = "success" }
                };
            }
            catch(Exception ex)
            {
                this.RollbackTransaction();
                return new TRES__return()
                {
                    API_REF = req.API_REF,
                    Date_time = DateTime.Now,
                    _result = new TRES__return.TResult() { status = 0, message = ex.Message }
                };
            }
            
        }
    }
}
