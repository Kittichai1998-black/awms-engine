using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;

using ADO.WMSStaticValue;
using AWMSEngine.Common;
using AMSModel.Constant.EnumConst;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using iTextSharp.text.pdf;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Document
{
    public class CloseDocumentManual : BaseEngine<CloseDocumentManual.TReq, List<amt_Document>>
    {
        public class TReq
        {
            public List<long> docIDs;
            public string remark;
        }



        protected override List<amt_Document> ExecuteEngine(TReq reqVO)
        {
            return null;
        }

    }
}
