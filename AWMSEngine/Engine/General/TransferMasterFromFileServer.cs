using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.General
{
    public class TransferMasterFromFileServer : BaseEngine<TransferMasterFromFileServer.TReq,TransferMasterFromFileServer.TRes>
    {
        public class TReq
        {
            public string APICode;
            public string TableName;
            public string FieldWhere;
            public string[] ReqFieldNames;
            public string[] ReqFieldNamesMandatory;
            public string[] ResFieldNames;
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
            string apiRequestPath = string.Format("{0}{1}/request/", rootPath, reqVO.APICode);
            string apiResponsePath = string.Format("{0}{1}/response/", rootPath, reqVO.APICode);

            if (!Directory.Exists(apiRequestPath)) Directory.CreateDirectory(apiRequestPath);
            if (!Directory.Exists(apiResponsePath)) Directory.CreateDirectory(apiResponsePath);

            string[] fileNames = Directory.GetFiles(apiRequestPath).Where(x => x.EndsWith(".req")).ToArray();
            foreach(string fn in fileNames)
            {
                string refID = "_NoRefID";
                string resHead = string.Empty;
                List<string> resBodys = new List<string>();
                int reqCount = 0;
                //int status_code = 0;
                //string result_message = string.Empty;
                var result = new TRes.APIResult();
                try
                {
                    using (StreamReader srReq = new StreamReader(fn))
                    {
                        result.fileRequest = fn.Substring(fn.LastIndexOf('/') + 1);

                        string[] lHead = srReq.ReadLine().Split('|').Select(x => x.Trim()).ToArray();
                        refID = lHead[1];

                        while (!srReq.EndOfStream)
                        {
                            reqCount++;
                            string[] lBody = srReq.ReadLine().Split('|').Select(x => x.Trim()).ToArray();
                            Dictionary<string, dynamic> rec = new Dictionary<string, dynamic>();
                            rec.Add("status", "1".Equals(lBody[1]) ? 1 : 2);
                            int iField = 2;
                            reqVO.ReqFieldNames.ToList().ForEach(x => 
                            {
                                if (reqVO.ReqFieldNamesMandatory.Any(y => y == x) && string.IsNullOrWhiteSpace(lBody[iField]))
                                {
                                    resBodys.Add("B|0|" + string.Join('|', lBody.Skip(2)));
                                    throw new AMWUtil.Exception.AMWException(this.Logger, AMWUtil.Exception.AMWExceptionCode.V1001, x);
                                }
                                rec.Add(x, lBody[iField]);
                                iField++;
                            });
                            ADO.DataADO.GetInstant().InsUpd(reqVO.TableName, rec, reqVO.FieldWhere, true, this.BuVO);
                            resBodys.Add("B|1|" + string.Join('|', lBody.Skip(2)));
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
                        using (StreamWriter swRes = new StreamWriter(apiResponsePath + refID + ".res"))
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
