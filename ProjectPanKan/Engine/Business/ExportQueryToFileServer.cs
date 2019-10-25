using AMWUtil.Common;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSEngine.Engine;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace ProjectPanKan.Engine.Business
{
    public class ExportQueryToFileServer : BaseEngine<ExportQueryToFileServer.TReq, ExportQueryToFileServer.TRes>
    {

        public class TReq
        {
            public string exportName;
            public string[] whereValues;
        }
        public class TRes
        {
            public string fileExport;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            string sqlComm = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant().GetConfigValue("AFE_" + reqVO.exportName + "_SqlComm");
            string pathOut = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant().GetConfigValue("AFE_" + reqVO.exportName + "_Path_OUT");
            if (!pathOut.EndsWith("/")) pathOut += "/";
            string fileOut = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant().GetConfigValue("AFE_" + reqVO.exportName + "_File_OUT");
            bool useFormatAWMS = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant().GetConfigValue("AFE_" + reqVO.exportName + "_UseFormat_AWMS") == YesNoConst.YES;

            if (!Directory.Exists(pathOut))
                Directory.CreateDirectory(pathOut);
            List<object> args = new List<object>();
            args.Add(DateTime.Now);
            args.AddRange(reqVO.whereValues);
            string filePathOut = pathOut + string.Format(fileOut, args.ToArray());
            if (File.Exists(filePathOut))
                File.Delete(filePathOut);
            using (StreamWriter sw = new StreamWriter(filePathOut, false, System.Text.Encoding.UTF8))
            {

                string lfx = string.Empty;
                if (useFormatAWMS)
                {
                    sw.WriteLine(string.Format("H|{0}|{1:yyyy-MM-dd}|{1:hh:mm:ss}", this.Logger.LogRefID, DateTime.Now));
                    lfx = "B|";
                }

                var datas = AWMSEngine.ADO.DataADO.GetInstant().QueryString<dynamic>(string.Format(sqlComm, reqVO.whereValues), null, this.BuVO).ToList();
                sw.WriteLine(string.Format(""));
                foreach (var d in datas)
                {
                    var dic = ObjectUtil.DynamicToModel<Dictionary<string, object>>(d);
                    StringBuilder line = new StringBuilder();
                    foreach (string k in dic.Keys)
                    {
                        string date = k == "DateMap" && dic[k] != null ? Uri.UnescapeDataString(dic[k]) : "";
                        var convertDate = date != "" ? Convert.ToDateTime(date).ToString("dd-MM-yyyy", new CultureInfo("en-US")) : "";
                        if (line.Length > 0) line.Append("|");
                        line.Append(ObjectUtil.IsEmptyNull(dic[k]) ? string.Empty :
                            k == "DateMap" ? convertDate : dic[k]);
                    }
                    sw.WriteLine(lfx + line);
                }
                if (useFormatAWMS)
                {
                    sw.WriteLine("F|" + datas.Count());
                }

            }
            TRes res = new TRes() { fileExport = filePathOut };
            return res;
        }
    }
}
