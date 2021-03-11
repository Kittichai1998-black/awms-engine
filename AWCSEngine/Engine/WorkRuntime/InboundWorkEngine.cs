using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.DataAccess.Http;
using AWCSEngine.Engine.McRuntime;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AWCSEngine.Engine.WorkRuntime
{
    public class InboundWorkEngine : BaseWorkRuntime
    {
        public class TReq_RegisterWQ : RequestRegisterWQCriteria
        {
            public string apikey;
        }
        public class TRes_RegisterWQ : WorkQueueCriteria
        {
            public Result _result;
            public class Result
            {
                public int status;
                public string message;
            }
        }

        public InboundWorkEngine(string logref) : base(logref)
        {
        }

        protected override void OnStart()
        {
        }

        protected override void OnRun()
        {

            this.OnRun_W08_Test();
        }

        private void OnRun_W08_Test()
        {
            var baseObjTmps = ADO.WCSDB.BaseObjectADO.GetInstant().ListTemp(this.BuVO);
            baseObjTmps.ForEach(baseObj =>
            {
                var loc = this.StaticValue.GetLocation(baseObj.Location_ID);
                var area = this.StaticValue.GetArea(loc.Area_ID);
                var wh = this.StaticValue.GetArea(area.Warehouse_ID);
                var mc = McController.GetMcRuntimeByLocation(loc.ID.Value);
                if (mc == null) return;
                var response =
                    RESTFulAccess.SendJson<TRes_RegisterWQ>(
                        this.Logger,
                        this.StaticValue.GetConfigValue("api.url.register_wq"),
                        RESTFulAccess.HttpMethod.POST,
                        new TReq_RegisterWQ()
                        {
                            apikey = this.StaticValue.GetConfigValue("api.apikey"),
                            baseCode = baseObj.Code,
                            actualTime = DateTime.Now,
                            warehouseCode = wh.Code,
                            areaCode = area.Code,
                            locationCode = mc.Code,
                            desWarehouseCode = null,
                            desAreaCode = null,
                            desLocationCode = null,
                            ioType = IOType.INBOUND,
                            width = null,
                            height = null,
                            length = null,
                            weight = 1500,
                            forCustomerCode = null,
                            autoDoc = false,
                            options = string.Empty,
                            barcode_pstos = baseObj.LabelData.Json<List<string>>()
                        });

                if (response._result.status == 1)
                {
                    var desArea = this.StaticValue.GetArea(response.desLocationCode);
                    var desLoc = this.StaticValue.GetLocation(response.desLocationCode);
                    baseObj.Status = EntityStatus.ACTIVE;
                    baseObj.EventStatus = BaseObjectEventStatus.IDLE;
                    baseObj.SkuCode = response.baseInfo.packInfos[0].code;
                    baseObj.SkuName = response.baseInfo.packInfos[0].code;
                    baseObj.SkuQty = response.baseInfo.packInfos[0].qty;
                    baseObj.SkuUnit = response.baseInfo.packInfos[0].unit;
                    baseObj.Info1 = response.baseInfo.packInfos[0].Info1;
                    baseObj.Info2 = response.baseInfo.packInfos[0].Info2;
                    baseObj.Info3 = response.baseInfo.packInfos[0].Info3;
                    DataADO.GetInstant().UpdateBy<act_BaseObject>(baseObj,this.BuVO);

                    var mcWork = new act_McWork()
                    {
                        ID = null,
                        Priority = PriorityType.NORMAL,
                        SeqGroup = response.seq,
                        SeqItem = 0,
                        BaseObject_ID = baseObj.ID.Value,
                        WMS_WorkQueue_ID = response.queueID,
                        Cur_McObject_ID = null,
                        Des_McObject_ID = mc.ID,
                        Cur_Warehouse_ID = mc.Cur_Area.Warehouse_ID,
                        Cur_Area_ID = mc.Cur_Area.ID.Value,
                        Cur_Location_ID = mc.Cur_Location.ID.Value,
                        Sou_Area_ID = mc.Cur_Area.ID.Value,
                        Sou_Location_ID = mc.Cur_Location.ID.Value,
                        Des_Area_ID = desArea.ID.Value,
                        Des_Location_ID = desLoc.ID.Value,
                        StartTime = DateTime.Now,
                        ActualTime = DateTime.Now,
                        EndTime = null,
                        TreeRoute = "{}",//treeRouting.Json(),
                        EventStatus = McWorkEventStatus.ACTIVE_RECEIVE,
                        Status = EntityStatus.ACTIVE
                    };
                    DataADO.GetInstant().Insert<act_McWork>(mcWork, this.BuVO);
                }
            });
        }

        protected override void OnStop()
        {
        }
    }
}
