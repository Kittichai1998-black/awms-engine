using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.General
{
    public class TransferMasterFromFileServerCsv : BaseEngine<TransferMasterFromFileServerCsv.TReq,TransferMasterFromFileServerCsv.TRes>
    {
        public class TReq
        {
            public string apiCode;
            public string tableName;
            public string fieldWhere;
            /// <summary>
            /// Zero is First
            /// </summary>
            public int beginRowIndex;
            public List<ColumnInfo> columnInfos;
            public class ColumnInfo
            {
                /// <summary>
                /// Zero is First
                /// </summary>
                public int columnIndex;
                public string fieldName;
                public bool isMandatory;
            }
        }
        public class TRes
        {
            public List<APIResult> apiResults;
            public class APIResult
            {
                public string fileRequest;
                public int status;
                public string code;
                public string message;
            }
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();
            res.apiResults = new List<TRes.APIResult>();
            string rootPath = StaticValue.GetConfig(AWMSModel.Constant.EnumConst.ConfigCode.APIFS_TRANS_MST_ROOTFILE);
            string apiRequestPath = string.Format("{0}{1}/request/", rootPath, reqVO.apiCode);
            string apiResponsePath = string.Format("{0}{1}/response/", rootPath, reqVO.apiCode);

            if (!Directory.Exists(apiRequestPath)) Directory.CreateDirectory(apiRequestPath);
            if (!Directory.Exists(apiRequestPath + "log/")) Directory.CreateDirectory(apiRequestPath + "log/");
            if (!Directory.Exists(apiResponsePath)) Directory.CreateDirectory(apiResponsePath);
            if (!Directory.Exists(apiResponsePath + "log/")) Directory.CreateDirectory(apiResponsePath + "log/");

            string[] fileNames = Directory.GetFiles(apiRequestPath).Where(x => x.EndsWith(".csv")).ToArray();
            foreach(string fn in fileNames)
            {
                string refID = fn.Substring(fn.LastIndexOf('/')+1);//"_NoRefID";
                refID = refID.Substring(0, refID.LastIndexOf('.'));
                string resHead = string.Empty;
                List<string> resBodys = new List<string>();
                int reqCount = 0;
                //int status_code = 0;
                //string result_message = string.Empty;
                var result = new TRes.APIResult();
                try
                {
                    using (StreamReader srReqx = new StreamReader(fn))
                    {
                        CsvHelper.CsvParser csv = new CsvHelper.CsvParser(srReqx);

                        result.fileRequest = fn.Substring(fn.LastIndexOf('/') + 1);

                        
                        //refID = DateTime.Now.Ticks.ToString();
                        string[] lBody = csv.Read();
                        while ((lBody = csv.Read()) != null)
                        {
                            reqCount++;
                            if (reqCount - 1 < reqVO.beginRowIndex) continue;
                            Dictionary<string, dynamic> rec = new Dictionary<string, dynamic>();
                            rec.Add("status", 1);

                            reqVO.columnInfos.ForEach(x =>
                            {
                                if (x.columnIndex > -1 && x.isMandatory && string.IsNullOrWhiteSpace(lBody[x.columnIndex]))
                                {
                                    resBodys.Add("B|0|" + string.Join('|', lBody));
                                    throw new AMWUtil.Exception.AMWException(this.Logger, AMWUtil.Exception.AMWExceptionCode.V1001, x.fieldName);
                                }
                                rec.Add(x.fieldName, x.columnIndex < 0 ? string.Empty : lBody[x.columnIndex]);
                            });
                            ADO.DataADO.GetInstant().InsUpd(reqVO.tableName, rec, reqVO.fieldWhere, false, this.BuVO);
                            resBodys.Add("B|1|" + string.Join('|', lBody));
                        }
                        //Insert Update
                        result.status = 1;
                        result.code = AMWUtil.Exception.AMWExceptionCode.I0000.ToString();
                        result.message = "Success";
                    }
                }
                catch(AMWUtil.Exception.AMWException ex)
                {
                    result.status = 0;
                    result.code = ex.GetAMWCode();
                    result.message = ex.GetAMWMessage();
                }
                catch(Exception ex)
                {
                    result.status = 0;
                    result.code = AMWUtil.Exception.AMWExceptionCode.U0000.ToString();
                    result.message = ex.Message;
                }
                finally
                {
                    try
                    {
                        resHead = string.Format("H|{0}|{1}|{2}|{3}", refID, reqCount, result.status, result.message);
                        string f = fn.Substring(fn.LastIndexOf('/') + 1);
                        File.Move(fn, apiRequestPath + "log/" + f);
                        using (StreamWriter swRes = new StreamWriter(apiResponsePath + refID + ".response"))
                        {
                            swRes.WriteLine(resHead);
                            resBodys.ForEach(x => swRes.WriteLine(x));
                        }
                    }
                    catch(Exception ex)
                    {
                        result.status = 0;
                        result.code = AMWUtil.Exception.AMWExceptionCode.U0000.ToString();
                        result.message = ex.Message;
                    }
                    finally
                    {
                        res.apiResults.Add(result);
                    }
                }
            }
            return res;
        }

    }
}
