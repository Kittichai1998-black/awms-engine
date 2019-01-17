using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;

namespace AWMSEngine.Engine.Business.Received
{
    public class WCSMappingPallet : BaseEngine<WCSMappingPallet.TReq, StorageObjectCriteria>
    {
        public class TReq
        {
            public decimal? actualWeiKG;
            public List<PalletDataCriteria> palletData;
        }

        protected override StorageObjectCriteria ExecuteEngine(TReq reqVO)
        {
            var scanmapsto = new ScanMapStoNoDoc();

            StorageObjectCriteria mapsto = null;
            foreach (var row in reqVO.palletData)
            {
                //long unitID = this.StaticValue.UnitTypes.First(x => x.Code == row.unit).ID;
                mapsto = scanmapsto.Execute(this.Logger, this.BuVO, new ScanMapStoNoDoc.TReq()
                {
                    scanCode = row.code,
                    orderNo = row.orderNo,
                    batch = row.batch,
                    lot = row.lot,
                    unitCode = row.unit,
                    amount = row.qty.Get<decimal>(),
                    mode = VirtualMapSTOModeType.REGISTER,
                    action = VirtualMapSTOActionType.ADD,
                    options = row.source,
                    mapsto = mapsto,
                    warehouseID = this.StaticValue.Warehouses.FirstOrDefault(x => x.Code == row.warehouseCode).ID,
                    areaID = this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == row.areaCode).ID,
                });
            }

            this.SetWeiChild(mapsto, reqVO.actualWeiKG ?? 0);

            return mapsto;
        }

        public void SetWeiChild(StorageObjectCriteria mapsto, decimal totalWeiKG)
        {
            var stoTreeList = mapsto.ToTreeList();
            var packMasters = ADO.DataADO.GetInstant().SelectBy<ams_PackMaster>(
                new SQLConditionCriteria(
                    "ID",
                    string.Join(',', stoTreeList.Where(x => x.type == StorageObjectType.PACK).Select(x => x.mstID.Value).Distinct().ToArray()),
                    SQLOperatorType.IN),
                this.BuVO);
            var baseMasters = ADO.DataADO.GetInstant().SelectBy<ams_BaseMaster>(
                new SQLConditionCriteria(
                    "ID",
                    string.Join(',', stoTreeList.Where(x => x.type == StorageObjectType.BASE).Select(x => x.mstID.Value).Distinct().ToArray()),
                    SQLOperatorType.IN),
                this.BuVO);
            //*****SET WEI CODING

            mapsto.weiKG = totalWeiKG;
            var innerTotalWeiKG = totalWeiKG - (baseMasters.First(x => x.ID == mapsto.mstID).WeightKG.Value);

            List<decimal> precenFromTotalWeis = new List<decimal>();
            decimal totalWeiStd = packMasters
                .Sum(x => 
                    (x.WeightKG ?? 0) * 
                    mapsto.mapstos.Where(y => y.type == StorageObjectType.PACK && y.mstID == x.ID).Sum(y => y.qty));

            mapsto.mapstos.FindAll(x=> x.type == StorageObjectType.PACK).ForEach(sto =>
            {
                decimal percentWeiStd =
                (
                    packMasters.First(x => x.ID == sto.mstID).WeightKG.Value *
                    sto.qty
                ) / totalWeiStd;
                sto.weiKG = percentWeiStd * innerTotalWeiKG;
            });

            stoTreeList.ForEach(x =>
            {
                ADO.StorageObjectADO.GetInstant().PutV2(x, BuVO);
            });
        }
    }
}
