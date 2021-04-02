using ADO.WCSDB;
using AMSModel.Criteria;
using AMWUtil.Logger;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWCSWebApp.Engine.APIService
{
    public abstract class BaseAPI<TReq,TRes>
    {
        protected abstract TRes ChildExec(TReq request,VOCriteria buVO);
        public ResponseCriteria<TRes> Exec(string api_name,dynamic request)
        {
            ResponseCriteria<TRes> res = new ResponseCriteria<TRes>();
            res._result = new ResponseCriteria<TRes>.Result();
            VOCriteria buVO = new VOCriteria();
            try
            {
                buVO.Logger = AMWLoggerManager.GetLogger("api_log", api_name);
                buVO.SqlConnection = DataADO.GetInstant().CreateConnection();
                buVO.SqlTransaction_Begin();
                res.response = ChildExec(request,buVO);
                buVO.SqlTransaction_Commit();
                res._result.status = 1;
                res._result.message = "SUCCESS";
            }
            catch (Exception ex)
            {
                res._result.status = 0;
                res._result.message = ex.Message;
            }
            finally
            {
                buVO.SqlTransaction_Rollback();
            }
            return res;
        }
    }
}
