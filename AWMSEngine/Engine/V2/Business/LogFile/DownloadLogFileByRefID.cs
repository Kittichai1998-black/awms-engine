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
            public List<string> readFilelog;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();
            //var APIServiceEvent = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<aml_APIServiceEvent>(
            //    new KeyValuePair<string, object>[] {
            //        new KeyValuePair<string,object>("LogRefID",reqVO.LogRefID),
            //    }, this.BuVO).FirstOrDefault();
            //if (APIServiceEvent == null)
                //throw new AMWException(logger, AMWExceptionCode.V2001, "Good Received Document Not Found");

            //var startTime = APIServiceEvent.StartTime;
            //var startDate = startTime.ToISODateString();
            //var startDateString = startDate.Split("-");
            //var dateString = "";

            //foreach(var d in startDateString)
            //{
            //    dateString = dateString + d;
            //}

            //var nameDir = dateString;
            //var directoryPath = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "DIRECTORY_PATH").DataValue;

            var getDir = new DirectoryInfo("D:/logs/BDF01-AMW618311/20200224");
            var getFile = getDir.GetFiles();
            List<string> groups = new List<string>();
            foreach (var file in getFile)
                {
                var x = AMWUtil.Common.FileUtil.findstr(file.ToString(), reqVO.LogRefID);

                var x2 =x.ReadToEnd();

                //groups.Add(x2);

            }
            res.readFilelog = groups;
            return res;
            
        } 
    }
}
