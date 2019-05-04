using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectTAP.ADO
{
    public class DocumentADO: AWMSEngine.ADO.BaseMSSQLAccess<DocumentADO>
    {
        public List<amt_DocumentItem> ListDocsItemCheckRerigter(String code, DateTime prodDate, long? qty,string itemNo, VOCriteria buVO)
        {
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("code", code);
            param.Add("prodDate", prodDate);
            param.Add("qty", qty);
            param.Add("itemNo", itemNo);
            var res = this.Query<amt_DocumentItem>("SP_DOCITEM_CHECK_REGISTER", System.Data.CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction).ToList();
            return res;
        }

    }
}
