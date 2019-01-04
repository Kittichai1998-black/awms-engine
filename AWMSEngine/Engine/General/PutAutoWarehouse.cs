using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.General
{
    public class PutAutoWarehouse : BaseEngine<PutAutoWarehouse.TReq,AWMSModel.Criteria.NullCriteria>
    {
        public class TReq
        {
            public List<TCodeName> datas;
            public class TCodeName : CodeNameCriteria
            {
                public string BranchCode;
            }
        }
        protected override NullCriteria ExecuteEngine(TReq reqVO)
        {

            var otherWarehouses = reqVO.datas
                .GroupBy(x => new { warehouseCode = x.Code, warehouseName = x.Name, branchCode = x.BranchCode })
                .Where(x => !ADO.StaticValue.StaticValueManager.GetInstant().Warehouses.Any(y => y.Code == x.Key.warehouseCode))
                .ToList();

            if (otherWarehouses.Count > 0)
            {
                new PutMaster<ams_Warehouse>().Execute(this.Logger, this.BuVO,
                    new PutMaster<ams_Warehouse>.TReq()
                    {
                        datas = otherWarehouses.Select(x =>
                                                        new ams_Warehouse()
                                                        {
                                                            Code = x.Key.warehouseCode,
                                                            Name = x.Key.warehouseName,
                                                            Branch_ID = ADO.StaticValue.StaticValueManager.GetInstant().Branchs.First(y => y.Code == x.Key.branchCode).ID,
                                                            Status = EntityStatus.ACTIVE
                                                        }).ToList(),
                        whereFields = new List<string>() { "Code" }
                    });
                ADO.StaticValue.StaticValueManager.GetInstant().LoadWarehouse(this.BuVO);
            }

            return null;
        }

    }
}
