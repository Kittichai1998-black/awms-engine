using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.APIService.Doc;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using Quartz;

namespace AWMSEngine.JobService
{
    public class PostGRDocPackage321ToSAPJob : BaseJobService
    {
        public override void ExecuteJob(IJobExecutionContext context)
        {
            var docs =
                ADO.DataADO.GetInstant().SelectBy<amt_Document>(
                    new SQLConditionCriteria[]{
                        new SQLConditionCriteria("DocumentType_ID","1001",SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status","1",SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Ref2","321",SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("EventStatus","31",SQLOperatorType.NOTEQUALS)
                    }, new VOCriteria());

            APIService.Doc.CloseGRDocAPI api = new CloseGRDocAPI(null);
            docs = docs.Where(x =>
            {
                var docItems = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                    new SQLConditionCriteria[]{
                        new SQLConditionCriteria("Document_ID",x.ID,SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status","1",SQLOperatorType.EQUALS)
                    }, new VOCriteria());

                var skuMsts = ADO.DataADO.GetInstant().SelectBy<ams_SKUMaster>(
                    new SQLConditionCriteria[]{
                        new SQLConditionCriteria("ID",string.Join(',', docItems.Select(y=>y.SKUMaster_ID.Value).ToArray()),SQLOperatorType.IN)
                    }, new VOCriteria());

                return skuMsts.TrueForAll(y => ADO.StaticValue.StaticValueManager.GetInstant().SKUMasterTypes.Any(z => z.ID == y.SKUMasterType_ID && z.Code == "ZPAC"));
            }).ToList();

            var res = api.Execute(new { apiKey = "JOBS_KEY", docIDs = docs.Select(x => x.ID.Value).ToArray() });

        }
    }
}
