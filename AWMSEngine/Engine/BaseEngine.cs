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
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace AWMSEngine.Engine
{
    public abstract class BaseEngine<TReq, TRes>
        where TRes : class
    {
        protected abstract TRes ExecuteEngine(TReq reqVO);

        public VOCriteria BuVO { get; set; }
        public StaticValueManager StaticValue { get; set; }
        public AMWLogger Logger { get; set; }

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

        protected TExecRes ExectProject<TExecReq,TExecRes>(FeatureCode featureCode, TExecReq req)
           where TExecRes : class
        {
            return Common.FeatureExecute.ExectProject<TExecReq, TExecRes>(featureCode, this.Logger, this.BuVO, req);
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
            //long dbLogActionID = 0;
            //var resultStatus = new { status = -1,code="", message = "", logref = "", techmessage = "" };
            try
            {
                this.Logger = logger;
                this.Logger.LogInfo("--------- Begin Engine.Exec ---------");
                this.Logger.LogInfo("reqVO=" + resVO.Json());
                //dbLogActionID = ADO.LogingADO.GetInstant().BeginAPIServiceAction(dbLogID, this.GetType().FullName, reqVO, this.BuVO);
                this.StaticValue = StaticValueManager.GetInstant();
                //this.Logger.LogInfo("BuVO : " + this.BuVO.ToString());
                resVO = this.ExecuteEngine(reqVO);
                //resultStatus = new { status = 1, code = "I0000", message = "SUCCESS", logref = logger.LogRefID, techmessage = "" };
            }
            catch (AMWException)
            {
                //resultStatus = new { status = 0, code = ex.GetAMWCode(), message = ex.Message, logref = logger.LogRefID, techmessage = ex.StackTrace };
                throw;
            }
            catch (System.Exception ex)
            {
                this.Logger.LogError(ex.StackTrace);
                //resultStatus = new { status = 0, code = AMWExceptionCode.U0000.ToString(), message = ex.Message, logref = logger.LogRefID, techmessage = ex.StackTrace };
                //throw ex;
                throw;
            }
            finally
            {
                //ADO.LogingADO.GetInstant().EndAPIServiceAction(dbLogActionID,resultStatus.status,resultStatus.code,resultStatus.message,resultStatus.techmessage, this.BuVO);

                if (this.Logger != null)
                {
                    this.Logger.LogInfo("resVO=" + resVO.Json());
                    this.Logger.LogInfo("--------- End Engine.Exec ---------");
                }
                logger.SubServiceName = this._subServiceNameTMP;
            }
            return resVO;
        }
        
    }
}
