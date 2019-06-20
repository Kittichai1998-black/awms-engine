using AMWUtil.Exception;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectMRK.Engine.Business.WorkQueue
{
    public class GetPackByPalletCode : BaseEngine<string, GetPackByPalletCode.Tres>
    {
        public class Tres
        {
            public string palletCode;
            public string packCode;
            public string unitCode;
            public string batch;
        }

        protected override Tres ExecuteEngine(string reqVO)
        {
            var sto = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amv_PalletCode_RP>(new SQLConditionCriteria[]
            {
                new SQLConditionCriteria("BaseCode", reqVO, SQLOperatorType.EQUALS)
            }, this.BuVO).FirstOrDefault();

            if (sto == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Pallet " + reqVO + " Not Found");

            var res = new Tres()
            {
                palletCode = sto.BaseCode,
                packCode = sto.PackCode,
                unitCode = sto.UnitCode,
                batch = sto.Batch,
            };

            return res;
        }
    }
}
