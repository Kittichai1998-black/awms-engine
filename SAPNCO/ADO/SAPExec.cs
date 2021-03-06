using SAPNCO.Models;
using SAP.Middleware.Connector;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Dynamic;

namespace SAPNCO.ADO
{
    public class SAPExec
    {
        public ResponseCriteria execMulti(RequestCriteriaMulti req)
        {
            var res = new Dictionary<string, dynamic>();
            try
            {
                RfcDestination SapRfcDestination = RfcDestinationManager.GetDestination(req.environmentName);
                RfcRepository SapRfcRepository = SapRfcDestination.Repository;
                IRfcFunction SapFunction = SapRfcRepository.CreateFunction(req.functionName);

                req.sapLists.ForEach(saplist =>
                {
                    RfcStructureMetadata Metadata_IN = SapRfcRepository.GetStructureMetadata(saplist.inStructureName);
                    IRfcStructure IN_SU = Metadata_IN.CreateStructure();
                    if (!string.IsNullOrWhiteSpace(saplist.inTableName))
                    {
                        IRfcTable T_IN_SU = SapFunction.GetTable(saplist.inTableName);

                        foreach (var data in saplist.datas)
                        {
                            T_IN_SU.Append(SetValue(data, IN_SU));
                        }
                        

                        SapFunction.SetValue(saplist.inTableName, T_IN_SU);
                    }
                    else
                    {
                        foreach (var data in saplist.datas)
                        {
                            foreach (var value in data)
                                SapFunction.SetValue(value.Key, value.Value);
                        }
                    }
                });

                SapFunction.Invoke(SapRfcDestination);

                foreach(var x in req.outTableNames.Split(','))
                {
                    var SAPdt = SapFunction.GetTable(x);
                    res.Add(x, CreateResponse(SAPdt));
                }

                return new ResponseCriteria()
                {
                    datas = res,
                    status = 1,
                    message = "SUCCESS",
                    stacktrace = string.Empty
                };
            }
            catch (Exception ex)
            {
                return new ResponseCriteria()
                {
                    datas = null,
                    status = 0,
                    message = ex.Message,
                    stacktrace = ex.StackTrace
                };
            }
        }

        private IRfcStructure SetValue(Dictionary<string,object> req, IRfcStructure IN_SU)
        {
            foreach (var data in req)
            {
                var dataType = IN_SU.Metadata[data.Key];
                if (dataType.DataType == RfcDataType.CHAR)
                {
                    if (data.Value.ToString() != "")
                    {
                        if (data.Value.GetType() == typeof(string))
                        {
                            string value = data.Value.ToString();
                            if (value.Length < dataType.NucLength && (dataType.Name == "VBELN_VL" || dataType.Name == "LENUM"))
                            {
                                IN_SU.SetValue(data.Key, value.PadLeft(dataType.NucLength, '0'));
                            }
                            else
                                IN_SU.SetValue(data.Key, data.Value);
                        }
                        else
                            IN_SU.SetValue(data.Key, data.Value);
                    }
                }
                else
                    IN_SU.SetValue(data.Key, data.Value);
            }
            return IN_SU;
        }

        private List<dynamic> CreateResponse(IRfcTable sapTable)
        {
            var res = new List<dynamic>();
            foreach (IRfcStructure row in sapTable)
            {
                IDictionary<string, object> resObj = new ExpandoObject();
                for (int liElement = 0; liElement <= sapTable.ElementCount - 1; liElement++)
                {
                    RfcElementMetadata metadata = sapTable.GetElementMetadata(liElement);
                    switch (metadata.DataType)
                    {
                        case RfcDataType.DATE:
                            {
                                resObj.Add(metadata.Name, row.GetString(metadata.Name).Substring(0, 4) + row.GetString(metadata.Name).Substring(5, 2) + row.GetString(metadata.Name).Substring(8, 2));
                                break;
                            }
                        case RfcDataType.BCD:
                            {
                                resObj.Add(metadata.Name, row.GetDecimal(metadata.Name));
                                break;
                            }
                        case RfcDataType.CHAR:
                            {
                                resObj.Add(metadata.Name, row.GetString(metadata.Name));
                                break;
                            }
                        case RfcDataType.STRING:
                            {
                                resObj.Add(metadata.Name, row.GetString(metadata.Name));
                                break;
                            }
                        case RfcDataType.INT2:
                            {
                                resObj.Add(metadata.Name, row.GetInt(metadata.Name));
                                break;
                            }
                        case RfcDataType.INT4:
                            {
                                resObj.Add(metadata.Name, row.GetInt(metadata.Name));
                                break;
                            }
                        case RfcDataType.FLOAT:
                            {
                                resObj.Add(metadata.Name, row.GetDouble(metadata.Name));
                                break;
                            }
                        case RfcDataType.NUM:
                            {
                                resObj.Add(metadata.Name, row.GetLong(metadata.Name));
                                break;
                            }
                        default:
                            {
                                resObj.Add(metadata.Name, row.GetString(metadata.Name));
                                break;
                            }
                    }
                }
                res.Add(resObj);
            }
            return res;
        }

        public ResponseCriteria exec(RequestCriteria req)
        {
            try
            {
                RfcDestination SapRfcDestination = RfcDestinationManager.GetDestination(req.environmentName);
                RfcRepository SapRfcRepository = SapRfcDestination.Repository;
                IRfcFunction SapFunction = SapRfcRepository.CreateFunction(req.functionName);// "BAPI_COMPANYCODE_GETDETAIL");
                var Metadata_IN = SapRfcRepository.GetStructureMetadata(req.inStructureName);
                var IN_SU = Metadata_IN.CreateStructure();
                var T_IN_SU = SapFunction.GetTable(req.inTableName);

                T_IN_SU.Append(SetValue(req, IN_SU));
                SapFunction.Invoke(SapRfcDestination);
                var SAPdt = SapFunction.GetTable(req.outTableName);
                //var res = SapFunction.GetStructure(0);
                //string dd = COMPANY_GETDETAIL.GetStructure(0).ToString();
                var res = CreateResponse(SAPdt);
                return new ResponseCriteria()
                {
                    datas = res,
                    status = 1,
                    message = "SUCCESS",
                    stacktrace = string.Empty
                };
            }
            catch (Exception ex)
            {
                return new ResponseCriteria()
                {
                    datas = null,
                    status = 0,
                    message = ex.Message,
                    stacktrace = ex.StackTrace
                };
            }
        }

        private IRfcStructure SetValue(RequestCriteria req, IRfcStructure IN_SU)
        {
            foreach (var data in req.datas)
            {
                var dataType = IN_SU.Metadata[data.Key];
                if (dataType.DataType == RfcDataType.CHAR)
                {
                    if (data.Value.ToString() != "")
                    {
                        if (data.Value.GetType() == typeof(string))
                        {
                            string value = data.Value.ToString();
                            if (value.Length < dataType.NucLength && (dataType.Name == "VBELN_VL" || dataType.Name == "LENUM"))
                            {
                                IN_SU.SetValue(data.Key, value.PadLeft(dataType.NucLength, '0'));
                            }
                            else
                                IN_SU.SetValue(data.Key, data.Value);
                        }
                        else
                            IN_SU.SetValue(data.Key, data.Value);
                    }
                }
                else
                    IN_SU.SetValue(data.Key, data.Value);
            }
            return IN_SU;
        }
    }
}