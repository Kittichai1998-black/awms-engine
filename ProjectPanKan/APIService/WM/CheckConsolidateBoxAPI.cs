using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO;
using AWMSEngine.APIService;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using Microsoft.AspNetCore.Mvc;
using ProjectPanKan.Engine.Business;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectPanKan.APIService.WM
{
    public class CheckConsolidateBoxAPI : BaseAPIService
    {
        public CheckConsolidateBoxAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            string baseCode = this.RequestVO.basecode;
            var getBaseConso = StorageObjectADO.GetInstant().Get(baseCode, null, null, false, true, this.BuVO);
            if (getBaseConso != null)
            {
                if (getBaseConso.eventStatus != StorageObjectEventStatus.CONSOLIDATED && getBaseConso.eventStatus != StorageObjectEventStatus.NEW)
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่สามารถใช้กล่อง " + baseCode + " นี้สำหรับ Consolidate ได้");
            }
            else
            {
                var baseMst = DataADO.GetInstant().SelectByCodeActive<ams_BaseMaster>(baseCode, BuVO);
                if (baseMst == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "ไม่มีกล่อง " + baseCode + " นี้ในระบบ");
            }

            return new { baseCode = baseCode };
        }
    }
}
