using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;


namespace ProjectPanKan.Engine.Business
{
    public class TransferMasterFromFileServer : BaseEngine<TransferMasterFromFileServer.TReq, TransferMasterFromFileServer.TRes>
    {
        public class TReq
        {
            //public string pathIN;
            //public string pathOUT;
            //public string filePattern;
            public string TableName;
            public string FieldWhere;
            //public string[] ReqFieldNames;
            //public string[] ReqFieldNamesMandatory;
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
            string shotTable = reqVO.TableName.Substring(4);
            string pathIN = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant().GetConfigValue("AFT_" + shotTable + "_Path_IN");
            string pathOUT = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant().GetConfigValue("AFT_" + shotTable + "_Path_OUT");
            string filePattern = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant().GetConfigValue("AFT_" + shotTable + "_FilePattern");
            string[] fieldNames = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant().GetConfigValue("AFT_" + shotTable + "_Fields").Split('|');
            string[] requireFieldNames = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant().GetConfigValue("AFT_" + shotTable + "_RequireFields").Split('|');

            TRes res = new TRes();
            res.apiResults = new List<TRes.APIResult>();
            string apiRequestPath = pathIN.EndsWith("/") ? pathIN : pathIN + "/";
            string apiResponsePath = pathOUT.EndsWith("/") ? pathOUT : pathOUT + "/";

            if (!Directory.Exists(apiRequestPath)) Directory.CreateDirectory(apiRequestPath);
            if (!Directory.Exists(apiRequestPath + "log/")) Directory.CreateDirectory(apiRequestPath + "log/");
            if (!Directory.Exists(apiResponsePath)) Directory.CreateDirectory(apiResponsePath);
            if (!Directory.Exists(apiResponsePath + "log/")) Directory.CreateDirectory(apiResponsePath + "log/");

            string[] fileNames = Directory.GetFiles(apiRequestPath).Where(x => Regex.IsMatch(Regex.Replace(x, "^.*/([^/]+)$*", "$1"), filePattern)).ToArray();
            foreach (string fn in fileNames)
            {
                string refID = "_NoRefID";
                string resHead = string.Empty;
                List<string> resBodys = new List<string>();
                int reqCount = 0;
                //int status_code = 0;
                //string result_message = string.Empty;
                var result = new TRes.APIResult();
                //string thisLine = "";
                try
                {
                    using (StreamReader srReq = new StreamReader(fn, System.Text.Encoding.GetEncoding("windows-874")))
                    {
                        result.fileRequest = fn.Substring(fn.LastIndexOf('/') + 1);

                        string[] lHead = srReq.ReadLine().Split('|').Select(x => x.Trim()).ToArray();
                        refID = lHead[1];

                        while (!srReq.EndOfStream)
                        {
                            string line = srReq.ReadLine().Trim();
                            if (line.StartsWith("F"))
                            {
                                if (line.Split("|")[1].Get<int>() == reqCount) break;
                                else throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Total Row Invalid");
                            }
                            else if (!line.StartsWith("B"))
                            {
                                continue;
                            }


                            reqCount++;
                            resBodys.Add(line);
                            string[] lBody = line.Split('|').Select(x => x.Trim()).ToArray();
                            Dictionary<string, dynamic> rec = new Dictionary<string, dynamic>();
                            int iField = 1;
                            fieldNames.ToList().ForEach(x =>
                            {
                                if (!string.IsNullOrWhiteSpace(x))
                                {
                                    string paramName = x;
                                    if (!x.Trim().StartsWith("{") || !x.Trim().EndsWith("}"))
                                        rec.Add(x, lBody[iField]);
                                    else
                                    {
                                        string qryString = x.Trim().Substring(1, x.Trim().Length - 2);
                                        paramName = qryString.Split('&').FirstOrDefault(y => y.ToLower().StartsWith("paramname=")).Split('=')[1];
                                        string staticName = qryString.Split('&').FirstOrDefault(y => y.ToLower().StartsWith("staticname=")).Split('=')[1];
                                        string staticKeyComp = qryString.Split('&').FirstOrDefault(y => y.ToLower().StartsWith("statickeycomp=")).Split('=')[1];
                                        string staticKeyVal = qryString.Split('&').FirstOrDefault(y => y.ToLower().StartsWith("statickeyval=")).Split('=')[1];


                                        var objStatic = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
                                        var objMstList = (IEnumerable<object>)objStatic.GetType().GetProperty(staticName).GetValue(objStatic);

                                        object objVal = objMstList.FirstOrDefault(y => lBody[iField].Equals(y.GetType().GetField(staticKeyComp).GetValue(y)));
                                        dynamic val = objVal.GetType().GetField(staticKeyVal).GetValue(objVal);
                                        rec.Add(paramName, val);
                                    }
                                    if (requireFieldNames.Any(y => y == paramName) && string.IsNullOrWhiteSpace(lBody[iField]))
                                    {
                                        throw new AMWUtil.Exception.AMWException(this.Logger, AMWUtil.Exception.AMWExceptionCode.V1001, x);
                                    }
                                }
                                iField++;
                            });
                            AWMSEngine.ADO.DataADO.GetInstant().InsUpd(reqVO.TableName, rec, reqVO.FieldWhere, false, this.BuVO);
                        }
                        //Insert Update
                        result.status = 1;
                        result.code = AMWUtil.Exception.AMWExceptionCode.I0000.ToString();
                        result.message = "Success";
                    }
                }
                catch (AMWUtil.Exception.AMWException ex)
                {
                    result.status = 0;
                    result.code = ex.GetAMWCode();
                    result.message = ex.GetAMWMessage();
                }
                catch (Exception ex)
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
                        File.Move(fn, apiRequestPath + "log/" + f + '.' + DateTime.Now.ToString("ddMMyyhhmmss"));
                        string apiRes = apiResponsePath + f + "." + DateTime.Now.ToString("ddMMyyhhmmss") + ".txt";


                        using (StreamWriter swRes = new StreamWriter(apiRes, true, System.Text.Encoding.GetEncoding("windows-874")))
                        {
                            swRes.WriteLine(resHead);
                            resBodys.ForEach(x => swRes.WriteLine(x));
                        }
                    }
                    catch (Exception ex)
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
