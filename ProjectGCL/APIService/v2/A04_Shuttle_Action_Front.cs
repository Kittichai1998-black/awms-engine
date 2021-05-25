using ADO.WMSDB;
using ADO.WMSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using AMWUtil.Common;
using AWMSEngine.Controllers.V2;
using ProjectGCL.GCLModel.Criterie;
using ProjectGCL.GCLModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.APIService.v2
{
    public class A04_Shuttle_Action_Front : AWMSEngine.APIService.BaseAPIService
    {
        public class TReq
        {
            public amt_Wcs_Action.TMode mode;
            public long? id;
            public string location;
            public string shuttle;
        }

        public A04_Shuttle_Action_Front(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<TReq>(this.RequestVO);
            var loc = string.IsNullOrEmpty(req.location) ? null : ADO.WMSDB.DataADO.GetInstant()
                .SelectBy<ams_AreaLocationMaster>("Name", req.location, BuVO)
                .FirstOrDefault(x=>x.Status == AMSModel.Constant.EnumConst.EntityStatus.ACTIVE);
            var area = string.IsNullOrEmpty(req.location) ? null : 
                StaticValueManager.GetInstant().AreaMasters.FirstOrDefault(x => x.ID == loc.AreaMaster_ID);
            var wh = string.IsNullOrEmpty(req.location) ? null :
                StaticValueManager.GetInstant().Warehouses.FirstOrDefault(x => x.ID == area.Warehouse_ID);


            if (req.mode == amt_Wcs_Action.TMode.Cancel)
            {
                var act = DataADO.GetInstant().SelectByID<amt_Wcs_Action>(req.id, BuVO);
                if (act.Status != EntityStatus.ACTIVE)
                    throw new Exception("คิวงานจบแล้ว");
                if (act.Mode == amt_Wcs_Action.TMode.Sorting)
                    ADO.WMSDB.WcsADO.GetInstant()
                        .SP_CANCEL_QUEUE_COUNT(act.ApiRef, BuVO);
                else if (act.Mode == amt_Wcs_Action.TMode.Counting)
                    ADO.WMSDB.WcsADO.GetInstant()
                        .SP_CANCEL_QUEUE_COUNT(act.ApiRef, BuVO);
                act.Status = EntityStatus.REMOVE;
                DataADO.GetInstant().Insert<amt_Wcs_Action>(act, BuVO);
            }
            else
            {
                string _apiRef = string.Empty;
                if (req.mode == amt_Wcs_Action.TMode.Sorting)
                    ADO.WMSDB.WcsADO.GetInstant()
                        .SP_QUEUE_ARRANGEBAY(wh.Code, loc.Bay.Value, loc.Lv.Value, 1, out _apiRef, BuVO);
                else if (req.mode == amt_Wcs_Action.TMode.Counting)
                    ADO.WMSDB.WcsADO.GetInstant()
                        .SP_QUEUE_COUNTBAY(wh.Code, loc.Bay.Value, loc.Lv.Value, 1, out _apiRef, BuVO);
                else if (req.mode == amt_Wcs_Action.TMode.Check_IN)
                    ADO.WMSDB.WcsADO.GetInstant()
                        .SP_SHULOWBAT(req.shuttle, BuVO);
                else if (req.mode == amt_Wcs_Action.TMode.Check_Out)
                    ADO.WMSDB.WcsADO.GetInstant()
                        .SP_ShuttelToStand(req.shuttle, BuVO);

                amt_Wcs_Action act = new amt_Wcs_Action()
                {
                    ApiRef = _apiRef,
                    LocName = req.location,
                    Mode = req.mode,
                    Result = req.mode.In(amt_Wcs_Action.TMode.Sorting, amt_Wcs_Action.TMode.Counting)? "waiting":"completed",
                    ShuCode = req.shuttle,
                    Status = AMSModel.Constant.EnumConst.EntityStatus.ACTIVE
                };
                DataADO.GetInstant().Insert<amt_Wcs_Action>(act, BuVO);
            }




            return new TRES__return();
        }
    }
}
