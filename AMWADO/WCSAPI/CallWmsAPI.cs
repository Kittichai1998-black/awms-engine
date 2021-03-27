using ADO.WCSStaticValue;
using AMSModel.Criteria;
using AMSModel.Criteria.API;
using AMWUtil.Common;
using AMWUtil.DataAccess.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace ADO.WCSAPI
{
    public class CallWmsAPI : BaseAPI<CallWmsAPI>
    {
        public WorkQueueCriteria Send_RegisterWQ(WMReq_RegisterWQ req)
        {
            WorkQueueCriteria wq = new WorkQueueCriteria()
            {
                ioType = AMSModel.Constant.EnumConst.IOType.INBOUND,
                warehouseCode = req.warehouseCode,
                areaCode = req.areaCode,
                locationCode = req.locationCode,
                souWarehouseCode = req.warehouseCode,
                souAreaCode = req.areaCode,
                souLocationCode = req.locationCode,
                desWarehouseCode = "W8",
                desAreaCode = "8STO",
                desLocationCode = "046045001",

                queueID = DateTime.Now.Ticks/10000,
                seqGroup = 0,
                seqItem = 0,
                queueRefID = ObjectUtil.GenUniqID(),
                priority = 1,
                
                baseInfo = new WorkQueueCriteria.BaseInfo()
                {
                    baseCode = req.baseCode,
                    packInfos = new List<WorkQueueCriteria.BaseInfo.PackInfo>()
                    {
                        new WorkQueueCriteria.BaseInfo.PackInfo()
                        {
                            code = "SKU00001",
                            batch = string.Empty,
                            lot = "LOT0001",
                            baseQty = 1500,
                            baseUnit = "kg",
                        }
                    }
                }
            };
            return wq;

            ////////////////////////////////////////
            var res = RESTFulAccess.SendJson<dynamic>(null,
                StaticValueManager.GetInstant().GetConfigValue("regist_wq"), 
                RESTFulAccess.HttpMethod.POST, req, null, 1, 60000);

            if (res._result.status != 1)
                throw new Exception("WMS Error : " + res._result.message);

            return AMWUtil.Common.ObjectUtil.DynamicToModel<WorkQueueCriteria>(res);
        }
        public WorkQueueCriteria Send_WorkingWQ(WMReq_WorkingWQ req)
        {
            return Send_RegisterWQ(new WMReq_RegisterWQ());

            var res = RESTFulAccess.SendJson<dynamic>(null,
                StaticValueManager.GetInstant().GetConfigValue("work_wq"),
                RESTFulAccess.HttpMethod.POST, req, null, 1, 60000);

            if (res._result.status != 1)
                throw new Exception("WMS Error : " + res._result.message);

            return AMWUtil.Common.ObjectUtil.DynamicToModel<WorkQueueCriteria>(res);
        }
        public WorkQueueCriteria Send_DoneWQ(WMReq_DoneWQ req)
        {
            return Send_RegisterWQ(new WMReq_RegisterWQ());

            var res = RESTFulAccess.SendJson<dynamic>(null,
                StaticValueManager.GetInstant().GetConfigValue("done_wq"),
                RESTFulAccess.HttpMethod.POST, req, null, 1, 60000);

            if (res._result.status != 1)
                throw new Exception("WMS Error : "+res._result.message);

            return AMWUtil.Common.ObjectUtil.DynamicToModel<WorkQueueCriteria>(res);
        }
        public WMRes_UpdateBaseStoLocation Send_MoveLocation(WMReq_UpdateBaseStoLocation req)
        {
            return req.Cast2<WMRes_UpdateBaseStoLocation>();

            var res = RESTFulAccess.SendJson<dynamic>(null,
                StaticValueManager.GetInstant().GetConfigValue("update_sto_location"),
                RESTFulAccess.HttpMethod.POST, req, null, 1, 60000);

            if (res._result.status != 1)
                throw new Exception("WMS Error : " + res._result.message);

            return AMWUtil.Common.ObjectUtil.DynamicToModel<WorkQueueCriteria>(res);
        }
    }
}
