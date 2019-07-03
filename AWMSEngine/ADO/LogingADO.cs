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
        public long BeginAPIService(int? serviceID,string serviceName,string url, string ipRemote, string ipLocal, string serverName, object request, VOCriteria buVO)
        {
            var service = StaticValue.StaticValueManager.GetInstant().APIServices.FirstOrDefault(x => x.ID == serviceID);
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("@LogRefID", buVO.Logger.LogRefID);
            param.Add("@Token", buVO.Get<string>(AWMSModel.Constant.StringConst.BusinessVOConst.KEY_TOKEN));
            param.Add("@APIKey ", buVO.Get<string>(AWMSModel.Constant.StringConst.BusinessVOConst.KEY_APIKEY));
            param.Add("@APIService_ID ", service != null ? service.ID : null);
            param.Add("@APIService_Code ", service != null ? service.ID : null);
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

        public long PutDocumentAlertMessage(long docID, string msgError, string msgWarning, string msgInfo, VOCriteria buVO)
        {
            var doc = ADO.DataADO.GetInstant().SelectByID<amt_Document>(docID, buVO);
            var options = doc.Options;
            options = AMWUtil.Common.ObjectUtil.QryStrSetValue(options,
                new KeyValuePair<string, object>("_error", msgError),
                new KeyValuePair<string, object>("_warning", msgWarning),
                new KeyValuePair<string, object>("_info", msgInfo));

            ADO.DataADO.GetInstant().UpdateBy<amt_Document>(
                new SQLConditionCriteria[]{
                    new SQLConditionCriteria("id",doc.ID.Value, SQLOperatorType.EQUALS)
                },
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string, object>("options",options)
                }, buVO);
            return doc.ID.Value;
        }
        public long PutSendAPIEvent(HttpResultModel apiEvt, VOCriteria buVO)
        {
            var id = ADO.DataADO.GetInstant().Insert<aml_SendAPIEvent>(
                buVO,
                new aml_SendAPIEvent()
                {
                    ID = null,
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
