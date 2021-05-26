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
    public class SCE04_StockComparision_Engine : AWMSEngine.Engine.BaseEngine<TREQ_Stock_Comparision, TRES__return>
    {
        protected override TRES__return ExecuteEngine(TREQ_Stock_Comparision reqVO)
        {
            reqVO.RECORD.LINE.ForEach(x =>
            {
                exec(x);
            });

            return new TRES__return();
        }
        private void exec(TREQ_Stock_Comparision.TRecord.TLine req)
        {
        }
    }
}
