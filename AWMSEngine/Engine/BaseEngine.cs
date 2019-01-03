using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO.StaticValue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Data.SqlClient;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace AWMSEngine.Engine
{
    public abstract class BaseEngine<TReq, TRes>
        where TRes : class
    {
        protected abstract TRes ExecuteEngine(TReq reqVO);

        protected VOCriteria BuVO { get; set; }
        protected StaticValueManager StaticValue { get; set; }
        protected AMWLogger Logger { get; set; }

        protected string Token => this.BuVO.Get<string>(BusinessVOConst.KEY_TOKEN);
        protected amt_Token TokenInfo => this.BuVO.Get<amt_Token>(BusinessVOConst.KEY_TOKEN_INFO);
        protected string APIKey => this.BuVO.GetString(BusinessVOConst.KEY_APIKEY);
        protected ams_APIKey APIKeyInfo => this.BuVO.Get<ams_APIKey>(BusinessVOConst.KEY_APIKEY_INFO);

        protected SqlTransaction Transaction => this.BuVO.Get<SqlTransaction>(BusinessVOConst.KEY_DB_TRANSACTION);
        protected dynamic RequestParam => this.BuVO.GetDynamic(BusinessVOConst.KEY_REQUEST);
        protected LanguageType LanguageCode => this.BuVO.Get<LanguageType>(BusinessVOConst.KEY_LANGUAGE_CODE, LanguageType.TH);

        private string _subServiceNameTMP;

        protected AMWException NewAMWException(AMWExceptionCode code, params string[] parameters)
        {
            return new AMWException(this.Logger, code, parameters, (AMWException.ENLanguage)LanguageCode);
        }

        public TRes Execute(AMWLogger logger,
            VOCriteria buVO,
            TReq reqVO)
        {
            this._subServiceNameTMP = logger.SubServiceName;
            logger.SubServiceName = this.GetType().Name.Split('.').Last();
            this.BuVO = buVO;
            TRes resVO = null;
            var result = this.BuVO.Get<dynamic>(BusinessVOConst.KEY_RESULT_API);
            long dbLogID = this.BuVO.Get<long>(BusinessVOConst.KEY_DB_LOGID);
            long dbLogActionID = 0;
            var resultStatus = new { status = -1,code="", message = "", techmessage = "" };
            try
            {
                this.Logger = logger;
                this.Logger.LogInfo("REQUEST_DATA:: " + resVO.Json());
                dbLogActionID = ADO.LogingADO.GetInstant().BeginAPIServiceAction(dbLogID, this.GetType().FullName, reqVO, this.BuVO);
                this.StaticValue = StaticValueManager.GetInstant();
                //this.Logger.LogInfo("BuVO : " + this.BuVO.ToString());
                resVO = this.ExecuteEngine(reqVO);

                resultStatus = new { status = 1, code = "I0000", message = "SUCCESS", techmessage = "" };
            }
            catch (AMWException ex)
            {
                resultStatus = new { status = 0, code = ex.GetAMWCode(), message = ex.Message, techmessage = ex.StackTrace };
                throw ex;
            }
            catch (System.Exception ex)
            {
                this.Logger.LogError(ex.StackTrace);
                resultStatus = new { status = 0, code = AMWExceptionCode.U0000.ToString(), message = ex.Message, techmessage = ex.StackTrace };
                throw ex;
            }
            finally
            {
                ADO.LogingADO.GetInstant().EndAPIServiceAction(dbLogActionID,resultStatus.status,resultStatus.code,resultStatus.message,resultStatus.techmessage, this.BuVO);

                if (this.Logger != null)
                {
                    this.Logger.LogInfo("RESPONSE_DATA:: " + resVO.Json());
                }
                logger.SubServiceName = this._subServiceNameTMP;
            }
            return resVO;
        }
        
    }
}
