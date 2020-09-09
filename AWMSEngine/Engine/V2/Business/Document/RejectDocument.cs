using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Common;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using iTextSharp.text.pdf;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Document
{
    public class RejectDocument : BaseEngine<RejectDocument.TReq, RejectDocument.TRes>
    {
        public class TReq
        {
            public List<long> docIDs;
            public string remark;
            public string docType;
        }

        public class TRes
        {
            public List<amt_Document> documents;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {

            return null;
        }
    }
}
