using AMWUtil.Common;
using AMWUtil.DataAccess;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.LogFile
{
    public class DownloadLogFileByRefID : BaseEngine<DownloadLogFileByRefID.TReq, DownloadLogFileByRefID.TRes>
    {

        public class TReq
        {
            public string LogRefID;
        }
        public class TRes
        {
            public string dateFilelog;

        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();
            var APIServiceEvent = AWMSEngine.ADO.WMSDB.DataADO.GetInstant().SelectBy<aml_APIServiceEvent>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("LogRefID",reqVO.LogRefID),
                }, this.BuVO).FirstOrDefault();

            if (APIServiceEvent == null)
                throw new AMWException(Logger, AMWExceptionCode.V2001, "LogRefID Not Found");

            var startTime = APIServiceEvent.StartTime;
            var startDate = startTime.ToISODateString();
            var startDateString = startDate.Split("-");
            var dateString = "";

            foreach (var d in startDateString)
            {
                dateString = dateString + d;
            }

            res.dateFilelog = dateString;
            return res;

        }
    }
}
