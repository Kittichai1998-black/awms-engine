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
    public class OLD03_Update_Stock_Info : BaseAPIService
    {
        public class TReq
        {
            public List<TRecord> record;
            public class TRecord
            {
                public List<TLine> line;
                public class TLine
                {
                    public string bagging_Order;
                    public string plant;
                    public string material_code;
                    public string batch;
                    public string uD_CODE;
                }
            }
        }

        public OLD03_Update_Stock_Info(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            TReq _req = AMWUtil.Common.ObjectUtil.DynamicToModel<TReq>(this.RequestVO);
            BeginTransaction();
            foreach( TReq.TRecord.TLine req in _req.record.First().line)
            {

                if (string.IsNullOrWhiteSpace(req.bagging_Order))
                    throw new Exception("parameter bagging_Order is null.");
                if (string.IsNullOrWhiteSpace(req.plant))
                    throw new Exception("parameter plant is null.");
                if (string.IsNullOrWhiteSpace(req.material_code))
                    throw new Exception("parameter material_code is null.");
                if (string.IsNullOrWhiteSpace(req.batch))
                    throw new Exception("parameter batch is null.");
                if (string.IsNullOrWhiteSpace(req.uD_CODE))
                    throw new Exception("parameter uD_CODE is null.");

                //var datas = DataADO.GetInstant().CreateDynamicParameters(req);
                Dapper.DynamicParameters datas = new Dapper.DynamicParameters();
                datas.Add("@FROM_BO", req.bagging_Order);
                datas.Add("@TO_CUSTOMER", req.plant);
                datas.Add("@TO_SKU", req.material_code);
                datas.Add("@TO_LOT", req.batch);
                datas.Add("@TO_UNIT", "KG");
                datas.Add("@TO_UD", req.uD_CODE);

                DataADO.GetInstant().QuerySP("SP_STO_PACK_UPDATE_BY_BO", datas, BuVO);

            }

            return new TRES__return() { };

        }
    }
}
