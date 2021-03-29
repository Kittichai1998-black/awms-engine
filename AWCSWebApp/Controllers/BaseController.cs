using ADO.WCSDB;
using AMSModel.Criteria;
using AMWUtil.Logger;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWCSWebApp.Controllers
{
    public class BaseController : ControllerBase
    {
        protected ResponseCriteria<TRes> ExecBlock<TRes>(string api_name, Func<VOCriteria, TRes> func)
        {
            ResponseCriteria<TRes> res = new ResponseCriteria<TRes>();
            res._result = new ResponseCriteria<TRes>.Result();
            VOCriteria buVO = new VOCriteria();
            try
            {
                buVO.Logger = AMWLoggerManager.GetLogger("pb_api", api_name);
                buVO.SqlConnection = DataADO.GetInstant().CreateConnection();
                buVO.SqlTransaction_Begin();
                res.datas = func(buVO);
                buVO.SqlTransaction_Commit();
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
