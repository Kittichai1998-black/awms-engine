using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
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
