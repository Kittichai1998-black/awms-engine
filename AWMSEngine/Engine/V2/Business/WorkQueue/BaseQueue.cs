using AMWUtil.Common;
using ADO.WMSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Criteria.SP.Request;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public abstract class BaseQueue<TReq, TRes> : BaseEngine<TReq, TRes>
        where TRes : class
    {
        public void ValidateObjectSizeLimit(StorageObjectCriteria mapsto)
        {
            var validMapsto =
                (mapsto.parentID.HasValue) ?
                ADO.WMSDB.StorageObjectADO.GetInstant().Get(mapsto.id.Value, mapsto.type, true, true, this.BuVO) :
                mapsto;

            new Engine.V2.Validation.ValidateObjectSizeLimit().Execute(this.Logger, this.BuVO, validMapsto);
        }
        public WorkQueueCriteria GenerateResponse(StorageObjectCriteria sto, SPworkQueue queueTrx, VOCriteria buVO, StaticValueManager staticValue)
        {
            this.BuVO = buVO;
            this.StaticValue = staticValue;
            return this.GenerateResponse(sto, queueTrx);
        }

        public WorkQueueCriteria GenerateResponse(StorageObjectCriteria sto, SPworkQueue queueTrx)
        {
            var sku = ADO.WMSDB.DataADO.GetInstant().SelectByID<ams_SKUMaster>(sto.skuID.Value, this.BuVO);

            var sou_lm = ADO.WMSDB.DataADO.GetInstant()
                .SelectByID<ams_AreaLocationMaster>(queueTrx.Sou_AreaLocationMaster_ID, this.BuVO);

            var des_lm = ADO.WMSDB.DataADO.GetInstant()
                .SelectByID<ams_AreaLocationMaster>(queueTrx.Des_AreaLocationMaster_ID, this.BuVO);

            var pre_lm = ADO.WMSDB.DataADO.GetInstant()
                .SelectByID<ams_AreaLocationMaster>(queueTrx.AreaLocationMaster_ID, this.BuVO);

            //var baseInfo = ADO.WMSDB.StorageObjectADO.GetInstant().Get(queueTrx.StorageObject_ID.Value, StorageObjectType.BASE, false, true, this.BuVO);

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
                    id = sto.id.Value,
                    baseCode = sto.code,
                    packInfos = sto.ToTreeList()
                    .Where(x => x.type == StorageObjectType.PACK)
                    .Select(x => new WorkQueueCriteria.BaseInfo.PackInfo()
                    {
                        code = x.code,
                        qty = x.qty,
                        unit = x.unitCode,
                        baseQty = x.baseQty,
                        baseUnit = x.baseUnitCode,
                        batch = x.batch,
                        lot = x.lot,
                        orderNo = x.orderNo,
                        prodDate = x.productDate,
                        Info1 = sku.Info1,
                        Info2 = sku.Info2,
                        Info3 = sku.Info3,
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
                seqGroup = ADO.WMSDB.DataADO.GetInstant().NextNum("WqSeqGroup", false, this.BuVO),
                seqItem = 0
            };

            return res;
        }
    }
}
