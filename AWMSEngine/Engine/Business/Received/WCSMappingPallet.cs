using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;

namespace AWMSEngine.Engine.Business.Received
{
    public class WCSMappingPallet : BaseEngine<WCSMappingPallet.TReq, StorageObjectCriteria>
    {
        public class TReq
        {
            public List<PalletDataCriteria> palletData;
        }

        protected override StorageObjectCriteria ExecuteEngine(TReq reqVO)
        {
            var scanmapsto = new ScanMapStoNoDoc();

            StorageObjectCriteria mapsto = null;
            foreach (var row in reqVO.palletData)
            {
                mapsto = scanmapsto.Execute(this.Logger, this.BuVO, new ScanMapStoNoDoc.TReq()
                {
                    scanCode = row.code,
                    batch = row.batch,
                    amount = Convert.ToInt32(row.qty),
                    mode = VirtualMapSTOModeType.REGISTER,
                    action = VirtualMapSTOActionType.ADD,
                    options = row.source,
                    mapsto = mapsto,
                    warehouseID = this.StaticValue.Warehouses.FirstOrDefault(x => x.Code == row.warehouseCode).ID,
                    areaID = this.StaticValue.AreaMasters.FirstOrDefault(x => x.Code == row.areaCode).ID,
                });
            }
            return mapsto;
        }
    }
}
