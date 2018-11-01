using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.WM
{
    public class ListPriceByRootID : BaseAPIService
    {
        public ListPriceByRootID(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            long rootStoID = this.RequestVO.rootStoID;
            int rootStoType = this.RequestVO.rootStoType;

            var mapsto = ADO.StorageObjectADO.GetInstant().Get(rootStoID, (StorageObjectType)rootStoType, false, true, this.BuVO);
            var packStos = mapsto.ToTreeList().FindAll(x => x.type == StorageObjectType.PACK).OrderBy(x => x.code);

            var packs = ADO.DataADO.GetInstant()
                .SelectBy<ams_PackMaster>(
                    "ID",
                    string.Join(',', packStos.GroupBy(x => x.mstID).Select(x => x.Key.Value).ToList()),
                    SQLOperatorType.IN,
                    this.BuVO);
            var skus = ADO.DataADO.GetInstant()
                .SelectBy<ams_SKUMaster>(
                    "ID",
                    string.Join(',', packs.Select(x => x.SKUMaster_ID).ToList()),
                    SQLOperatorType.IN,
                    this.BuVO);

            /*var packs = packStos
                .GroupBy(x => new { code = x.code, name = x.name, id = x.mstID })
                .Select(x => new { id = x.Key.id, code = x.Key.code, name = x.Key.name, qty = x.Count() });*/

            List<dynamic> res = new List<dynamic>();
            foreach (var p in packs)
            {
                decimal price = skus.First(x => x.ID == p.SKUMaster_ID).Price.Value;
                int qty = packStos.Count(x => x.mstID == p.ID);
                res.Add(new
                {
                    id = p.ID,
                    code = p.Code,
                    name = p.Name,
                    qty = qty,
                    price = price,
                    totalPrice = qty * price
                });
            }

            return new { datas = res };
        }
    }
}
