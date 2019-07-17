using AWMSEngine.JobService;
using Quartz;
using AWMSModel.Criteria.SP.Response;
using System.Collections.Generic;

namespace ProjectMRK.Engine.JobService
{
    public class LineNotify : BaseJobService
    {
        public override void ExecuteJob(IJobExecutionContext context, JobDataMap data)
        {
            //AWMSEngine.ADO.DataADO.GetInstant().QuerySP<aml_SAPLog>()
            Dapper.DynamicParameters parameter = new Dapper.DynamicParameters();
            parameter.Add("docType", null);
            var res = AWMSEngine.ADO.DataADO.GetInstant().QuerySP<SPDaily>("RP_DAILY_STO", parameter, null);
            List<string> listText = new List<string>();
            int i = 0;
            res.ForEach(x =>
            {
                //\n can use
                string str = "bstoCode = *" + x.bstoCode + "*\t" +
                  "pstoName = *" + x.pstoName + "*\t" +
                  "pstoBatch = *" + x.pstoBatch + "*\t" +
                  "qty = *" + x.qty + "*\n\t" +
                  "baseUnitType = *" + x.baseUnitType + "*";


                int lenText = listText.Count > 0 ? listText[i].Length : 0;
                int lenStr = str.Length;
                if (lenText == 0)
                {
                    listText.Add(str);
                }
                else if ((lenText + lenStr) < 1000)
                {
                    listText[i] += str;
                }
                else
                {
                    listText.Add(str);
                    i++;
                }
            });
            foreach (string text in listText)
            {
                var res_send = ADO.LineNotify.lineNotify("oLEeNu9n4JRg2qyn9UkplEGwJ45cy4y5cJh028xmsjV", text);
            }
            //var res_send = AMWUtil.DataAccess.Http.LineAccess.Notify(null, "oLEeNu9n4JRg2qyn9UkplEGwJ45cy4y5cJh028xmsjV", "Running Project MRK");

        }
    }
}
