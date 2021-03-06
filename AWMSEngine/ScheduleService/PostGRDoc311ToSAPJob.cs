using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.APIService.Doc;
using AWMSEngine.Engine.Business.Received;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using Quartz;

namespace AWMSEngine.JobService
{
    public class PostGRDoc311ToSAPJob : BaseJobService
    {
        public override void ExecuteJob(IJobExecutionContext context, JobDataMap data)
        {
            var docs = 
                ADO.DataADO.GetInstant().SelectBy<amt_Document>(
                    new SQLConditionCriteria[]{
                        new SQLConditionCriteria("DocumentType_ID","1001",SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status","1",SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Ref2","311",SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("EventStatus","31",SQLOperatorType.NOTEQUALS)
                    }, new VOCriteria());

            APIService.Doc.CloseGRDocAPI api = new CloseGRDocAPI(null);
            var res = api.Execute(new { apiKey = "JOBS_KEY", docIDs = docs.Select(x => x.ID.Value).ToArray() });
        }
    }
}
