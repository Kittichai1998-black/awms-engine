using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWCSEngine.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AWCSEngine.Controller
{
    public class QueueController : BaseController<QueueController>
    {

        public act_McWork Register_McQueueOutbound(long wqID, string baseCode, string desLocCode)
        {
            return
              ExecTrySQLTransaction<act_McWork>(() => {
                  var baseObj = ADO.WCSDB.BaseObjectADO.GetInstant().GetByCode(baseCode, this.BuVO);
                  if (baseObj == null)
                      throw new AMWException(this.Logger, AMWExceptionCode.V0_STO_NOT_FOUND, baseCode);
                  if (baseObj.EventStatus == BaseObjectEventStatus.IDEL)
                      throw new AMWException(this.Logger, AMWExceptionCode.V0_PALLET_STATUS_CANT_ISSUE, new string[] { baseCode, baseObj.EventStatus.ToString() });

                  var souLoc = StaticValueManager.GetInstant().GetLocation(baseObj.Location_ID);
                  var desLoc = StaticValueManager.GetInstant().GetLocation(desLocCode);
                  var treeRoute = LocationUtil.GetLocationRouteTree(baseObj.Location_ID, desLoc.ID.Value);
                  if (treeRoute == null)
                  {
                      throw new AMWException(this.Logger, AMWExceptionCode.V0_ROUTE_NOT_FOUND, new string[] { souLoc.Code, desLoc.Code });
                  }

                  act_McWork mcQ = new act_McWork()
                  {
                      ID = null,
                      BaseObject_ID = baseObj.ID.Value,
                      Sou_Area_ID = souLoc.Area_ID,
                      Sou_Location_ID = souLoc.ID.Value,
                      Des_Area_ID = desLoc.Area_ID,
                      Des_Location_ID = desLoc.ID.Value,
                      Area_ID = baseObj.Area_ID,
                      Location_ID = baseObj.Location_ID,
                      TreeRoute = treeRoute.Json(),
                      WMS_WorkQueue_ID = wqID,
                  };

                  mcQ.ID = ADO.WCSDB.DataADO.GetInstant().Insert<act_McWork>(mcQ, this.BuVO);

                  return mcQ;

              });

        }

        public act_BaseObject Create_NewBaseObject(RegisterBaseObjectCriteria baseObjC, string souLocCode)
        {

            return this.ExecTrySQLTransaction<act_BaseObject>(() =>
            {
                act_BaseObject baseObj = ADO.WCSDB.BaseObjectADO.GetInstant().GetByCode(baseObjC.Code, this.BuVO);
                if (baseObj != null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V0_BASE_DUPLICATE, baseObjC.Code);

                var souLoc = StaticValueManager.GetInstant().GetLocation(souLocCode);
                baseObj = new act_BaseObject()
                {
                    ID = null,
                    Code = baseObjC.Code,
                    Area_ID = souLoc.Area_ID,
                    Location_ID = souLoc.ID.Value,
                    Model = baseObjC.Model,
                    SkuCode = baseObjC.SkuCode,
                    SkuName = baseObjC.SkuName,
                    SkuQty = baseObjC.SkuQty,
                    SkuUnit = baseObjC.SkuUnit,
                    WeiKG = baseObjC.WeiKG,
                    LabelData = baseObjC.LabelData,
                    EventStatus = BaseObjectEventStatus.IDEL,
                };

                baseObj.ID = DataADO.GetInstant().Insert<act_BaseObject>(baseObj, this.BuVO);
                return baseObj;
            });
        }

        public act_McWork Register_McQueueInbound(long wqID, RegisterBaseObjectCriteria baseObjC, string souLocCode, string desLocCode)
        {
            return this.ExecTrySQLTransaction<act_McWork>(() => {
                act_BaseObject baseObj = ADO.WCSDB.BaseObjectADO.GetInstant().GetByCode(baseObjC.Code, this.BuVO);
                if (baseObj != null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V0_BASE_DUPLICATE, baseObjC.Code);

                var souLoc = StaticValueManager.GetInstant().GetLocation(souLocCode);
                var desLoc = StaticValueManager.GetInstant().GetLocation(desLocCode);
                this.Create_NewBaseObject(baseObjC, souLocCode);

                var treeRoute = LocationUtil.GetLocationRouteTree(souLocCode, desLocCode);
                act_McWork mcQ = new act_McWork()
                {
                    ID = null,
                    WMS_WorkQueue_ID = wqID,
                    Sou_Area_ID = souLoc.Area_ID,
                    Sou_Location_ID = souLoc.ID.Value,
                    Des_Area_ID = desLoc.Area_ID,
                    Des_Location_ID = desLoc.ID.Value,
                    Area_ID = souLoc.Area_ID,
                    Location_ID = souLoc.ID.Value,
                    BaseObject_ID = baseObj.ID.Value,
                    Status = EntityStatus.INACTIVE,
                    TreeRoute = treeRoute.Json()
                };
                mcQ.ID = DataADO.GetInstant().Insert<act_McWork>(mcQ, this.BuVO);
                return mcQ;
            });
        }
    }
}
