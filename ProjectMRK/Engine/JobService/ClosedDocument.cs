using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;

namespace ProjectMRK.Engine.JobService
{
    public class ClosedDocument : BaseEngine<string, string>
    {
        protected override string ExecuteEngine(string reqVO)
        {
            var docsList = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_Document>(new SQLConditionCriteria[]{
                new SQLConditionCriteria("EventStatus", DocumentEventStatus.WORKING, SQLOperatorType.EQUALS),
                new SQLConditionCriteria("DocumentType_ID", DocumentTypeID.GOODS_RECEIVED, SQLOperatorType.EQUALS),
            }, this.BuVO);
            docsList.ForEach(doc =>
            {
                var distoStatus = true;
                var docItems = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(doc.ID.Value, this.BuVO);
                docItems.ForEach(docItem =>
                {
                    distoStatus = docItem.DocItemStos.Any(disto => disto.Status == EntityStatus.INACTIVE);
                });
                if (!distoStatus)
                {
                    AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(doc.ID.Value, DocumentEventStatus.WORKING, null, DocumentEventStatus.WORKED, this.BuVO);
                }
            });
            return null;
        }
    }
}
