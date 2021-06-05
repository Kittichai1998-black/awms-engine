using ADO.WMSDB;
using AWMSEngine.APIService;
using AWMSEngine.Controllers.V2;
using ProjectGCL.GCLModel.Criterie;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.APIService.v2
{
    public class OLD03_Change_Product_Infomation : BaseAPIService
    {
        public class TReq
        {
            public string FROM_BO;
            public string TO_CUSTOMER;
            public string TO_SKU;
            public string TO_LOT;
            public string TO_GRADE;
            public string TO_UNIT;
            public string TO_UD;
        }

        public OLD03_Change_Product_Infomation(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<TReq>(this.RequestVO);
            if (string.IsNullOrWhiteSpace(req.FROM_BO))
                throw new Exception("parameter FROM_BO is null.");
            if (string.IsNullOrWhiteSpace(req.TO_CUSTOMER))
                throw new Exception("parameter TO_CUSTOMER is null.");
            if (string.IsNullOrWhiteSpace(req.TO_SKU))
                throw new Exception("parameter TO_SKU is null.");
            if (string.IsNullOrWhiteSpace(req.TO_LOT))
                throw new Exception("parameter TO_LOT is null.");
            if (string.IsNullOrWhiteSpace(req.TO_GRADE))
                throw new Exception("parameter TO_GRADE is null.");
            if (string.IsNullOrWhiteSpace(req.TO_UNIT))
                throw new Exception("parameter TO_UNIT is null.");
            if (string.IsNullOrWhiteSpace(req.TO_UD))
                throw new Exception("parameter TO_UD is null.");

            var datas = DataADO.GetInstant().CreateDynamicParameters(req);
            DataADO.GetInstant().QuerySP("SP_STO_PACK_UPDATE_BY_BO", datas, BuVO);

            return new TRES__return() { };

        }
    }
}
