using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AMWUtil.Validation;
using ADO.WMSStaticValue;
using AWMSEngine.Controllers.V2;
using AWMSEngine.HubService;
using AMSModel.Constant.EnumConst;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using Microsoft.AspNetCore.SignalR;
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
        public TReq ConverRequest(dynamic req)
        {
            TReq _req = ObjectUtil.DynamicToModel<TReq>(req);
            return _req;
        }
        protected abstract TRes ExecuteEngine(TReq reqVO);

        protected BaseController BaseController
        {
            get => this.BuVO.Get<BaseController>(BusinessVOConst.KEY_BASE_CONTROLLER);
        }
        protected IHubContext<CommonMessageHub> CommonMsgHub
        {
            get => this.BuVO.Get<BaseController>(BusinessVOConst.KEY_BASE_CONTROLLER).CommonMsgHub;
        }

        public VOCriteria BuVO { get; set; }
        public StaticValueManager StaticValue { get; set; }
        public AMWLogger Logger { get; set; }

        protected string Token => this.BuVO.Get<string>(BusinessVOConst.KEY_TOKEN);
        protected TokenObject TokenInfo => this.BuVO.Get<TokenObject>(BusinessVOConst.KEY_TOKEN_INFO);
        protected string APIKey => this.BuVO.GetString(BusinessVOConst.KEY_APIKEY);
        protected ams_APIKey APIKeyInfo => this.BuVO.Get<ams_APIKey>(BusinessVOConst.KEY_APIKEY_INFO);

        protected SqlTransaction Transaction => this.BuVO.Get<SqlTransaction>(BusinessVOConst.KEY_DB_TRANSACTION);
        protected dynamic RequestParam => this.BuVO.GetDynamic(BusinessVOConst.KEY_REQUEST);
        protected LanguageType LanguageCode => this.BuVO.Get<LanguageType>(BusinessVOConst.KEY_LANGUAGE_CODE, LanguageType.TH);

        private string _subServiceNameTMP;


        private void ValidateRequestParameter(TReq reqVO)
        {
            if (reqVO == null)
                return;
            var ex = ValidationUtil.ValidateModel(reqVO);
            if (ex != null)
                throw new AMWException(this.Logger, ex.Code, ex.Parameters);
        }


        public TRes Execute(AMWLogger logger,
            VOCriteria buVO,
            TReq reqVO,
            bool callPlugIn = true)
        {
            this._subServiceNameTMP = logger.SubServiceName;
            logger.SubServiceName = this.GetType().Name.Split('.').Last();
            this.BuVO = buVO;
            TRes resVO = null;
            var result = this.BuVO.Get<dynamic>(BusinessVOConst.KEY_RESULT_API);
            //long dbLogID = this.BuVO.Get<long>(BusinessVOConst.KEY_DB_LOGID);
            //long dbLogActionID = 0;
            //var resultStatus = new { status = -1,code="", message = "", logref = "", techmessage = "" };
            try
            {
                this.Logger = logger;
                this.Logger.LogInfo("--------- BEGIN_ENGINE:" + (this.GetType().Name) + " ---------");
                this.Logger.LogInfo("INPUT=" + reqVO.Json());
                //dbLogActionID = ADO.WMSDB.LogingADO.GetInstant().BeginAPIServiceAction(dbLogID, this.GetType().FullName, reqVO, this.BuVO);
                this.StaticValue = StaticValueManager.GetInstant();
                //this.Logger.LogInfo("BuVO : " + this.BuVO.ToString());
                this.ValidateRequestParameter(reqVO);
                if(callPlugIn)
                    resVO = Common.FeatureExecute.ExectProject<TReq, TRes>(this.GetType(),"PLUGIN.CLASS.ENGINE." + this.GetType().Name, this.Logger, this.BuVO, reqVO);
                if(resVO == null)
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

                var exs = new AMWExceptionSourceChild(ex);
                //this.Logger.LogError(ex.Message, exs.SourceFile, exs.LineNumber);
                this.Logger.LogError(ex.StackTrace, exs.SourceFile, exs.LineNumber);
                throw new AMWException(this.Logger, AMWExceptionCode.U0000, ex.Message, exs);
            }
            finally
            {
                //ADO.WMSDB.LogingADO.GetInstant().EndAPIServiceAction(dbLogActionID,resultStatus.status,resultStatus.code,resultStatus.message,resultStatus.techmessage, this.BuVO);

                if (this.Logger != null)
                {
                    this.Logger.LogInfo("OUTPUT=" + resVO.Json());
                    this.Logger.LogInfo("--------- END_ENGINE:" + (this.GetType().Name) + " ---------");
                }
                logger.SubServiceName = this._subServiceNameTMP;
            }
            return resVO;
        }
        
    }
}
