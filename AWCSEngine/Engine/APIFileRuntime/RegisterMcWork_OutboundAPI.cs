using AMSModel.Criteria;
using AMSModel.Entity;
using AWCSEngine.Engine.CommonEngine;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine.APIFileRuntime
{
    public class RegisterMcWork_OutboundAPI : BaseAPIFileRuntime
    {

        public RegisterMcWork_OutboundAPI(string logref) : base(logref)
        {
        }

        protected override dynamic ExecuteChild(dynamic _req)
        {
            TReq_RegisterMcWork_OutboundAPI req = AMWUtil.Common.ObjectUtil.DynamicToModel<TReq_RegisterMcWork_OutboundAPI>(_req);
            TRes_RegisterMcWork_OutboundAPI res = new TRes_RegisterMcWork_OutboundAPI();
            try
            {
                this.BuVO.SqlTransaction_Begin();
                req.works.ForEach(x =>
                {
                    var mcWork = new RegisterMcWork_OutboundComm(this.LogRefID, this.BuVO).Execute(x);
                    res.works.Add(mcWork.data);
                });
                this.BuVO.SqlTransaction_Commit();
            }
            catch
            {
                this.BuVO.SqlTransaction_Rollback();
                throw;
            }
            return res;
        }
    }
}
