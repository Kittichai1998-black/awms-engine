using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Common;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectTMC.Engine.WorkQueue
{
    public class MappingPallet : BaseEngine<MappingPallet.TReq, StorageObjectCriteria>
    {
        public class TReq
        {
            public decimal? actualWeiKG;
            public string warehouseCode;//รหัสคลังสินค้า
            public string areaCode;//รหัสโซน
            public List<PalletDataCriteriaV2> palletData;
        }

        protected override StorageObjectCriteria ExecuteEngine(TReq reqVO)
        {
            var scanmapsto = new ScanMapStoNoDoc();

            StorageObjectCriteria mapsto = null;
            StorageObjectCriteria sto = null;

            foreach (var row in reqVO.palletData)
            {
                //long unitID = this.StaticValue.UnitTypes.First(x => x.Code == row.unit).ID;

                ams_PackMaster pm = AWMSEngine.ADO.MasterADO.GetInstant().GetPackMasterByPack(row.code, this.BuVO);
                if (pm == null) //pack
                {
                    
                    mapsto = scanmapsto.Execute(this.Logger, this.BuVO, new ScanMapStoNoDoc.TReq()
                    {
                        scanCode = row.code,
                        orderNo = row.orderNo,
                        batch = row.batch,
                        lot = row.lot,
                        unitCode = row.unit,
                        amount = row.qty.Value,
                        mode = VirtualMapSTOModeType.REGISTER,
                        action = VirtualMapSTOActionType.ADD,
                        options = row.options,
                        warehouseID = this.StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode).ID,
                        areaID = this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode).ID,
                        productDate = row.prodDate == null ? (DateTime?)null : Convert.ToDateTime(row.prodDate),
                    });
                }
                else
                {
                    sto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(mapsto.code, null, null, false, true, this.BuVO);
                    mapsto = scanmapsto.Execute(this.Logger, this.BuVO, new ScanMapStoNoDoc.TReq()
                    {
                        rootID = sto.id,
                        scanCode = row.code,
                        orderNo = row.orderNo,
                        batch = row.batch,
                        lot = row.lot,
                        unitCode = row.unit,
                        amount = row.qty.Value,
                        mode = VirtualMapSTOModeType.REGISTER,
                        action = VirtualMapSTOActionType.ADD,
                        options = row.options,
                        warehouseID = this.StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode).ID,
                        areaID = this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode).ID,
                        productDate = row.prodDate == null ? (DateTime?)null : Convert.ToDateTime(row.prodDate),
                    });
                }
               
            }

            //this.SetWeiChild(mapsto, reqVO.actualWeiKG ?? 0);

            return mapsto;
        }


    }
}
