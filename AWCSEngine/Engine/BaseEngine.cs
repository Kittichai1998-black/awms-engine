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
            try
            {
                res.result = this.ExecuteChild(request);
                res.status = 1;
                res.message = "SUCCESS";
                res.trace = "";
            }
            catch (AMWException ex)
            {
                res.status = 0;
                res.message = ex.Message;
                res.trace = ex.StackTrace;
                throw;
            }
            catch (Exception ex)
            {
                res.status = 0;
                res.message = ex.Message;
                res.trace = ex.StackTrace;
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
