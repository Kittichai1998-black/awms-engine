using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMWUtil.Common;
using AMWUtil.DataAccess.Http;
using AWCSEngine.Engine.McRuntime;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine.WorkRuntime
{
    public class InboundWorkEngine : BaseWorkRuntime
    {
        public InboundWorkEngine(string logref) : base(logref)
        {
        }

        protected override void OnStart()
        {
        }

        protected override void OnRun()
        {
            this.OnRun_W08();
        }

        private void OnRun_W08()
        {
            var mcGate_RC8_2 = McController.GetMcRuntime("RC8-2");
            if (mcGate_RC8_2.McObj.DV_Pre_Status == 4)
            {
                var baseObj = BaseObjectADO.GetInstant().GetByMcObject(mcGate_RC8_2.ID, this.BuVO);
                if (baseObj != null && baseObj.EventStatus == BaseObjectEventStatus.TEMP)
                {
                    RequestRegisterWQCriteria data_req = new RequestRegisterWQCriteria() { };
                    var dr = RESTFulAccess.SendJson<dynamic>(
                        this.Logger, StaticValueManager.GetInstant().GetConfigValue("wms.api_url.register_wq"),
                        RESTFulAccess.HttpMethod.POST,
                        data_req);
                    if(dr._result.status == 1){
                        WorkQueueCriteria res = ObjectUtil.Cast2<WorkQueueCriteria>(dr);
                        new CommonEngine.RegisterMcQueueInbound(this.LogRefID, this.BuVO)
                            .Execute(new CommonEngine.RegisterMcQueueInbound.TReq()
                        {
                            wqID = res.queueID.Value,
                            souLocCode =res.souLocationCode,
                            desLocCode=res.desLocationCode
                        });
                    }
                    else
                    {
                        mcGate_RC8_2.PostError("WMS : " + dr._result.message);
                    }

                }
            }
        }

        protected override void OnStop()
        {
        }
    }
}
