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
            return;
            var mcRC8_2 = McController.GetMcRuntime("RC8-2");
            var mcSRM11 = McController.GetMcRuntime("SRM11");
            var mcSHU19 = McController.GetMcRuntime("SHU#19");
            if (mcRC8_2.McObj.DV_Pre_Status == 98)//ยืนยัน CV-PD รับพาเลทเข้า
            {
                var mcWork = McWorkADO.GetInstant().GetByCurLocation(mcRC8_2.Cur_Location.ID.Value,this.BuVO);
                var bObj = BaseObjectADO.GetInstant().GetByID(mcWork.BaseObject_ID,this.BuVO);
                if (mcWork != null)
                {
                    mcRC8_2.PostCommand(McCommandType.CM_1,
                        ListKeyValue<string, object>
                        .New("Set_PalletID", bObj.Code),
                        (mc) => { });
                }
            }
            else if(mcRC8_2.McObj.DV_Pre_Status == 4)//รอ SRM รับพาเลทเข้า
            {
                var mcWork = McWorkADO.GetInstant().GetByCurLocation(mcRC8_2.Cur_Location.ID.Value, this.BuVO);
                if (mcSRM11.McObj.DV_Pre_Status == 90)
                {
                    if (mcSHU19.Cur_Location.Code.Substring(3, 6) !=
                        this.StaticValue.GetLocation(mcWork.Des_Location_ID.Value).Code.Substring(3, 6))
                    //ถ้า Bay นั้น ไม่มี Pallet Shuttle ให้ย้ายพาเลท Shuttle ก่อน
                    {
                        if (mcSHU19.McObj.DV_Pre_Status == 90)
                        {
                            if (mcSHU19.Cur_Location.GetBay() == 2)//พาเลท shuttle มาถึงปลายทาง zone in ให้ปิดการทำงาน
                            {
                                mcSHU19.PostCommand(McCommandType.CM_60, (mc) => { });
                            }
                            else//สั่ง พาเลท shuttle มาถึงปลายทาง zone in
                            {
                                mcSHU19.PostCommand(McCommandType.CM_62, (mc) => {
                                    if (mc.EventStatus == McObjectEventStatus.DONE)
                                    {
                                    }
                                });
                            }
                        }
                        else if (mcSHU19.McObj.DV_Pre_Status == 82)//พาเลท shuttle หยุดทำงาน พร้อม ย้าย
                        {
                            mcSRM11.PostCommand(McCommandType.CM_1,
                                ListKeyValue<string, object>
                                .New("Set_SouLoc", "")
                                .Add("Set_DesLoc", "")
                                .Add("Set_Unit", "3")
                                .Add("Set_PalletID", ""),
                                (mc) => { });
                        }
                    }
                    else
                    {
                        mcSRM11.PostCommand(McCommandType.CM_1,
                            ListKeyValue<string, object>
                            .New("Set_SouLoc", "")
                            .Add("Set_DesLoc", "")
                            .Add("Set_Unit", "1")
                            .Add("Set_PalletID", ""),
                            (mc) => { });
                    }
                }
            }
        }
        private void OnRun_W08_del()
        {
            /*var mcGate_RC8_2 = McController.GetMcRuntime("RC8-2");
            if (mcGate_RC8_2.McObj.DV_Pre_Status == 4)
            {
                var baseObj = BaseObjectADO.GetInstant().GetByMcObject(mcGate_RC8_2.ID, this.BuVO);
                if (baseObj != null && baseObj.EventStatus == BaseObjectEventStatus.TEMP)
                {
                    var area = ADO.WCSDB.DataADO.GetInstant().SelectByID<acs_Area>(baseObj.Area_ID,this.BuVO);
                    var areaLocation = ADO.WCSDB.DataADO.GetInstant().SelectByID<acs_Location>(baseObj.Location_ID, this.BuVO);
                    var warehouse = ADO.WCSDB.DataADO.GetInstant().SelectByID<acs_Warehouse>(area.Warehouse_ID, this.BuVO);

                    var desAreaLocation = ADO.WMSDB.DataADO.GetInstant().SelectBy<acs_Location>(
                        new SQLConditionCriteria[] {
                            new SQLConditionCriteria("Code",AMWUtil.Common.ObjectUtil.QryStrGetValue(baseObj.Options,OptionVOConst.OPT_DES_LOCATION), SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("Status",1,SQLOperatorType.EQUALS)
                        }, this.BuVO).FirstOrDefault();

                    var desArea = ADO.WCSDB.DataADO.GetInstant().SelectByID<acs_Area>(desAreaLocation.Area_ID, this.BuVO);
                    var desWarehouse = ADO.WCSDB.DataADO.GetInstant().SelectByID<acs_Warehouse>(desArea.Warehouse_ID, this.BuVO);

                    RequestRegisterWQCriteria data_req = new RequestRegisterWQCriteria()
                    {
                        baseCode = baseObj.Code,
                        ioType = IOType.INBOUND,
                        weight = null,
                        height = null,
                        width = null,
                        length = null,
                        warehouseCode = warehouse.Code,
                        areaCode = area.Code,
                        locationCode = areaLocation.Code,
                        desWarehouseCode = desWarehouse.Code,
                        desAreaCode = desArea.Code,
                        desLocationCode = desAreaLocation.Code,
                        autoDoc = false,
                        barcode_pstos = baseObj.LabelData.Split(',').ToList(),
                        forCustomerCode = null,
                        options = null,
                        actualTime = DateTime.Now

                    };
                    var dr = RESTFulAccess.SendJson<dynamic>(
                        this.Logger, StaticValueManager.GetInstant().GetConfigValue("wms.api_url.register_wq"),
                        RESTFulAccess.HttpMethod.POST,
                        data_req);
                    if (dr._result.status == 1)
                    {
                        WorkQueueCriteria res = ObjectUtil.Cast2<WorkQueueCriteria>(dr);
                        new CommonEngine.RegisterMcQueueInbound(this.LogRefID, this.BuVO)
                            .Execute(new CommonEngine.RegisterMcQueueInbound.TReq()
                            {
                                wqID = res.queueID.Value,
                                //souLocCode = res.souLocationCode,
                                //desLocCode = res.desLocationCode
                            });
                    }
                    else
                    {
                        mcGate_RC8_2.PostError("WMS : " + dr._result.message);
                    }

                }
                else if (baseObj != null && baseObj.EventStatus == BaseObjectEventStatus.IDLE)
                {
                    var mcSRM_11 = McController.GetMcRuntime("SRM11");
                    mcSRM_11.PostCommand(McCommandType.CM_21,
                        new ListKeyValue<string, object>()
                            .Add("sou", mcGate_RC8_2.Cur_Location.Code)
                            .Add("des", "001002003"),
                            (status) =>
                            {
                                if (status.EventStatus == McObjectEventStatus.DONE)
                                {
                                    baseObj.Location_ID = 111;
                                    DataADO.GetInstant().UpdateBy<act_BaseObject>(baseObj, this.BuVO);
                                }
                            }
                        );
                }
            }*/
     
        
        }

        protected override void OnStop()
        {
        }
    }
}
