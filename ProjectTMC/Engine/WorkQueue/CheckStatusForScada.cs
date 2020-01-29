using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Validation;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectTMC.Engine.WorkQueue
{
    public class CheckStatusForScada : BaseEngine<CheckStatusForScada.TDocReq, object>
    {
        public class TDocReq
        {
            public string ref_id;
        }

     

        protected override object ExecuteEngine(TDocReq reqVO)
        {

            var getAPIServiceEvent = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<aml_APIServiceEvent>(
                new SQLConditionCriteria[] {
                       new SQLConditionCriteria("APIRefID",reqVO.ref_id, SQLOperatorType.EQUALS),
                }, this.BuVO).FirstOrDefault();

            if(getAPIServiceEvent == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Data Not Found");



            var _result = Newtonsoft.Json.JsonConvert.DeserializeObject(getAPIServiceEvent.OutputText);
                return _result;
        }
    }
}
