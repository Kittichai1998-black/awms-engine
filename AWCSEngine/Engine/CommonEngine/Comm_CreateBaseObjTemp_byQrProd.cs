using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWCSEngine.Engine.CommonEngine;
using AWCSEngine.Engine.McRuntime;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AWCSEngine.Engine.CommonEngine
{
    public class Comm_CreateBaseObjTemp_byQrProd : BaseCommonEngine<Comm_CreateBaseObjTemp_byQrProd.TReq, act_BaseObject>
    {
        public class TReq
        {
            public long McObject_ID;
            public string LabelData;
        }
        public Comm_CreateBaseObjTemp_byQrProd(string logref,VOCriteria buVO) : base(logref,buVO)
        {
        }

        protected override act_BaseObject ExecuteChild(Comm_CreateBaseObjTemp_byQrProd.TReq req)
        {
            var bo = BaseObjectADO.GetInstant().GetByLabel(req.LabelData,this.BuVO);
            if(bo != null)
            {
                if (bo.EventStatus == BaseObjectEventStatus.TEMP)
                {
                    return bo;
                }
                else
                {
                    throw new Exception("พาเลทอยู่ระหว่างรับเข้า ไม่สามารถรับเข้าซ้ำได้");
                }
            }

            BaseMcRuntime mcRun = Controller.McRuntimeController.GetInstant().GetMcRuntime(req.McObject_ID);
            act_BaseObject baseObj = ADO.WCSDB.BaseObjectADO.GetInstant().GetByMcObject(req.McObject_ID, this.BuVO);
            if (baseObj != null)
                throw new AMWException(this.Logger, AMWExceptionCode.V0_BASE_DUPLICATE, mcRun.Code);
            string baseCode;
            do
            {
                baseCode = (DataADO.GetInstant().NextNum("base_no", false, this.BuVO) % (Math.Pow( 10,10))).ToString("0000000000");
            } while (DataADO.GetInstant().SelectByCodeActive<act_BaseObject>(baseCode, this.BuVO) != null);

            var buWork = DataADO.GetInstant().SelectBy<act_BuWork>(
                ListKeyValue<string, object>
                .New("status", EntityStatus.ACTIVE)
                .Add("LabelData", req.LabelData),this.BuVO).FirstOrDefault();
            baseObj = new act_BaseObject()
            {
                ID = null,
                BuWork_ID = buWork==null?null: buWork.ID,
                Code = baseCode,
                Model = "N/A",
                McObject_ID = mcRun.ID,
                Warehouse_ID = mcRun.Cur_Area.Warehouse_ID,
                Area_ID = mcRun.Cur_Location.Area_ID,
                Location_ID = mcRun.Cur_Location.ID.Value,
                LabelData = req.LabelData,
                EventStatus = BaseObjectEventStatus.TEMP,
                Status = EntityStatus.ACTIVE
            };

            baseObj.ID = DataADO.GetInstant().Insert<act_BaseObject>(baseObj, this.BuVO);
            return baseObj;

        }
    }
}
