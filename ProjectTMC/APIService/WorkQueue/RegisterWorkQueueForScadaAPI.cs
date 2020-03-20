using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Criteria;
using Microsoft.AspNetCore.Mvc;
using ProjectTMC.Engine.WorkQueue;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectTMC.APIService.WorkQueue
{
    public class RegisterWorkQueueForScadaAPI : AWMSEngine.APIService.BaseAPIService
    {
        public RegisterWorkQueueForScadaAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }
        public class TResSCADA
        {
            public Data data;
            public Result _result;
            public class Data
            {
                public string ref_id;
                public string sku_code;
                public int? qty;
                public string unit;
            }
            public class Result
            {
                public int status;
                public dynamic message;
            }
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            RegisterWorkQueueForScada.TReq req = ObjectUtil.DynamicToModel<RegisterWorkQueueForScada.TReq>(this.RequestVO);
            // สร้าง sto, document เเล้วส่งไปหา wc 
            WorkQueueCriteria res = new RegisterWorkQueueForScada().Execute(this.Logger, this.BuVO, req);
            var resSCADA = new TResSCADA();
            //เอาres นี้ส่งไป WC 
            if (res != null)
            {
                var wcsRes = ADO.WCS.WCSConfirmADO.GetInstant().SendConfirm(res, this.BuVO);
                if (wcsRes._result.resultcheck == 0)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.B0001, "Pallet has Problems.");
                }
                else {
                    resSCADA.data = new TResSCADA.Data()
                    {
                        ref_id = req.ref_id,
                        sku_code = req.sku_code,
                        qty = req.qty,
                        unit = res.baseInfo.packInfos.First().unit
                    };
                    resSCADA._result = new TResSCADA.Result()
                    {
                        status = 1,
                        message = wcsRes._result.resultmessage
                    };
                }
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.B0001, "Pallet has Problems.");
            }
            //แล้วเอา res ที่ได้จ้าก WC ส่งไปSCADA 
            return resSCADA;
        }
    }
}
