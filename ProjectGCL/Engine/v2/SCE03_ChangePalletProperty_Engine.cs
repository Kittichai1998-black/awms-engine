using ADO.WMSDB;
using ADO.WMSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria.SP.Response;
using AMSModel.Entity;
using AMWUtil.Common;
using ProjectGCL.GCLModel.Criterie;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.Engine.v2
{
    public class SCE03_ChangePalletProperty_Engine : AWMSEngine.Engine.BaseEngine<TREQ_Change_Pallet_Property, TRES__return>
    {
        protected override TRES__return ExecuteEngine(TREQ_Change_Pallet_Property reqVO)
        {
            reqVO.RECORD.LINE.ForEach(x =>
            {
                this.exec(x);
            });

            return new TRES__return();
        }
        private void exec(TREQ_Change_Pallet_Property.TRecord.TLine req)
        {
            req.Pallet_Detail.ForEach(pl =>
            {
                Dapper.DynamicParameters datas = new Dapper.DynamicParameters();
                datas.Add("@sku_from", pl.SKU_FROM);
                datas.Add("@lot_from", pl.LOT);
                datas.Add("@itemno_from", pl.PALLET_NO);
                datas.Add("@udcode_from", pl.UD_CODE_FROM);

                datas.Add("@sku_to", req.SKU_TO);
                datas.Add("@lot_to", req.LOT_TO);
                datas.Add("@udcode_to", req.UD_CODE_TO);

                DataADO.GetInstant().QuerySP("SP_SCE03_ChangePalletProperty", datas, BuVO);
            });
        }
    }
}
