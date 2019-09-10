using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using AMWUtil.Exception;
using System.Threading.Tasks;
using AMWUtil.Common;
using AWMSEngine.Common;
using Microsoft.CodeAnalysis.Scripting;


namespace AWMSEngine.Engine.V2.Business.Picking
{
    public class TestPick : BaseEngine<TestPick.TReq, List<amt_DocumentItemStorageObject>>
    {
        public class TReq
        {
            public long docIDs;
        }
        protected override List<amt_DocumentItemStorageObject> ExecuteEngine(TReq reqVO)
        {
            var res = this.ExectProject<TReq, List<amt_DocumentItemStorageObject>>(FeatureCode.EXEPJ_MappingDistoLD, reqVO);
            return null;
        }
    }
}