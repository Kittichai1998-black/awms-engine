using AMSModel.Criteria;
using AMSModel.Criteria.API;
using AMSModel.Entity;
using AWCSEngine.Engine.CommonEngine;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine.APIFileRuntime
{
    public class API_RegisterMcWorkOUT : BaseAPIFileRuntime
    {

        public API_RegisterMcWorkOUT(string logref) : base(logref)
        {
        }

        protected override dynamic ExecuteChild(dynamic _req)
        {
            WCReq_RegisterMcWork_OutboundAPI req = AMWUtil.Common.ObjectUtil.DynamicToModel<WCReq_RegisterMcWork_OutboundAPI>(_req);
            WCRes_RegisterMcWork_OutboundAPI res = new WCRes_RegisterMcWork_OutboundAPI();

            this.BuVO.SqlTransaction_Begin();
            req.works.ForEach(x =>
            {
                var mcWork = new Comm_CreateMcWorkOUT(this.LogRefID, this.BuVO).Execute(x);
                res.works.Add(mcWork.response);
            });
            return res;
        }
    }
}
