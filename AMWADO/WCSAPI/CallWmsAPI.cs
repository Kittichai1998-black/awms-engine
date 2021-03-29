using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Criteria.API;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.DataAccess.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ADO.WCSAPI
{
    public class CallWmsAPI : BaseAPI<CallWmsAPI>
    {
        public WorkQueueCriteria Send_RegisterWQ(WMReq_RegisterWQ req, VOCriteria buVO)
        {
            //////////////// DUMMY
            /* WorkQueueCriteria wq = new WorkQueueCriteria()
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
            return wq;*/

            ////////////////////////////////////////WMS FULL
            /*var res = RESTFulAccess.SendJson<dynamic>(null,
                StaticValueManager.GetInstant().GetConfigValue("regist_wq"), 
                RESTFulAccess.HttpMethod.POST, req, null, 1, 60000);

            if (res._result.status != 1)
                throw new Exception("WMS Error : " + res._result.message);

            return AMWUtil.Common.ObjectUtil.DynamicToModel<WorkQueueCriteria>(res);*/


            var buWork =
                DataADO.GetInstant().SelectBy<act_BuWork>(
                    new SQLConditionCriteria[]
                    {
                        new SQLConditionCriteria("Status", new EntityStatus[] { EntityStatus.ACTIVE, EntityStatus.INACTIVE }, SQLOperatorType.IN),
                        new SQLConditionCriteria("LabelData",req.barcode_pstos[0], SQLOperatorType.EQUALS)
                    }
                , buVO).First();

            var souLoc = StaticValueManager.GetInstant().GetLocation(req.locationCode);
            var souArea = StaticValueManager.GetInstant().GetLocation(req.areaCode);
            var souWh = StaticValueManager.GetInstant().GetLocation(req.warehouseCode);

            var desLoc = StaticValueManager.GetInstant().GetLocation(buWork.Des_Location_ID.Value);
            var desArea = StaticValueManager.GetInstant().GetLocation(buWork.Des_Area_ID.Value);
            var desWh = StaticValueManager.GetInstant().GetLocation(buWork.Des_Warehouse_ID.Value);

            WorkQueueCriteria wq = new WorkQueueCriteria()
            {
                ioType = buWork.IOType,
                warehouseCode = souWh.Code,
                areaCode = souArea.Code,
                locationCode = souLoc.Code,
                desWarehouseCode = desWh.Code,
                desAreaCode = desArea.Code,
                desLocationCode = desLoc.Code,
                priority = buWork.Priority,
                seqGroup =buWork.SeqGroup,
                seqItem = buWork.SeqIndex,
                queueRefID = buWork.TrxRef,
                queueID = buWork.ID.Value,
                queueStatus= WorkQueueEventStatus.WARNING,
                baseInfo = new WorkQueueCriteria.BaseInfo()
                {
                    baseCode = req.baseCode,
                    packInfos = new List<WorkQueueCriteria.BaseInfo.PackInfo>()
                    {
                        new WorkQueueCriteria.BaseInfo.PackInfo()
                        {
                            code = buWork.SkuCode,
                            lot = buWork.SkuLot,
                            Info2 = buWork.SkuGrade,
                            qty=buWork.SkuQty,
                            unit=buWork.SkuUnit,
                            baseQty=buWork.SkuQty,
                            baseUnit=buWork.SkuUnit,

                        }
                    }
                }
            };
            buWork.WMS_WorkQueue_ID = wq.queueID;
            buWork.Status = EntityStatus.ACTIVE;
            DataADO.GetInstant().UpdateBy<act_BuWork>(buWork, buVO);
            return wq;
        }
        public WorkQueueCriteria Send_WorkingWQ(WMReq_WorkingWQ req)
        {
            //return Send_RegisterWQ(new WMReq_RegisterWQ());

            /*var res = RESTFulAccess.SendJson<dynamic>(null,
                StaticValueManager.GetInstant().GetConfigValue("work_wq"),
                RESTFulAccess.HttpMethod.POST, req, null, 1, 60000);

            if (res._result.status != 1)
                throw new Exception("WMS Error : " + res._result.message);

            return AMWUtil.Common.ObjectUtil.DynamicToModel<WorkQueueCriteria>(res);*/

            return null;
        }
        public WorkQueueCriteria Send_DoneWQ(WMReq_DoneWQ req,VOCriteria buVO)
        {
            //return Send_RegisterWQ(new WMReq_RegisterWQ());

            /*var res = RESTFulAccess.SendJson<dynamic>(null,
                StaticValueManager.GetInstant().GetConfigValue("done_wq"),
                RESTFulAccess.HttpMethod.POST, req, null, 1, 60000);

            if (res._result.status != 1)
                throw new Exception("WMS Error : "+res._result.message);

            return AMWUtil.Common.ObjectUtil.DynamicToModel<WorkQueueCriteria>(res);*/

            act_BuWork buWork = ADO.WCSDB.DataADO.GetInstant().SelectBy<act_BuWork>(
                ListKeyValue<string, object>.New("WMS_WorkQueue_ID", req.queueID).Add("Status",EntityStatus.ACTIVE),
                buVO).FirstOrDefault();
            if (buWork != null)
            {
                buWork.Status = EntityStatus.DONE;
                DataADO.GetInstant().UpdateBy<act_BuWork>(buWork, buVO);
            }
            return null;
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
