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
        public ResponseCriteria exec(RequestCriteria req)
        {
            List<dynamic> res = new List<dynamic>();
            try
            {
                RfcDestination SapRfcDestination = RfcDestinationManager.GetDestination(req.environmentName);
                RfcRepository SapRfcRepository = SapRfcDestination.Repository;
                IRfcFunction SapFunction = SapRfcRepository.CreateFunction(req.functionName);

                req.sapList.ForEach(saplist =>
                {
                    RfcStructureMetadata Metadata_IN = SapRfcRepository.GetStructureMetadata(saplist.inStructureName);
                    IRfcStructure IN_SU = Metadata_IN.CreateStructure();
                    IRfcTable T_IN_SU = SapFunction.GetTable(saplist.inTableName);
                    T_IN_SU.Append(SetValue(saplist.datas, IN_SU));

                    SapFunction.SetValue(saplist.inTableName, T_IN_SU);
                });

                SapFunction.Invoke(SapRfcDestination);

                req.sapList.ForEach(x =>
                {
                    var SAPdt = SapFunction.GetTable(x.outTableName);
                    res.AddRange(CreateResponse(SAPdt));
                });

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
            List<dynamic> response = new List<dynamic>();
            foreach (IRfcStructure row in sapTable)
            {
                dynamic res = new ExpandoObject();
                IDictionary<string, object> resObj = res;
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
                response.Add(res);
            }
            return response;
        }
    }
}