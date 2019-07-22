using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectTAP.Engine.Business.Crossdock
{
    public class ClosedCrossDock : BaseEngine<long, string>
    {
        protected override string ExecuteEngine(long reqVO)
        {
            var DocumentADO = AWMSEngine.ADO.DocumentADO.GetInstant();
            var getGRDoc = DocumentADO.Get(reqVO, this.BuVO);
            var getGIDoc = DocumentADO.Get(getGRDoc.ParentDocument_ID.Value, this.BuVO);

            DocumentADO.UpdateStatusToChild(getGRDoc.ID.Value, null, null, DocumentEventStatus.CLOSED, this.BuVO);
            DocumentADO.UpdateStatusToChild(getGIDoc.ID.Value, null, null, DocumentEventStatus.CLOSED, this.BuVO);

            return null;
        }
    }
}
