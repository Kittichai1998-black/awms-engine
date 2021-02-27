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

        public BaseEngine(string logref = null)
        {
            this.BuVO = new VOCriteria();
            this.BuVO.Logger = AMWLoggerManager.GetLogger("Engine",this.BaseLogName() , logref);
            this.BuVO.Logger.SubServiceName = this.GetType().Name;
            this.BuVO.SqlConnection = ADO.WCSDB.DataADO.GetInstant().CreateConnection();
        }

        public TRes Execute(TReq request)
        {
            TRes res = null;
            try
            {
                res = this.ExecuteChild(request);
            }
            catch (AMWException)
            {
                throw;
            }
            catch (Exception ex)
            {
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
