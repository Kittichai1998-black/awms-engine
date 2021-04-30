using ADO.WMSDB;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AWMSEngine.Controllers.V2;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectDOHOME.ApiService
{
    public class ReportTestAPI : AWMSEngine.APIService.BaseAPIService
    {
        public ReportTestAPI(BaseController controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        public class TReq
        {
            public string code;
            public string name;
            public string classname;
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<TReq>( this.RequestVO);

            //ADO.WMSStaticValue.StaticValueManager.GetInstant().LoadAPIService

            /////SELECT
            var response =  ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_APIService>(
                    new SQLConditionCriteria[] {
                     new SQLConditionCriteria("Code",req.code, SQLOperatorType.LIKE),
                     new SQLConditionCriteria("Name",req.name, SQLOperatorType.LIKE),
                     new SQLConditionCriteria("FullClassName",req.classname, SQLOperatorType.LIKE),
                    }, this.BuVO);

            /////INSERT
            var dataInst = new ams_APIService() { Code = "xxxx", Name = "xddd" };
            dataInst.ID = DataADO.GetInstant().Insert<ams_APIService>(this.BuVO, dataInst);

            /////UPDATE
            dataInst.Code = "v2";
            DataADO.GetInstant().UpdateBy<ams_APIService>(dataInst, BuVO);


            if (response.Count == 0)
                throw new AMWUtil.Exception.AMWException(this.Logger, AMWUtil.Exception.AMWExceptionCode.V0_DOC_NOT_FOUND);
            
            return response;
        }
    }
}
