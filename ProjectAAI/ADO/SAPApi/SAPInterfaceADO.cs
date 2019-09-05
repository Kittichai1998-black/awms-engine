using AMWUtil.DataAccess.Http;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO;
using AWMSEngine.ADO.StaticValue;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static ProjectAAI.ADO.SAPApi.SAPCriteria;

namespace ProjectAAI.ADO.SAPApi
{
    public class SAPInterfaceADO : BaseAPIAccess<SAPInterfaceADO>
    {

        public class SapResponse<T>
        {
            public List<T> datas;
            public int status;
            public string message;
            public string stacktrace;
        }

        /*public T postSAP<T>(object datas, VOCriteria buVO, string apiUri)
            where T : class, new()
        {
            var res = RESTFulAccess.SendJson<T>(buVO.Logger, "SAPCONNECT_LOCATION", RESTFulAccess.HttpMethod.POST, datas);
            return res;
        }*/

        public SapResponse<ZSWMRF001_OUT_SU> ZWMRF001(string reqVO, VOCriteria buVO)
        {
            //var getURL = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAPCONNECT_LOCATION").DataValue;
            var getEnvironment = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAP_ENVIRONMENT").DataValue;
            var req = new SAPReq()
            {
                environmentName = getEnvironment,
                functionName = "ZWMRF001",
                inStructureName = "ZSWMRF001_IN_SU",
                inTableName = "IN_SU",
                outTableName = "OUT_SU",
                datas = new ZSWMRF001_IN_SU()
                {
                    LGNUM = "W01",
                    LENUM = reqVO,
                }
            };

            var res = this.SendJson<SapResponse<ZSWMRF001_OUT_SU>>("SAPCONNECT_LOCATION", req,  buVO);
            if (res.datas.Any(x => !string.IsNullOrEmpty(x.ERR_MSG)))
            {
                var msg = new FinalDatabaseLogCriteria.DocumentOptionMessage()
                {
                    msgError = res.datas.Find(x => !string.IsNullOrEmpty(x.ERR_MSG)).ERR_MSG
                };
                buVO.FinalLogDocMessage.Add(msg);
                throw new AMWException(buVO.Logger, AMWExceptionCode.S0001, res.datas.Find(x => !string.IsNullOrEmpty(x.ERR_MSG)).ERR_MSG);
            }

            return res;
        }

        public SapResponse<ZSWMRF002_OUT_SU> ZWMRF002(string reqVO, long? docID, VOCriteria buVO)
        {
            //var getURL = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAPCONNECT_LOCATION").DataValue;
            var getEnvironment = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAP_ENVIRONMENT").DataValue;
            var req = new SAPReq()
            {
                environmentName = getEnvironment,
                functionName = "ZWMRF002",
                inStructureName = "ZSWMRF002_IN_SU",
                inTableName = "IN_SU",
                outTableName = "OUT_SU",
                datas = new ZSWMRF002_IN_SU()
                {
                    LGNUM = "W01",
                    LENUM = reqVO,
                    LGPLA = "R00",
                    LGTYP = "R00",
                    NLBER = "001"
                }
            };
            
            var res = this.SendJson<SapResponse<ZSWMRF002_OUT_SU>>("SAPCONNECT_LOCATION", req, buVO);
            if (res.datas.Any(x => !string.IsNullOrEmpty(x.ERR_MSG)))
            {
                var msg = new FinalDatabaseLogCriteria.DocumentOptionMessage()
                {
                    docID = docID.Value,
                    msgError = res.datas.Find(x => !string.IsNullOrEmpty(x.ERR_MSG)).ERR_MSG
                };
                buVO.FinalLogDocMessage.Add(msg);
                throw new AMWException(buVO.Logger, AMWExceptionCode.S0001, res.datas.Find(x => !string.IsNullOrEmpty(x.ERR_MSG)).ERR_MSG);
            }

            return res;
        }

        public SapResponse<ZSWMRF004_OUT_SAP> ZWMRF004(ZSWMRF004_IN_AWS reqVO, VOCriteria buVO)
        {
            //var getURL = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAPCONNECT_LOCATION").DataValue;
            var getEnvironment = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAP_ENVIRONMENT").DataValue;
            var req = new SAPReq()
            {
                environmentName = getEnvironment,
                functionName = "ZWMRFC004",
                inStructureName = "ZSWMRF004_IN_AWS",
                inTableName = "IN_AWS",
                outTableName = "OUT_SAP",
                datas = reqVO
            };

            var res = this.SendJson<SapResponse<ZSWMRF004_OUT_SAP>>("SAPCONNECT_LOCATION", req, buVO);
            if (res.datas.Any(x => !string.IsNullOrEmpty(x.ERR_MSG)))
            {
                var msg = new FinalDatabaseLogCriteria.DocumentOptionMessage()
                {
                    docID = DataADO.GetInstant().SelectByCodeActive<amt_Document>(reqVO.GI_DOC, buVO).ID.Value,
                    msgError = res.datas.Find(x => !string.IsNullOrEmpty(x.ERR_MSG)).ERR_MSG
                };
                buVO.FinalLogDocMessage.Add(msg);
                throw new AMWException(buVO.Logger, AMWExceptionCode.S0001, res.datas.Find(x => !string.IsNullOrEmpty(x.ERR_MSG)).ERR_MSG);
            }

            return res;
        }

        public SapResponse<ZSWMRF005_OUT_SAP> ZWMRF005(ZSWMRF005_IN_AWS reqVO, VOCriteria buVO)
        {
            //var getURL = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAPCONNECT_LOCATION").DataValue;
            var getEnvironment = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAP_ENVIRONMENT").DataValue;
            var req = new SAPReq()
            {
                environmentName = getEnvironment,
                functionName = "ZWMRFC005",
                inStructureName = "ZSWMRF005_IN_AWS",
                inTableName = "IN_AWS",
                outTableName = "OUT_SAP",
                datas = reqVO
            };

            var res = this.SendJson<SapResponse<ZSWMRF005_OUT_SAP>>("SAPCONNECT_LOCATION", req, buVO);
            if (res.datas.Any(x => !string.IsNullOrEmpty(x.ERR_MSG)))
            {
                var msg = new FinalDatabaseLogCriteria.DocumentOptionMessage()
                {
                    docID = DataADO.GetInstant().SelectByCodeActive<amt_Document>(reqVO.GI_DOC, buVO).ID.Value,
                    msgError = res.datas.Find(x => !string.IsNullOrEmpty(x.ERR_MSG)).ERR_MSG
                };
                throw new AMWException(buVO.Logger, AMWExceptionCode.S0001, res.datas.Find(x => !string.IsNullOrEmpty(x.ERR_MSG)).ERR_MSG);
            }

            return res;
        }
        public SapResponse<ZSWMRF006_OUT_SAP> ZWMRF006(ZSWMRF006_IN_AWS reqVO, VOCriteria buVO)
        {
            //var getURL = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAPCONNECT_LOCATION").DataValue;
            var getEnvironment = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAP_ENVIRONMENT").DataValue;
            var req = new SAPReq()
            {
                environmentName = getEnvironment,
                functionName = "ZWMRFC006",
                inStructureName = "ZSWMRF006_IN_AWS",
                inTableName = "IN_AWS",
                outTableName = "OUT_SAP",
                datas = reqVO
            };
            
            var res = this.SendJson<SapResponse<ZSWMRF006_OUT_SAP>>("SAPCONNECT_LOCATION", req, buVO);
            if (res.datas.Any(x => !string.IsNullOrEmpty(x.ERR_MSG)))
            {
                var msg = new FinalDatabaseLogCriteria.DocumentOptionMessage()
                {
                    docID = DataADO.GetInstant().SelectByCodeActive<amt_Document>(reqVO.GI_DOC, buVO).ID.Value,
                    msgError = res.datas.Find(x => !string.IsNullOrEmpty(x.ERR_MSG)).ERR_MSG
                };
                throw new AMWException(buVO.Logger, AMWExceptionCode.S0001, res.datas.Find(x => !string.IsNullOrEmpty(x.ERR_MSG)).ERR_MSG);
            }

            return res;
        }

        public SapResponse<ZSWMRF007_OUT_SAP> ZWMRF007(ZSWMRF007_IN_REQ reqVO, VOCriteria buVO)
        {
            //var getURL = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAPCONNECT_LOCATION").DataValue;
            var getEnvironment = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAP_ENVIRONMENT").DataValue;
            var req = new SAPReq()
            {
                environmentName = getEnvironment,
                functionName = "ZWMRFC006",
                inStructureName = "ZSWMRF007_IN_REQ",
                inTableName = "IN_REQ",
                outTableName = "OUT_SAP",
                datas = reqVO
            };

            var res = this.SendJson<SapResponse<ZSWMRF007_OUT_SAP>>("SAPCONNECT_LOCATION", req, buVO);
            if (res.datas.Any(x => !string.IsNullOrEmpty(x.ERR_MSG)))
            {
                var msg = new FinalDatabaseLogCriteria.DocumentOptionMessage()
                {
                    msgError = res.datas.Find(x => !string.IsNullOrEmpty(x.ERR_MSG)).ERR_MSG
                };
                throw new AMWException(buVO.Logger, AMWExceptionCode.S0001, res.datas.Find(x => !string.IsNullOrEmpty(x.ERR_MSG)).ERR_MSG);
            }

            return res;
        }

        public SapResponse<ZSWMRF003_OUT_REQ> ZWMRF003(ZSWMRF003_IN_REQ reqVO, VOCriteria buVO)
        {
            //var getURL = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAPCONNECT_LOCATION").DataValue;
            var getEnvironment = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAP_ENVIRONMENT").DataValue;
            var req = new SAPReq()
            {
                environmentName = getEnvironment,
                functionName = "ZWMRF003",
                inStructureName = "ZSWMRF003_IN_REQ",
                inTableName = "IN_REQ",
                outTableName = "OUT_REQ",
                datas = reqVO
            };
            var res = this.SendJson<SapResponse<ZSWMRF003_OUT_REQ>>("SAPCONNECT_LOCATION", req, buVO);
            return res;
        }
    }
}
