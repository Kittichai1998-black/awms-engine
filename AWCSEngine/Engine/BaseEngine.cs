using ADO.WCSStaticValue;
using AMSModel.Criteria;
using AMWUtil.Exception;
using AMWUtil.Logger;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine
{
    public abstract class BaseEngine<TReq,TRes>
        where TRes:class,new()
    {
        protected abstract string BaseLogName();
        protected abstract TRes ExecuteChild(TReq req);

        protected VOCriteria BuVO { get; private set; }
        protected string LogRefID { get => this.BuVO.Logger.LogRefID; }
        protected AMWLogger Logger { get => this.BuVO.Logger; }
        protected StaticValueManager StaticValue { get => StaticValueManager.GetInstant(); }  
        public BaseEngine(string logref, VOCriteria buVO=null)
        {
            this.BuVO = buVO ?? new VOCriteria();
            this.BuVO.Logger = AMWLoggerManager.GetLogger("Engine",this.BaseLogName() , logref);
            this.BuVO.Logger.SubServiceName = this.GetType().Name;
            this.BuVO.SqlConnection = ADO.WCSDB.DataADO.GetInstant().CreateConnection();
        }
        public ResponseCriteria<TRes> Execute(TReq request)
        {
            ResponseCriteria<TRes> res = new ResponseCriteria<TRes>();
            res._result = new ResponseCriteria<TRes>.Result();
            try
            {
                res.datas = this.ExecuteChild(request);
                res._result.status = 1;
                res._result.message = "SUCCESS";
                res._result.trace = "";
            }
            catch (AMWException ex)
            {
                res._result.status = 0;
                res._result.message = ex.Message;
                res._result.trace = ex.StackTrace;
                throw;
            }
            catch (Exception ex)
            {
                res._result.status = 0;
                res._result.message = ex.Message;
                res._result.trace = ex.StackTrace;
                this.Logger.LogError(ex.StackTrace);
                throw new AMWException(this.Logger, AMWExceptionCode.U0000, ex.Message);
            }
            finally
            {
            }
            return res;
        }

    }
}
