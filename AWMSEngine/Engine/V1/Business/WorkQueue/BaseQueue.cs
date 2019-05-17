using AMWUtil.Common;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.WorkQueue
{
    public abstract class BaseQueue<TReq, TRes> : BaseEngine<TReq, TRes>
        where TRes : class
    {
        public void ValidateObjectSizeLimit(StorageObjectCriteria mapsto)
        {
            var validMapsto =
                (mapsto.parentID.HasValue) ?
                ADO.StorageObjectADO.GetInstant().Get(mapsto.id.Value, mapsto.type, true, true, this.BuVO) :
                mapsto;

            new Engine.Validation.ValidateObjectSizeLimit().Execute(this.Logger, this.BuVO, validMapsto);
        }

        public WorkQueueCriteria GenerateResponse(StorageObjectCriteria mapsto, SPworkQueue queueTrx)
        {
            var sou_lm = ADO.DataADO.GetInstant()
                .SelectByID<ams_AreaLocationMaster>(queueTrx.Sou_AreaLocationMaster_ID, this.BuVO);

            var des_lm = ADO.DataADO.GetInstant()
                .SelectByID<ams_AreaLocationMaster>(queueTrx.Des_AreaLocationMaster_ID, this.BuVO);

            var pre_lm = ADO.DataADO.GetInstant()
                .SelectByID<ams_AreaLocationMaster>(queueTrx.AreaLocationMaster_ID, this.BuVO);

            //var baseInfo = ADO.StorageObjectADO.GetInstant().Get(queueTrx.StorageObject_ID.Value, StorageObjectType.BASE, false, true, this.BuVO);

            var res = new WorkQueueCriteria()
            {
                souWarehouseCode =
                this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == queueTrx.Sou_Warehouse_ID).Code,
                souAreaCode =
                this.StaticValue.AreaMasters.FirstOrDefault(x => x.ID == queueTrx.Sou_AreaMaster_ID).Code,
                souLocationCode = sou_lm == null ? null : sou_lm.Code,

                desWarehouseCode = this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == queueTrx.Des_Warehouse_ID).Code,
                desAreaCode = this.StaticValue.AreaMasters.FirstOrDefault(x => x.ID == queueTrx.Des_AreaMaster_ID).Code,
                desLocationCode = des_lm == null ? null : des_lm.Code,

                queueID = queueTrx.ID,
                baseInfo = new WorkQueueCriteria.BaseInfo()
                {
                    id = mapsto.id.Value,
                    baseCode = mapsto.code,
                    packInfos = mapsto.ToTreeList()
                    .Where(x => x.type == StorageObjectType.PACK)
                    .Select(x => new WorkQueueCriteria.BaseInfo.PackInfo()
                    {
                        code = x.code,
                        qty = x.qty,
                        unti = x.unitCode,
                        baseQty = x.baseQty,
                        baseUnit = x.baseUnitCode,
                        batch = x.batch,
                        lot = x.lot,
                        orderNo = x.orderNo,
                        prodDate = x.productDate,
                    })
                    .ToList()
                },
                warehouseCode = queueTrx.Warehouse_ID == 0 ? "" :
                this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == queueTrx.Warehouse_ID).Code,
                areaCode = queueTrx.AreaMaster_ID == 0 ? "" :
                this.StaticValue.AreaMasters.FirstOrDefault(x => x.ID == queueTrx.AreaMaster_ID).Code,
                locationCode = pre_lm == null ? null : pre_lm.Code,
                queueParentID = queueTrx.Parent_WorkQueue_ID == null ? null : queueTrx.Parent_WorkQueue_ID,
                queueRefID = queueTrx.RefID == null ? null : queueTrx.RefID,
                queueStatus = queueTrx.EventStatus,
                seq = queueTrx.Seq
            };

            return res;
        }
    }
}
