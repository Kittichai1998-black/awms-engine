using AMWUtil.Common;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.General
{
    public class ExportQueryToFileServer :BaseEngine<ExportQueryToFileServer.TReq,ExportQueryToFileServer.TRes>
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
            string sqlComm = ADO.StaticValue.StaticValueManager.GetInstant().GetConfig("AFE_" + reqVO.exportName + "_SqlComm");
            string pathOut = ADO.StaticValue.StaticValueManager.GetInstant().GetConfig("AFE_" + reqVO.exportName + "_Path_OUT");
            if (!pathOut.EndsWith("/")) pathOut += "/";
            string fileOut = ADO.StaticValue.StaticValueManager.GetInstant().GetConfig("AFE_" + reqVO.exportName + "_File_OUT");
            bool useFormatAWMS = ADO.StaticValue.StaticValueManager.GetInstant().GetConfig("AFE_" + reqVO.exportName + "_UseFormat_AWMS") == YesNoConst.YES;
            
            if (!Directory.Exists(pathOut))
                Directory.CreateDirectory(pathOut);
            string filePathOut = pathOut + string.Format(fileOut, DateTime.Now);
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
                var datas = ADO.DataADO.GetInstant().QueryString<dynamic>(string.Format(sqlComm, reqVO.whereValues), null, this.BuVO).ToList();
                foreach (var d in datas)
                {
                    var dic = ObjectUtil.DynamicToModel<Dictionary<string, object>>(d);
                    StringBuilder line = new StringBuilder();
                    foreach (string k in dic.Keys)
                    {
                        if (line.Length > 0) line.Append("|");
                        line.Append(ObjectUtil.IsEmptyNull(dic[k]) ? string.Empty : dic[k]);
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
