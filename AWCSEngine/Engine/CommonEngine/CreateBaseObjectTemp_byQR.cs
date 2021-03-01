using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWCSEngine.Engine.CommonEngine;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine.CommonEngine
{
    public class CreateBaseObjectTemp_byQR : BaseCommonEngine<CreateBaseObjectTemp_byQR.TReq, act_BaseObject>
    {
        public class TReq
        {
            public long McObject_ID;
            public string LabelData;
        }
        public CreateBaseObjectTemp_byQR(string logref,VOCriteria buVO) : base(logref,buVO)
        {
        }

        protected override act_BaseObject ExecuteChild(CreateBaseObjectTemp_byQR.TReq req)
        {
            var mcRun = Controller.McRuntimeController.GetInstant().GetMcRuntime(req.McObject_ID);
            act_BaseObject baseObj = ADO.WCSDB.BaseObjectADO.GetInstant().GetByMcObject(req.McObject_ID, this.BuVO);
            if (baseObj != null)
                throw new AMWException(this.Logger, AMWExceptionCode.V0_BASE_DUPLICATE, mcRun.Code);
            string baseCode;
            do
            {
                baseCode = (DataADO.GetInstant().NextNum("base_no", false, this.BuVO) % (10 ^ 10)).ToString();
            } while (DataADO.GetInstant().SelectByCodeActive<act_BaseObject>("", this.BuVO) == null);
            
            baseObj = new act_BaseObject()
            {
                ID = null,
                Code = baseCode,
                LabelData = req.LabelData,
                EventStatus = BaseObjectEventStatus.TEMP,
                Status = EntityStatus.ACTIVE
            };

            baseObj.ID = DataADO.GetInstant().Insert<act_BaseObject>(baseObj, this.BuVO);
            return baseObj;

        }
    }
}
