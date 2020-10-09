using AMWUtil.DataAccess.Http;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO
{
    public class LogingADO : BaseMSSQLAccess<LogingADO>
    {
        public long BeginAPIService(long? serviceID,string serviceName,string url, string ipRemote, string ipLocal, string serverName, object request, VOCriteria buVO)
        {
            var service = StaticValue.StaticValueManager.GetInstant().APIServices.FirstOrDefault(x => x.ID == serviceID);
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@LogRefID", buVO.Logger.LogRefID);
            param.Add("@TrxRefID", buVO.TrxRefID);
            param.Add("@Token", buVO.Get<string>(AWMSModel.Constant.StringConst.BusinessVOConst.KEY_TOKEN));
            param.Add("@APIKey ", buVO.Get<string>(AWMSModel.Constant.StringConst.BusinessVOConst.KEY_APIKEY));
            param.Add("@APIService_ID ", service != null ? service.ID : null);
            param.Add("@APIService_Code ", service != null ? service.Code : null);
            param.Add("@APIService_Name ", serviceName);
            param.Add("@IPRemote", ipRemote);
            param.Add("@IPLocal", ipLocal);
            param.Add("@ServerName ", serverName);
            param.Add("@InputText ", Newtonsoft.Json.JsonConvert.SerializeObject(request));
            param.Add("@Url ", url);
            param.Add("@ActionBy", buVO.ActionBy);
            param.Add("@ID", null, System.Data.DbType.Int64, System.Data.ParameterDirection.InputOutput);
            this.Execute("SP_LOG_APISERVICE_EVENT", System.Data.CommandType.StoredProcedure, param, buVO.Logger);
            long id = param.Get<long>("@ID");
            return id;
        }
        public long EndAPIService(long logID, object response, int resultStatus, string resultCode, string resultMessage, string techMessage, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();

            param.Add("@OutputText ", Newtonsoft.Json.JsonConvert.SerializeObject(response));
            param.Add("@ResultStatus", resultStatus);
            param.Add("@ResultCode", resultCode);
            param.Add("@ResultMessage ", resultMessage);
            param.Add("@TechMessage ", techMessage);
            param.Add("@ID", logID, System.Data.DbType.Int64, System.Data.ParameterDirection.InputOutput);
            this.Execute("SP_LOG_APISERVICE_EVENT", System.Data.CommandType.StoredProcedure, param, buVO.Logger);
            long id = param.Get<long>("@ID");
            return id;
        }

        public long PutDocumentAlertMessage(FinalDatabaseLogCriteria.DocumentOptionMessage docMsg, VOCriteria buVO)
        {
            var d = AMWUtil.Common.ObjectUtil.Json(docMsg);
            buVO.Logger.LogInfo("PutDocumentAlertMessage : " + d);
            //return 0;
            var doc = ADO.DataADO.GetInstant().SelectByID<amt_Document>(docMsg.docID, buVO);
            var options = doc.Options;
            options = AMWUtil.Common.ObjectUtil.QryStrSetValue(options,
                new KeyValuePair<string, object>("_error", docMsg.msgError),
                new KeyValuePair<string, object>("_warning", docMsg.msgWarning),
                new KeyValuePair<string, object>("_info", docMsg.msgInfo));

            ADO.DataADO.GetInstant().UpdateBy<amt_Document>(
                new SQLConditionCriteria[]{
                    new SQLConditionCriteria("id",doc.ID.Value, SQLOperatorType.EQUALS)
                },
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string, object>("options",options)
                }, buVO);
            return doc.ID.Value;
        }
        public long PutAPIPostBackEvent(HttpResultModel apiEvt, VOCriteria buVO)
        {
            var d = AMWUtil.Common.ObjectUtil.Json(apiEvt);
            buVO.Logger.LogInfo("PutAPIPostBackEvent : " + d);
            //return 0;
            var id = ADO.DataADO.GetInstant().Insert<aml_APIPostEvent>(
                buVO,
                new aml_APIPostEvent()
                {
                    ID = null,
                    PostRefID = apiEvt.PostRefID,
                    LogRefID = buVO.Logger.LogRefID,
                    APIService_Module = apiEvt.APIService_Module,
                    APIName = apiEvt.APIName,
                    APIUrl = apiEvt.APIUrl,
                    Header = apiEvt.Header,
                    InputText = apiEvt.InputText,
                    OutputText = apiEvt.OutputText,
                    HttpStatus = apiEvt.HttpStatus,
                    ActionBy = buVO.ActionBy,
                    ResultMessage = apiEvt.ResultMessage,
                    ResultStatus = apiEvt.ResultStatus,
                    StartTime = apiEvt.StartTime,
                    EndTime = apiEvt.EndTime,
                });
            return id.Value;
        }
    }
}
