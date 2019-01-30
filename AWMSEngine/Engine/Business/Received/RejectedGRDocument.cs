using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Received
{
    public class RejectedGRDocument : BaseEngine<RejectedGRDocument.TDocReq, RejectedGRDocument.TDocRes>
    {

        public class TDocReq
        {
            public List<long> docIDs;
        }
        public class TDocRes
        {
            public List<amt_Document> documents;
        }

        protected override TDocRes ExecuteEngine(TDocReq reqVO)
        {
            var docs = ADO.DocumentADO.GetInstant().ListAndItem(reqVO.docIDs, this.BuVO);
            //if(docs.TrueForAll(x=>x.))
            foreach (var doc in docs)
            {
                //if(
            }
            return null;
        }

    }
}
