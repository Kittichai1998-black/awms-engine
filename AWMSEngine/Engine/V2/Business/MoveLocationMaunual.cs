using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.Engine.V2.Business.Issued;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSEngine.Engine.V2.Validation;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static AWMSEngine.Engine.V2.Business.WorkQueue.ASRSProcessQueue.TReq;

namespace AWMSEngine.Engine.V2.Business
{
    public class MoveLocationMaunual : BaseEngine<MoveLocationMaunual.TDocReq, MoveLocationMaunual.TDocRes>
    {
        public class TDocReq
        {
            public long Mode;
            public string PalletCode;
            public string SouLocationCode;
            public long DesLocationID;
            public long bstosID;
        }
        public class TDocRes
        {
            public StorageObjectCriteria data;
        }

        protected override TDocRes ExecuteEngine(TDocReq reqVO)
        {
            TDocRes res = new TDocRes();
            StorageObjectCriteria data = new StorageObjectCriteria();
            var sto = ADO.StorageObjectADO.GetInstant().Get(reqVO.bstosID, StorageObjectType.BASE, false, true, this.BuVO);
            new ValidateObjectSizeLimit().Execute(this.Logger, this.BuVO, sto);

            var SouAreaLocation = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                                new KeyValuePair<string,object>("Code",reqVO.SouLocationCode),
                                new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO).FirstOrDefault();

            if (reqVO.Mode == 0) // AMS Only
            {
                
                data = ADO.StorageObjectADO.GetInstant().UpdateLocationToChild(sto, reqVO.DesLocationID, this.BuVO);
            }
            else
            {
                var wq = this.mapWorkQueue(this.Logger, SouAreaLocation, reqVO, sto, this.BuVO);
                var disto = this.mapDisto(this.Logger, wq, sto, this.BuVO);

                data = ADO.StorageObjectADO.GetInstant().Get(reqVO.bstosID, StorageObjectType.BASE, false, true, this.BuVO);
            };

            res.data = data;

            return res;
        }
        private amt_WorkQueue mapWorkQueue(AMWLogger logger, ams_AreaLocationMaster SouAreaLocation, TDocReq reqVO,StorageObjectCriteria sto, VOCriteria buVO)
        {

            var area = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<ams_AreaMaster>(reqVO.DesLocationID, this.BuVO);
            var wq = new amt_WorkQueue() { 
                IOType = IOType.OUTPUT,
                StorageObject_ID = sto.id.Value,
                StorageObject_Code = sto.code,
                Sou_Warehouse_ID= sto.warehouseID,
                Sou_Area_ID= sto.areaID.Value,
                Sou_AreaLocation_ID = SouAreaLocation.ID,
                Des_Warehouse_ID = area.Warehouse_ID.Value,
                Des_Area_ID = area.ID.Value,
                Des_AreaLocation_ID = reqVO.DesLocationID,
                Priority = 2,
                EventStatus = WorkQueueEventStatus.NEW,
                Status = EntityStatus.ACTIVE          
            };

            var wqData = ADO.WorkQueueADO.GetInstant().PUT(wq, this.BuVO);

            return wqData;
        }
        private amt_DocumentItemStorageObject mapDisto(AMWLogger logger,amt_WorkQueue wq, StorageObjectCriteria sto, VOCriteria buVO)
        {
            var disto = new amt_DocumentItemStorageObject()
            {
                ID = null,
                DocumentItem_ID = null,
                Sou_StorageObject_ID = sto.id.Value,
                Des_StorageObject_ID = sto.id.Value,
                Quantity = sto.qty,
                WorkQueue_ID = wq.ID,
                BaseQuantity = sto.baseQty,
                UnitType_ID = sto.unitID,
                BaseUnitType_ID = sto.baseUnitID,
                Status = EntityStatus.ACTIVE
            };

            var distoData =  AWMSEngine.ADO.DistoADO.GetInstant().Insert(disto, buVO);
            return distoData;
        }

    }
}
