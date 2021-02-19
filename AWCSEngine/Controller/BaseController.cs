using AMSModel.Criteria;
using AMWUtil.Exception;
using AMWUtil.Logger;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Controller
{
    public abstract class BaseController<T>
        where T : BaseController<T>, new()
    {
        protected AMWLogger Logger { get => this.BuVO.Logger; }
        protected VOCriteria BuVO { get; set; }
        private static Dictionary<string, T> instants { get; set; }
        public static T GetInstant()
        {
            string key = typeof(T).Name;
            if (instants == null)
                instants = new Dictionary<string, T>();
            if (!instants.ContainsKey(key))
                instants.Add(key, new T());
            return instants[key];
        }

        protected BaseController()
        {
            this.BuVO = new VOCriteria();
            this.BuVO.Logger = AMWLoggerManager.GetLogger("Controller",typeof(T).Name);
        }
        protected TResult ExecTrySQLTransaction< TResult>(Func< TResult> action)
        {
            try
            {
                return action();
            }
            catch (AMWException ex)
            {
            }
            catch (Exception ex)
            {

            }
            return default(TResult);
        }

        private void BeginTransaction()
        {
            this.BuVO.SqlConnection = ADO.WCSDB.DataADO.GetInstant().CreateConnection();
            this.BuVO.SqlTransaction_Begin();
        }
        private void RollbackTransaction()
        {
            this.BuVO.SqlTransaction_Rollback();
        }
        private void CommitTransaction()
        {
            this.BuVO.SqlTransaction_Commit();
        }
    }
}
