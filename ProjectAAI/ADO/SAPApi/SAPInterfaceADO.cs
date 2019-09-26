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

        public class SapResponseMulti
        {
            public SAPRes datas;
            public int status;
            public string message;
            public string stacktrace;

            public class SAPRes
            {
                public List<OUT_SAP> OUT_SAP;
                public List<OUT_SU_BAL> OUT_SU_BAL;
            }
        }
        public class SapResponseMulti2
        {
            public SAPRes datas;
            public int status;
            public string message;
            public string stacktrace;

            public class SAPRes
            {
                public List<OUT_SU> OUT_SU;
            }
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

            var res = this.SendJson<SapResponse<ZSWMRF001_OUT_SU>>("SAPCONNECT_LOCATION", req, buVO);
            return res;
        }

        /*public SapResponse<ZSWMRF002_OUT_SU> ZWMRF002(string reqVO, VOCriteria buVO)
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
                    LGPLA = "R00",
                    LGTYP = "R00",
                    NLBER = "001",
                    LENUM = reqVO
                }
            };

            var res = this.SendJson<SapResponse<ZSWMRF002_OUT_SU>>("SAPCONNECT_LOCATION", req, buVO);
            return res;
        }*/

        public SapResponse<ZSWMRF007_OUT_SAP> ZWMRF007(ZSWMRF007_IN_REQ reqVO, VOCriteria buVO)
        {
            //var getURL = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAPCONNECT_LOCATION").DataValue;
            var getEnvironment = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAP_ENVIRONMENT").DataValue;
            var req = new SAPReq()
            {
                environmentName = getEnvironment,
                functionName = "ZWMRF007",
                inStructureName = "ZSWMRF007_IN_REQ",
                inTableName = "IN_REQ",
                outTableName = "OUT_SAP",
                datas = reqVO
            };

            var res = this.SendJson<SapResponse<ZSWMRF007_OUT_SAP>>("SAPCONNECT_LOCATION", req, buVO);
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
        public SapResponseMulti2 ZWMRF002(string reqVO, VOCriteria buVO)
        {
            //var getURL = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAPCONNECT_LOCATION").DataValue;
            var getEnvironment = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAP_ENVIRONMENT").DataValue;
            var req = new SAPReqMulti()
            {
                environmentName = getEnvironment,
                functionName = "ZWMRF002",
                outTableNames = "OUT_SU",
                sapLists = new List<SAPReqMulti.SAPList>()
                {
                    new SAPReqMulti.SAPList()
                    {
                        inStructureName = "TEST_RUN",
                        datas = new { P_TEST = "X" }
                    },
                    new SAPReqMulti.SAPList()
                    {
                        inStructureName = "ZSWMRF002_IN_SU",
                        inTableName = "IN_SU",
                        datas = new ZSWMRF002_IN_SU()
                        {
                            LGNUM = "W01",
                            LGPLA = "R00",
                            LGTYP = "R00",
                            NLBER = "001",
                            LENUM = reqVO
                        }
                    },
                }
            };

            var res = this.SendJson<SapResponseMulti2>("SAPCONNECT_LOCATIONV2", req, buVO);
            return res;
        }

        public SapResponseMulti ZWMRF004(IN_AWS inAws, IN_REQ inReq, VOCriteria buVO)
        {
            //var getURL = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAPCONNECT_LOCATION").DataValue;
            var getEnvironment = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAP_ENVIRONMENT").DataValue;
            var req = new SAPReqMulti()
            {
                environmentName = getEnvironment,
                functionName = "ZWMRF004",
                outTableNames = "OUT_SAP,OUT_SU_BAL",
                sapLists = new List<SAPReqMulti.SAPList>()
                {
                    new SAPReqMulti.SAPList()
                    {
                        inStructureName = "TEST_RUN",
                        datas = new { P_TEST = "X" }
                    },
                    new SAPReqMulti.SAPList()
                    {
                        inStructureName = "ZSWMRF004_IN_REQ",
                        inTableName = "IN_REQ",
                        datas = inReq
                    },
                    new SAPReqMulti.SAPList()
                    {
                        inStructureName = "ZSWMRF004_IN_AWS",
                        inTableName = "IN_AWS",
                        datas = inAws
                    }
                }
            };

            var res = this.SendJson<SapResponseMulti>("SAPCONNECT_LOCATIONV2", req, buVO);
            return res;
        }

        public SapResponseMulti ZWMRF005(IN_AWS inAws, IN_REQ inReq, VOCriteria buVO)
        {
            //var getURL = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAPCONNECT_LOCATION").DataValue;
            var getEnvironment = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAP_ENVIRONMENT").DataValue;
            var req = new SAPReqMulti()
            {
                environmentName = getEnvironment,
                functionName = "ZWMRF005",
                outTableNames = "OUT_SAP,OUT_SU_BAL",
                sapLists = new List<SAPReqMulti.SAPList>()
                {
                    new SAPReqMulti.SAPList()
                    {
                        inStructureName = "TEST_RUN",
                        datas = new { P_TEST = "X" }
                    },
                    new SAPReqMulti.SAPList()
                    {
                        inStructureName = "ZSWMRF005_IN_REQ",
                        inTableName = "IN_REQ",
                        datas = inReq
                    },
                    new SAPReqMulti.SAPList()
                    {
                        inStructureName = "ZSWMRF005_IN_AWS",
                        inTableName = "IN_AWS",
                        datas = inAws
                    }
                }
            };

            var res = this.SendJson<SapResponseMulti>("SAPCONNECT_LOCATIONV2", req, buVO);
            return res;
        }

        public SapResponseMulti ZWMRF006(IN_AWS inAws, IN_REQ inReq, VOCriteria buVO)
        {
            //var getURL = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAPCONNECT_LOCATION").DataValue;
            var getEnvironment = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAP_ENVIRONMENT").DataValue;
            var req = new SAPReqMulti()
            {
                environmentName = getEnvironment,
                functionName = "ZWMRF006",
                outTableNames = "OUT_SAP,OUT_SU_BAL",
                sapLists = new List<SAPReqMulti.SAPList>()
                {
                    new SAPReqMulti.SAPList()
                    {
                        inStructureName = "TEST_RUN",
                        datas = new { P_TEST = "X" }
                    },
                    new SAPReqMulti.SAPList()
                    {
                        inStructureName = "ZSWMRF006_IN_REQ",
                        inTableName = "IN_REQ",
                        datas = inReq
                    },
                    new SAPReqMulti.SAPList()
                    {
                        inStructureName = "ZSWMRF006_IN_AWS",
                        inTableName = "IN_AWS",
                        datas = inAws
                    }
                }
            };

            var res = this.SendJson<SapResponseMulti>("SAPCONNECT_LOCATIONV2", req, buVO);
            return res;
        }
    }
}
