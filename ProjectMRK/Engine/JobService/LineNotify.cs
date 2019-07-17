using AWMSEngine.JobService;
using Quartz;
using AWMSModel.Criteria.SP.Response;
using System.Collections.Generic;
using System;

namespace ProjectMRK.Engine.JobService
{
    public class LineNotify : BaseJobService
    {
        public override void ExecuteJob(IJobExecutionContext context, JobDataMap data)
        {
            Dapper.DynamicParameters parameter = new Dapper.DynamicParameters();
            //string dateCurrent1 = DateTime.Now.ToString("yyyy-MM-dd");
            //DateTime date = DateTime.Now.Date;
            int day = DateTime.Now.Day;
            int month = DateTime.Now.Month;
            int year = DateTime.Now.Year;
            string dateCurrent = String.Format("{0}-{1}-{2}", year, month, day);

            parameter.Add("docType", 1001);
            parameter.Add("dateFrom", dateCurrent);
            parameter.Add("dateTo", dateCurrent);

            var res = AWMSEngine.ADO.DataADO.GetInstant().QuerySP<SPDaily>("RP_DAILY_STO", parameter, null);
            List<string> listText = new List<string>();
            int i = 0;
            string header = "\n*Code* | *Batch* | *Qty* | *UnitType* | *Name*";
            res.ForEach(x =>
            {
                string row = "\n" + x.bstoCode +
                  " | " + x.pstoBatch +
                  " | " + x.qty +
                  " | " + x.baseUnitType +
                  " | " + x.pstoName;
                int lenText = listText.Count > 0 ? listText[i].Length : 0;
                int lenStr = row.Length;
                if (lenText == 0)
                {
                    listText.Add(header + row);
                }
                else if ((lenText + lenStr) < 1000)
                {
                    listText[i] += row;
                }
                else
                {
                    listText.Add(row);
                    i++;
                }
            });

            string resultSendMessage = "";
            if (listText.Count > 0)
                foreach (string text in listText)
                {
                    resultSendMessage = ADO.LineNotify.lineNotify("oLEeNu9n4JRg2qyn9UkplEGwJ45cy4y5cJh028xmsjV", text);
                }
            else
                resultSendMessage = ADO.LineNotify.lineNotify("oLEeNu9n4JRg2qyn9UkplEGwJ45cy4y5cJh028xmsjV", "*** *No Data* ***");
            //var res_send = AMWUtil.DataAccess.Http.LineAccess.Notify(null, "oLEeNu9n4JRg2qyn9UkplEGwJ45cy4y5cJh028xmsjV", "Running Project MRK");
        }
    }
}
