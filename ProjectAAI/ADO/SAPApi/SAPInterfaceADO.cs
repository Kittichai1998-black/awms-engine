using AMWUtil.DataAccess.Http;
using AMWUtil.Logger;
using AWMSEngine.ADO;
using AWMSEngine.ADO.StaticValue;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static ProjectAAI.ADO.SAPApi.SAPCriteria;

namespace ProjectAAI.ADO.SAPApi
{
    public class SAPInterfaceADO : BaseMSSQLAccess<SAPInterfaceADO>
    {
        public T postSAP<T>(object datas, VOCriteria buVO, string apiUri)
            where T : class, new()
        {
            var res = RESTFulAccess.SendJson<T>(buVO.Logger, apiUri, RESTFulAccess.HttpMethod.POST, datas);
            return res;
        }

        public List<ZSWMRF001_OUT_SU> ZWMRF001(string reqVO, VOCriteria buVO)
        {
            var getURL = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAPCONNECT_LOCATION").DataValue;
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

            return this.postSAP<List<ZSWMRF001_OUT_SU>>(req, buVO, getURL);
        }

        public List<ZSWMRF002_OUT_SU> ZWMRF002(string reqVO, VOCriteria buVO)
        {
            var getURL = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAPCONNECT_LOCATION").DataValue;
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

            return this.postSAP<List<ZSWMRF002_OUT_SU>>(req, buVO, getURL);
        }

        public dynamic ZWMRF004(ZSWMRF004_IN_AWS reqVO, VOCriteria buVO)
        {
            var getURL = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAPCONNECT_LOCATION").DataValue;
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

            var res = this.postSAP<ZSWMRF004_OUT_SAP>(req, buVO, getURL);
            var newRes = new
            {
                mode = res.MODE,
                storageUnitNum = res.LENUM,
                reserveNumber = res.LGTYP,
                desStorageType = res.LGTYP,
                desStorageBin = res.LGPLA,
                movementType = res.BWLVS,
                giDoc = res.GI_DOC,
                tranOrder = res.BTANR,
                errMSG = res.ERR_MSG,
            };
            return newRes;
        }

        public dynamic ZWMRF005(ZSWMRF005_IN_AWS reqVO, VOCriteria buVO)
        {
            var getURL = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAPCONNECT_LOCATION").DataValue;
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

            var res = this.postSAP<ZSWMRF005_OUT_SAP>(req, buVO, getURL);
            var newRes = new
            {
                mode = res.MODE,
                storageUnitNum = res.LENUM,
                reserveNumber = res.LGTYP,
                desStorageType = res.LGTYP,
                desStorageBin = res.LGPLA,
                movementType = res.BWLVS,
                giDoc = res.GI_DOC,
                tranOrder = res.BTANR,
                errMSG = res.ERR_MSG,
            };
            return newRes;
        }
        public dynamic ZWMRF006(ZSWMRF006_IN_AWS reqVO, VOCriteria buVO)
        {
            var getURL = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAPCONNECT_LOCATION").DataValue;
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

            var res = this.postSAP<ZSWMRF006_OUT_SAP>(req, buVO, getURL);
            var newRes = new
            {
                mode = res.MODE,
                storageUnitNum = res.LENUM,
                reserveNumber = res.LGTYP,
                desStorageType = res.LGTYP,
                desStorageBin = res.LGPLA,
                movementType = res.BWLVS,
                giDoc = res.GI_DOC,
                tranOrder = res.BTANR,
                errMSG = res.ERR_MSG,
            };
            return newRes;
        }

        public dynamic ZWMRF007(ZSWMRF007_IN_REQ reqVO, VOCriteria buVO)
        {
            var getURL = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAPCONNECT_LOCATION").DataValue;
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

            var res = this.postSAP<ZSWMRF007_OUT_SAP>(req, buVO, getURL);
            var newRes = new
            {
                warehouseCode = res.LGNUM,
                materialNumber = res.MATNR,
                batch = res.CHARG,
                dateFromBatch = res.FVDT1,
                errMSG = res.ERR_MSG,
            };
            return newRes;
        }

        public object ZWMRF003(ZSWMRF003_IN_REQ reqVO, VOCriteria buVO)
        {
            var getURL = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAPCONNECT_LOCATION").DataValue;
            var getEnvironment = StaticValueManager.GetInstant().Configs.FirstOrDefault(x => x.Code == "SAP_ENVIRONMENT").DataValue;
            var req = new SAPReq()
            {
                environmentName = getEnvironment,
                functionName = "ZWMRF003",
                inStructureName = "ZSWMRF003_IN_REQ",
                inTableName = "IN_REQ",
                outTableName = "OUT_REQ ",
                datas = reqVO
            };

            var res = this.postSAP<ZSWMRF003_OUT_REQ>(req, buVO, getURL);
            var newRes = new
            {
                mode = res.ZMODE,
                warehouseCode = res.LGNUM,
                storageUnitNum = res.LENUM,
                reserveNumber = res.RSNUM,
                DONumber = res.VBELN_VL,
                DOItem = res.POSNR,
                materialNumber = res.MATNR,
                batch = res.CHARG,
                quantity = res.BDMNG,
                desStorageType = res.LGTYP,
                desStorageSection = res.LGBER,
                desStorageBin = res.LGPLA,
                availableStock = res.BESTQ_UR,
                inQC = res.BESTQ_QI,
                block = res.BESTQ_BLK,
                baseUnit = res.MEINS,
                movementType = res.BWLVS,
                salesInstruction = res.VBELN,
                errMSG = res.ERR_MSG,
            };

            return newRes;
        }
    }
}
