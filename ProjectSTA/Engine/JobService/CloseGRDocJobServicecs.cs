using ProjectSTA.APIService.Doc;
using AWMSEngine.JobService;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectSTA.Engine.JobService
{
    public class CloseGRDocJobServicecs : BaseJobService
    {
        public override void ExecuteJob(IJobExecutionContext context)
        {
            var docs =
                AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_Document>(
                    new SQLConditionCriteria[]{
                        new SQLConditionCriteria("DocumentType_ID","1001",SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status","1",SQLOperatorType.EQUALS), 
                        new SQLConditionCriteria("EventStatus","31",SQLOperatorType.NOTEQUALS)
                    }, new VOCriteria());
            CloseGRDocStaAPI api = new CloseGRDocStaAPI(null);
            var res = api.Execute(new { apiKey = "JOBS_KEY", docIDs = docs.Select(x => x.ID.Value).ToArray() });
        }
    }
}
